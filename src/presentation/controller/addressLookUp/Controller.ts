import { NextFunction, Request, Response } from "express";
import escape from "escape-html";
import { Address, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import AddressService from "../../../application/service/AddressService";
import addresssRouting, { AddressCacheKeys } from "./Routing";
import AbstractController from "../AbstractController";
import AddressLookUpPageType from "./PageType";
import CacheService from "../../../application/service/CacheService";
import { APPLICATION_CACHE_KEY, cookieOptions } from "../../../config/constants";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import UIErrors from "../../../domain/entities/UIErrors";
import { PageDefault, PageRouting, pageRoutingDefault } from "../PageRouting";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import PageType from "../PageType";
import { CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL } from "./url";
import { REVIEW_GENERAL_PARTNERS_URL } from "../registration/url";

class AddressLookUpController extends AbstractController {
  private static readonly LIMITED_PARTNERSHIP_POSTCODE_PAGES: Set<PageType | PageDefault> = new Set([
    AddressLookUpPageType.postcodeRegisteredOfficeAddress,
    AddressLookUpPageType.postcodePrincipalPlaceOfBusinessAddress
  ]);

  private static readonly LIMITED_PARTNERSHIP_MANUAL_PAGES: Set<PageType | PageDefault> = new Set([
    AddressLookUpPageType.enterRegisteredOfficeAddress,
    AddressLookUpPageType.enterPrincipalPlaceOfBusinessAddress
  ]);

  private static readonly MANUAL_PAGES: Set<PageType | PageDefault> = new Set([
    ...AddressLookUpController.LIMITED_PARTNERSHIP_MANUAL_PAGES,
    AddressLookUpPageType.enterGeneralPartnerUsualResidentialAddress,
    AddressLookUpPageType.enterGeneralPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.enterGeneralPartnerCorrespondenceAddress,
    AddressLookUpPageType.enterLimitedPartnerUsualResidentialAddress,
    AddressLookUpPageType.enterLimitedPartnerPrincipalOfficeAddress
  ]);

  private static readonly ADDRESS_LIST_REQUIRED_PAGES: Set<PageType | PageDefault> = new Set([
    AddressLookUpPageType.chooseRegisteredOfficeAddress,
    AddressLookUpPageType.choosePrincipalPlaceOfBusinessAddress,
    AddressLookUpPageType.chooseGeneralPartnerUsualResidentialAddress,
    AddressLookUpPageType.chooseGeneralPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.chooseGeneralPartnerCorrespondenceAddress,
    AddressLookUpPageType.chooseLimitedPartnerUsualResidentialAddress,
    AddressLookUpPageType.chooseLimitedPartnerPrincipalOfficeAddress
  ]);

  private static readonly GENERAL_PARTNER_ADDRESS_PAGES: Set<PageType | PageDefault> = new Set([
    AddressLookUpPageType.postcodeGeneralPartnerUsualResidentialAddress,
    AddressLookUpPageType.postcodeGeneralPartnerCorrespondenceAddress,
    AddressLookUpPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.enterGeneralPartnerUsualResidentialAddress,
    AddressLookUpPageType.enterGeneralPartnerCorrespondenceAddress,
    AddressLookUpPageType.enterGeneralPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.confirmGeneralPartnerUsualResidentialAddress,
    AddressLookUpPageType.confirmGeneralPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.confirmGeneralPartnerCorrespondenceAddress
  ]);

  private static readonly LIMITED_PARTNER_ADDRESS_PAGES: Set<PageType | PageDefault> = new Set([
    AddressLookUpPageType.postcodeLimitedPartnerUsualResidentialAddress,
    AddressLookUpPageType.postcodeLimitedPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.enterLimitedPartnerUsualResidentialAddress,
    AddressLookUpPageType.enterLimitedPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.confirmLimitedPartnerUsualResidentialAddress,
    AddressLookUpPageType.confirmLimitedPartnerPrincipalOfficeAddress
  ]);

  constructor(
    private readonly addressService: AddressService,
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly generalPartnerService: GeneralPartnerService,
    private readonly limitedPartnerService: LimitedPartnerService,
    private readonly cacheService: CacheService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(addresssRouting, pageType, request);

        let limitedPartnership = {};
        let generalPartner = {};
        let limitedPartner = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (ids.transactionId && ids.generalPartnerId) {
          generalPartner = await this.generalPartnerService.getGeneralPartner(
            tokens,
            ids.transactionId,
            ids.generalPartnerId
          );
        }

        if (ids.transactionId && ids.limitedPartnerId) {
          limitedPartner = await this.limitedPartnerService.getLimitedPartner(
            tokens,
            ids.transactionId,
            ids.limitedPartnerId
          );
        }

        const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

        const addressList = await this.getAddressList(pageRouting, cacheById, tokens);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(
            pageRouting,
            { limitedPartnership, generalPartner, limitedPartner, addressList, cache: { ...cacheById } },
            null
          )
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private async getAddressList(
    pageRouting: PageRouting,
    cache: Record<string, any>,
    tokens: { access_token: string; refresh_token: string }
  ): Promise<Address[]> {
    let addressList: Address[] = [];

    if (AddressLookUpController.ADDRESS_LIST_REQUIRED_PAGES.has(pageRouting.pageType)) {
      const cacheKey = pageRouting.data?.[AddressCacheKeys.addressCacheKey];
      const postcode = cache[cacheKey]?.postal_code;

      addressList = await this.addressService.getAddressListForPostcode(tokens, postcode);
    }

    return addressList;
  }

  postcodeValidation() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { tokens, ids } = super.extract(request);
        const { postal_code, premises } = request.body;
        const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
        const pageRouting = super.getRouting(addresssRouting, pageType, request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        const jurisdiction = AddressLookUpController.LIMITED_PARTNERSHIP_POSTCODE_PAGES.has(pageType)
          ? limitedPartnership?.data?.jurisdiction
          : undefined;

        const { address, errors } = await this.addressService.isValidUKPostcodeAndHasAnAddress(
          tokens,
          escape(postal_code),
          escape(premises),
          jurisdiction
        );

        if (errors?.hasErrors()) {
          let generalPartner;
          if (AddressLookUpController.GENERAL_PARTNER_ADDRESS_PAGES.has(pageType)) {
            generalPartner = await this.generalPartnerService.getGeneralPartner(
              tokens,
              ids.transactionId,
              ids.generalPartnerId
            );
          }

          let limitedPartner;
          if (AddressLookUpController.LIMITED_PARTNER_ADDRESS_PAGES.has(pageType)) {
            limitedPartner = await this.limitedPartnerService.getLimitedPartner(
              tokens,
              ids.transactionId,
              ids.limitedPartnerId
            );
          }

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership, generalPartner, limitedPartner, ...request.body },
              errors
            )
          );
          return;
        }

        this.addAddressToCache(request, response, pageType, ids.transactionId, address);

        // if exact match - redirect to confirm page
        if (address?.postal_code && address?.premises && address?.address_line_1) {
          const url = super.insertIdsInUrl(pageRouting?.data?.confirmAddressUrl, ids, request.url);

          response.redirect(url);
          return;
        }

        // correct postcode - no exact match - redirect to choose address page
        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private addAddressToCache(
    request: Request,
    response: Response,
    pageType: any,
    transactionId: string,
    address: Address
  ) {
    const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, transactionId);
    const pageRouting = super.getRouting(addresssRouting, pageType, request);

    const cache = this.cacheService.addDataToCache(request.signedCookies, {
      [transactionId]: {
        ...cacheById,
        [pageRouting?.data?.[AddressCacheKeys.addressCacheKey]]: address
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
  }

  selectAddress() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const address: Address = JSON.parse(request.body.selected_address);

        this.saveAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  sendManualAddress() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { premises, address_line_1, address_line_2, locality, region, postal_code, country } = request.body;
        const address = {
          premises,
          address_line_1,
          address_line_2,
          country,
          locality,
          postal_code,
          region
        };

        const { tokens, pageType, ids } = super.extract(request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        const pageRouting = super.getRouting(addresssRouting, pageType, request);

        let errors: UIErrors | undefined;
        if (AddressLookUpController.MANUAL_PAGES.has(pageType)) {
          errors = this.addressService.validateAddressCharactersAndLength(address, errors);

          errors = this.addressService.isValidPostcode(postal_code ?? "", country, errors);
        }

        if (AddressLookUpController.LIMITED_PARTNERSHIP_MANUAL_PAGES.has(pageType)) {
          errors = this.addressService.isValidJurisdictionAndCountry(
            limitedPartnership?.data?.jurisdiction ?? "",
            country,
            errors
          );
        }

        if (errors?.hasErrors()) {
          let generalPartner;
          let limitedPartner;
          if (AddressLookUpController.GENERAL_PARTNER_ADDRESS_PAGES.has(pageType)) {
            generalPartner = await this.generalPartnerService.getGeneralPartner(
              tokens,
              ids.transactionId,
              ids.generalPartnerId
            );
          } else if (AddressLookUpController.LIMITED_PARTNER_ADDRESS_PAGES.has(pageType)) {
            limitedPartner = await this.limitedPartnerService.getLimitedPartner(
              tokens,
              ids.transactionId,
              ids.limitedPartnerId
            );
          }

          const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { address, limitedPartnership, generalPartner, limitedPartner, cache: { ...cacheById } },
              errors
            )
          );

          return;
        }

        this.saveAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  confirmAddress() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);
        this.generalPartnerService.setI18n(response.locals.i18n);
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
        const pageRouting = super.getRouting(addresssRouting, pageType, request);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);
        const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

        if (!request.body?.address) {
          await this.handleAddressNotFound(tokens, ids.transactionId, ids.submissionId, pageRouting, cache, response);
          return;
        }

        const address = JSON.parse(request.body?.address);

        const data = {
          [pageRouting.data?.[AddressCacheKeys.addressCacheKey]]: address
        };

        const isGeneralPartnerAddress = AddressLookUpController.GENERAL_PARTNER_ADDRESS_PAGES.has(pageType);
        const isLimitedPartnershipAddress = AddressLookUpController.LIMITED_PARTNER_ADDRESS_PAGES.has(pageType);

        // store in api
        let result;

        if (isGeneralPartnerAddress) {
          result = await this.generalPartnerService.sendPageData(tokens, ids.transactionId, ids.generalPartnerId, data);
        } else if (isLimitedPartnershipAddress) {
          result = await this.limitedPartnerService.sendPageData(tokens, ids.transactionId, ids.limitedPartnerId, data);
        } else {
          result = await this.limitedPartnershipService.sendPageData(
            tokens,
            ids.transactionId,
            ids.submissionId,
            pageType,
            data
          );
        }

        if (result?.errors) {
          let generalPartner;
          let limitedPartnership;

          if (isGeneralPartnerAddress) {
            generalPartner = await this.generalPartnerService.getGeneralPartner(
              tokens,
              ids.transactionId,
              ids.generalPartnerId
            );
          } else if (isLimitedPartnershipAddress) {
            limitedPartnership = await this.limitedPartnerService.getLimitedPartner(
              tokens,
              ids.transactionId,
              ids.limitedPartnerId
            );
          } else {
            limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
              tokens,
              ids.transactionId,
              ids.submissionId
            );
          }

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { cache: { ...cache, ...cacheById }, generalPartner, limitedPartnership },
              result.errors
            )
          );
          return;
        }

        // clear address from cache
        const cacheRemoved = this.cacheService.removeDataFromCache(request.signedCookies, ids.transactionId);
        response.cookie(APPLICATION_CACHE_KEY, cacheRemoved, cookieOptions);

        await this.conditionalNextUrl(tokens, ids, pageRouting, request);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalNextUrl(
    tokens: { access_token: string; refresh_token: string },
    ids: { transactionId: string; submissionId: string },
    pageRouting: PageRouting,
    request: Request
  ) {
    const pageTypes: Array<PageType | PageDefault> = [
      AddressLookUpPageType.confirmRegisteredOfficeAddress,
      AddressLookUpPageType.confirmPrincipalPlaceOfBusinessAddress
    ];

    let limitedPartnership;

    if (pageTypes.includes(pageRouting.pageType)) {
      limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        ids.transactionId,
        ids.submissionId
      );
    }

    if (pageRouting.pageType === AddressLookUpPageType.confirmRegisteredOfficeAddress) {
      if (limitedPartnership.data?.principal_place_of_business_address) {
        pageRouting.nextUrl = super.insertIdsInUrl(CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL, ids, request.url);
      }
    } else if (pageRouting.pageType === AddressLookUpPageType.confirmPrincipalPlaceOfBusinessAddress) {
      const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

      if (
        (limitedPartnership?.data?.partnership_type === PartnershipType.PFLP ||
          limitedPartnership?.data?.partnership_type === PartnershipType.SPFLP) &&
        result.generalPartners.length > 0
      ) {
        pageRouting.nextUrl = super.insertIdsInUrl(REVIEW_GENERAL_PARTNERS_URL, ids, request.url);
      }
    }
  }

  private async handleAddressNotFound(
    tokens: { access_token: string; refresh_token: string },
    transactionId: string,
    submissionId: string,
    pageRouting: PageRouting | typeof pageRoutingDefault,
    cache: Record<string, any>,
    response: Response
  ) {
    const uiErrors = new UIErrors();
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        address: "You must provide an address"
      }
    });

    const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
      tokens,
      transactionId,
      submissionId
    );

    return response.render(
      super.templateName(pageRouting.currentUrl),
      super.makeProps(pageRouting, { cache, limitedPartnership }, uiErrors)
    );
  }

  private saveAndRedirectToNextPage(request: Request, response: Response<any, Record<string, any>>, dataToStore: any) {
    const { ids } = super.extract(request);
    const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
    const pageRouting = super.getRouting(addresssRouting, pageType, request);

    const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);
    const cacheKey = pageRouting.data?.[AddressCacheKeys.addressCacheKey];

    if (cacheKey) {
      const cache = this.cacheService.addDataToCache(request.signedCookies, {
        [ids.transactionId]: {
          ...cacheById,
          [cacheKey]: dataToStore
        }
      });
      response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
    }

    response.redirect(pageRouting.nextUrl);
  }

  generalPartnerUsualResidentialaddressChoice() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
        const pageRouting = super.getRouting(addresssRouting, pageType, request);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  handleTerritoryChoice() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, pageType } = super.extract(request);
        const parameter = request.body.parameter;
        const pageRouting = super.getRouting(addresssRouting, pageType, request);

        const isUnitedKingdom = parameter === "unitedKingdom";

        const redirectUrl = super.insertIdsInUrl(
          isUnitedKingdom ? pageRouting.nextUrl : pageRouting.data?.["nextUrlOverseas"],
          ids,
          request.url
        );

        const cacheKey = pageRouting.data?.[AddressCacheKeys.territoryCacheKey];

        if (cacheKey) {
          const cache = this.cacheService.addDataToCache(request.signedCookies, {
            [ids.transactionId]: {
              [cacheKey]: parameter
            }
          });
          response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
        }

        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default AddressLookUpController;
