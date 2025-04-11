import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import AddressService from "../../../application/service/AddressLookUpService";
import addresssRouting, { AddressCacheKeys, addressLookUpRouting } from "./Routing";
import AbstractController from "../AbstractController";
import AddressLookUpPageType from "./PageType";
import CacheService from "../../../application/service/CacheService";
import { APPLICATION_CACHE_KEY, cookieOptions } from "../../../config/constants";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import UIErrors from "../../../domain/entities/UIErrors";
import { PageRouting, pageRoutingDefault } from "../PageRouting";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import {
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "./url";

class AddressLookUpController extends AbstractController {
  constructor(
    private addressService: AddressService,
    private limitedPartnershipService: LimitedPartnershipService,
    private generalPartnerService: GeneralPartnerService,
    private cacheService: CacheService
  ) {
    super();
  }

  getPageRouting(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(addresssRouting, pageType, request);

        let limitedPartnership = {};
        let generalPartner = {};

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

        const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

        const addressList = await this.getAddressList(pageRouting, cacheById, tokens);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(
            pageRouting,
            { limitedPartnership, generalPartner, addressList, cache: { ...cacheById } },
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

    if (this.isAddressListRequired(pageRouting.pageType)) {
      const cacheKey = pageRouting.data?.[AddressCacheKeys.addressCacheKey];
      const postcode = cache[cacheKey]?.postal_code;

      addressList = await this.addressService.getAddressListForPostcode(tokens, postcode);
    }

    return addressList;
  }

  private isAddressListRequired(pageType: string): boolean {
    return (
      pageType === AddressLookUpPageType.chooseRegisteredOfficeAddress ||
      pageType === AddressLookUpPageType.choosePrincipalPlaceOfBusinessAddress ||
      pageType === AddressLookUpPageType.chooseGeneralPartnerUsualResidentialAddress ||
      pageType === AddressLookUpPageType.chooseGeneralPartnerPrincipalOfficeAddress
    );
  }

  postcodeValidation(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { tokens, ids } = super.extract(request);
        const { postal_code, premises } = request.body;
        const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
        const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        const { address, errors } = await this.addressService.isValidUKPostcodeAndHasAnAddress(
          tokens,
          limitedPartnership?.data?.jurisdiction ?? "",
          escape(postal_code),
          escape(premises)
        );

        if (errors?.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartnership, ...request.body }, errors)
          );
          return;
        }

        this.addAddressToCache(request, response, pageType, ids.transactionId, address);

        // if exact match - redirect to confirm page
        if (address?.postal_code && address?.premises && address?.address_line_1) {
          const url = super.insertIdsInUrl(
            pageRouting?.data?.confirmAddressUrl,
            ids.transactionId,
            ids.submissionId,
            ids.generalPartnerId
          );
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
    const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

    const cache = this.cacheService.addDataToCache(request.signedCookies, {
      [transactionId]: {
        ...cacheById,
        [pageRouting?.data?.[AddressCacheKeys.addressCacheKey]]: address
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
  }

  selectAddress(): RequestHandler {
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

  sendManualAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { premises, address_line_1, address_line_2, locality, region, postal_code, country } = request.body;
        const address = {
          address_line_1,
          address_line_2,
          country,
          locality,
          postal_code,
          premises,
          region
        };

        const { tokens, pageType, ids } = super.extract(request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

        const isURAorPOA =
          pageType === AddressLookUpPageType.enterGeneralPartnerUsualResidentialAddress ||
          pageType === AddressLookUpPageType.enterGeneralPartnerPrincipalOfficeAddress;

        const errors = isURAorPOA
          ? null
          : this.addressService.isValidJurisdictionAndCountry(limitedPartnership?.data?.jurisdiction ?? "", country);

        if (errors?.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { address }, errors)
          );

          return;
        }

        this.saveAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  confirmAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
        const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);
        const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

        if (!request.body?.address) {
          await this.handleAddressNotFound(tokens, ids.transactionId, ids.submissionId, pageRouting, cache, response);
          return;
        }

        const address = JSON.parse(request.body?.address);

        const data = this.getAddressData(pageType, address);

        const isGeneralPartner =
          pageType === AddressLookUpPageType.confirmGeneralPartnerUsualResidentialAddress ||
          pageType === AddressLookUpPageType.confirmGeneralPartnerPrincipalOfficeAddress;

        // store in api
        let result;

        if (isGeneralPartner) {
          result = await this.generalPartnerService.sendPageData(tokens, ids.transactionId, ids.generalPartnerId, data);
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

          if (isGeneralPartner) {
            generalPartner = await this.generalPartnerService.getGeneralPartner(
              tokens,
              ids.transactionId,
              ids.generalPartnerId
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

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private getAddressData(pageType: any, address: any) {
    let data;

    if (pageType === AddressLookUpPageType.confirmRegisteredOfficeAddress) {
      data = { registered_office_address: address };
    } else if (pageType === AddressLookUpPageType.confirmPrincipalPlaceOfBusinessAddress) {
      data = { principal_place_of_business_address: address };
    } else if (pageType === AddressLookUpPageType.confirmGeneralPartnerUsualResidentialAddress) {
      data = { usual_residential_address: address };
    } else if (pageType === AddressLookUpPageType.confirmGeneralPartnerPrincipalOfficeAddress) {
      data = { principal_office_address: address };
    }

    return data;
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
    const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

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

  generalPartnerUsualResidentialaddressChoice(): RequestHandler {
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

  generalPartnerTerritoryChoice(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, pageType } = super.extract(request);
        const parameter = request.body.parameter;
        const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

        const isUnitedKingdom = parameter === "unitedKingdom";
        const isGeneralPartnerURAPage =
          pageType === AddressLookUpPageType.territoryChoiceGeneralPartnerUsualResidentialAddress;
        const isGeneralPartnerPOAPage =
          pageType === AddressLookUpPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress;
        const isGeneralPartnerCorrespondenceAddressPage =
          pageType === AddressLookUpPageType.territoryChoiceGeneralPartnerCorrespondenceAddress;

        let redirectUrl;

        if (isGeneralPartnerURAPage) {
          redirectUrl = isUnitedKingdom
            ? POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
            : ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL;
        } else if (isGeneralPartnerPOAPage) {
          redirectUrl = isUnitedKingdom
            ? POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
            : ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL;
        } else if (isGeneralPartnerCorrespondenceAddressPage) {
          redirectUrl = isUnitedKingdom
            ? POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
            : ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL;
        }

        redirectUrl = super.insertIdsInUrl(redirectUrl, ids.transactionId, ids.submissionId, ids.generalPartnerId);

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
