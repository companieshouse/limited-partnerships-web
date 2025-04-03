import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import AddressService from "../../../application/service/AddressLookUpService";
import addresssRouting, { addressLookUpRouting } from "./Routing";
import AbstractController from "../AbstractController";
import AddressLookUpPageType from "./PageType";
import CacheService from "../../../application/service/CacheService";
import { APPLICATION_CACHE_KEY, cookieOptions } from "../../../config/constants";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import UIErrors from "../../../domain/entities/UIErrors";
import { PageRouting, pageRoutingDefault } from "../PageRouting";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import {
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "./url";

class AddressLookUpController extends AbstractController {
  public readonly REGISTERED_OFFICE_ADDRESS_CACHE_KEY = "registered_office_address";
  public readonly PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CACHE_KEY =
    "principal_place_of_business_address";
  public readonly USUAL_RESIDENTIAL_ADDRESS_CACHE_KEY = "usual_residential_address";
  public readonly PRINCIPAL_OFFICE_ADDRESS_CACHE_KEY = "principal_office_address";
  public readonly USUAL_RESIDENTIAL_ADDRESS_TERRITORY_CHOICE_CACHE_KEY = "ura_territory_choice";
  public readonly PRINCIPAL_OFFICE_ADDRESS_TERRITORY_CHOICE_CACHE_KEY = "poa_territory_choice";

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

        const cacheById = this.cacheService.getDataFromCacheById(
          request.signedCookies,
          ids.transactionId
        );

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
      const postcode = cache[this.getCacheKey(pageRouting.pageType)].postal_code;

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
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );
        const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

        const limitedPartnership =
          await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

        const { address, errors } =
          await this.addressService.isValidUKPostcodeAndHasAnAddress(
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

        this.addAddressToCache(pageType, ids.transactionId, address, request, response);

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
    pageType: any,
    transactionId: string,
    address: Address,
    request: Request,
    response: Response
  ) {
    if (pageType === AddressLookUpPageType.postcodePrincipalPlaceOfBusinessAddress) {
      const cache = this.cacheService.addDataToCache(request.signedCookies, {
        [transactionId]: {
          [this.PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CACHE_KEY]: address
        }
      });
      response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
    } else if (pageType === AddressLookUpPageType.postcodeRegisteredOfficeAddress) {
      const cache = this.cacheService.addDataToCache(request.signedCookies, {
        [transactionId]: {
          [this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY]: address
        }
      });
      response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
    } else if (pageType === AddressLookUpPageType.postcodeGeneralPartnerUsualResidentialAddress) {
      const cache = this.cacheService.addDataToCache(request.signedCookies, {
        [transactionId]: {
          [this.USUAL_RESIDENTIAL_ADDRESS_CACHE_KEY]: address
        }
      });
      response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
    } else if (pageType === AddressLookUpPageType.postcodeGeneralPartnerPrincipalOfficeAddress) {
      const cache = this.cacheService.addDataToCache(request.signedCookies, {
        [transactionId]: {
          [this.PRINCIPAL_OFFICE_ADDRESS_CACHE_KEY]: address
        }
      });
      response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
    }
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

        const {
          premises,
          address_line_1,
          address_line_2,
          locality,
          region,
          postal_code,
          country
        } = request.body;
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

        const limitedPartnership =
          await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

        const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

        const errors = pageType !== AddressLookUpPageType.enterGeneralPartnerUsualResidentialAddress ?
          this.addressService.isValidJurisdictionAndCountry(
            limitedPartnership?.data?.jurisdiction ?? "",
            country
          ) : null;

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
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );
        const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);
        const cacheById = this.cacheService.getDataFromCacheById(
          request.signedCookies,
          ids.transactionId
        );

        if (!request.body?.address) {
          await this.handleAddressNotFound(
            tokens,
            ids.transactionId,
            ids.submissionId,
            pageRouting,
            cache,
            response
          );
          return;
        }

        const address = JSON.parse(request.body?.address);

        const data = this.getAddressData(pageType, address);

        const isGeneralPartner = (pageType === AddressLookUpPageType.confirmGeneralPartnerUsualResidentialAddress);

        // store in api
        let result;

        if (isGeneralPartner) {
          result = await this.generalPartnerService.sendPageData(
            tokens,
            ids.transactionId,
            ids.generalPartnerId,
            data
          );
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
        const cacheRemoved = this.cacheService.removeDataFromCache(
          request.signedCookies,
          ids.transactionId
        );
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

  private saveAndRedirectToNextPage(
    request: Request,
    response: Response<any, Record<string, any>>,
    dataToStore: any
  ) {
    const { ids } = super.extract(request);
    const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
    const pageRouting = super.getRouting(addressLookUpRouting, pageType, request);

    const cacheKey = this.getCacheKey(pageType);

    const cache = this.cacheService.addDataToCache(request.signedCookies, {
      [ids.transactionId]: {
        [cacheKey]: dataToStore
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

    response.redirect(pageRouting.nextUrl);
  }

  // TODO As each pageType can have a cache key, add the key to each 'routing' object for each page and remove the if/elses
  private getCacheKey(pageType: any) {
    let cacheKey = "";
    if (this.isPrincipalPlaceOfBusinessPage(pageType)) {
      cacheKey = this.PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CACHE_KEY;
    } else if (this.isRegisteredOfficeAddressPage(pageType)) {
      cacheKey = this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY;
    } else if (pageType === AddressLookUpPageType.territoryChoiceGeneralPartnerUsualResidentialAddress) {
      cacheKey = this.USUAL_RESIDENTIAL_ADDRESS_TERRITORY_CHOICE_CACHE_KEY;
    } else if (pageType === AddressLookUpPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress) {
      cacheKey = this.PRINCIPAL_OFFICE_ADDRESS_TERRITORY_CHOICE_CACHE_KEY;
    } else if (this.isGeneralPartnerUsualResidentialAddressPage(pageType)) {
      cacheKey = this.USUAL_RESIDENTIAL_ADDRESS_CACHE_KEY;
    } else if (this.isGeneralPartnerPrincipalOfficeAddressPage(pageType)) {
      cacheKey = this.PRINCIPAL_OFFICE_ADDRESS_CACHE_KEY;
    }

    return cacheKey;
  }

  private isPrincipalPlaceOfBusinessPage(pageType: AddressLookUpPageType): boolean {
    const allowedPages: AddressLookUpPageType[] = [
      AddressLookUpPageType.choosePrincipalPlaceOfBusinessAddress,
      AddressLookUpPageType.enterPrincipalPlaceOfBusinessAddress,
      AddressLookUpPageType.confirmPrincipalPlaceOfBusinessAddress
    ];
    return allowedPages.includes(pageType);
  }

  private isRegisteredOfficeAddressPage(pageType: AddressLookUpPageType): boolean {
    const allowedPages: AddressLookUpPageType[] = [
      AddressLookUpPageType.chooseRegisteredOfficeAddress,
      AddressLookUpPageType.enterRegisteredOfficeAddress,
      AddressLookUpPageType.confirmRegisteredOfficeAddress
    ];
    return allowedPages.includes(pageType);
  }

  private isGeneralPartnerUsualResidentialAddressPage(pageType: AddressLookUpPageType): boolean {
    const allowedPages: AddressLookUpPageType[] = [
      AddressLookUpPageType.chooseGeneralPartnerUsualResidentialAddress,
      AddressLookUpPageType.enterGeneralPartnerUsualResidentialAddress,
      AddressLookUpPageType.confirmGeneralPartnerUsualResidentialAddress
    ];
    return allowedPages.includes(pageType);
  }

  private isGeneralPartnerPrincipalOfficeAddressPage(pageType: AddressLookUpPageType): boolean {
    const allowedPages: AddressLookUpPageType[] = [
      AddressLookUpPageType.chooseGeneralPartnerPrincipalOfficeAddress,
      AddressLookUpPageType.enterGeneralPartnerPrincipalOfficeAddress
    ];
    return allowedPages.includes(pageType);
  }

  generalPartnerUsualResidentialaddressChoice(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );
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

        const isGeneralPartnerURAPage =
          pageType === AddressLookUpPageType.territoryChoiceGeneralPartnerUsualResidentialAddress;

        let redirectUrl;
        if (parameter === "unitedKingdom") {
          if (isGeneralPartnerURAPage) {
            redirectUrl = POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL;
          } else {
            redirectUrl = POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL;
          }
        } else {
          if (isGeneralPartnerURAPage) {
            redirectUrl = ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL;
          } else {
            redirectUrl = ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL;
          }
        }

        redirectUrl = super.insertIdsInUrl(redirectUrl, ids.transactionId, ids.submissionId, ids.generalPartnerId);

        const cacheKey = this.getCacheKey(pageType);

        this.cacheTerritoryAndRedirectToCorrectPage(request, response, cacheKey, parameter, redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private cacheTerritoryAndRedirectToCorrectPage(
    request: Request,
    response: Response<any, Record<string, any>>,
    cacheKey: string,
    dataToStore: any,
    redirectUrl: string
  ) {
    const { ids } = super.extract(request);

    const cache = this.cacheService.addDataToCache(request.signedCookies, {
      [ids.transactionId]: {
        [cacheKey]: dataToStore
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

    response.redirect(redirectUrl);
  }
}

export default AddressLookUpController;
