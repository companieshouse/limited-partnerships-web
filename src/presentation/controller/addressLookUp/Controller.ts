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
import PageType from "../PageType";

class AddressLookUpController extends AbstractController {
  public readonly REGISTERED_OFFICE_ADDRESS_CACHE_KEY = "registered_office_address";
  public readonly PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CACHE_KEY = "principal_place_of_business_address";

  constructor(
    private addressService: AddressService,
    private limitedPartnershipService: LimitedPartnershipService,
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

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

        const addressList = await this.getAddressList(pageRouting, pageType, ids.transactionId, cacheById, tokens);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, addressList, cache: { ...cacheById } }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private async getAddressList(
    pageRouting: PageRouting,
    pageType: PageType,
    transactionId: string,
    cache: Record<string, any>,
    tokens: { access_token: string; refresh_token: string }
  ): Promise<Address[]> {
    let addressList: Address[] = [];

    if (this.isAddressListRequired(pageRouting.pageType)) {
      let postcode = "";
      if (pageType === AddressLookUpPageType.choosePrincipalPlaceOfBusinessAddress) {
        postcode = cache[this.PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CACHE_KEY]?.postal_code;
      } else {
        postcode = cache[this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY]?.postal_code;
      }

      addressList = await this.addressService.getAddressListForPostcode(tokens, postcode);
    }

    return addressList;
  }

  private isAddressListRequired(pageType: string): boolean {
    return (
      pageType === AddressLookUpPageType.chooseRegisteredOfficeAddress ||
      pageType === AddressLookUpPageType.choosePrincipalPlaceOfBusinessAddress
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

        this.addAddressToCache(pageType, ids.transactionId, address, request, response);

        // if exact match - redirect to confirm page
        if (address?.postal_code && address?.premises && address?.address_line_1) {
          const url = super.insertIdsInUrl(pageRouting?.data?.confirmAddressUrl, ids.transactionId, ids.submissionId);
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
    } else {
      const cache = this.cacheService.addDataToCache(request.signedCookies, {
        [transactionId]: {
          [this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY]: address
        }
      });
      response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
    }
  }

  selectAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const address: Address = JSON.parse(request.body.selected_address);

        await this.saveAndRedirectToNextPage(request, response, address);
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

        const errors = this.addressService.isValidJurisdictionAndCountry(
          limitedPartnership?.data?.jurisdiction ?? "",
          country
        );

        if (errors?.errors) {
          const pageRouting = super.getRouting(addresssRouting, pageType, request);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { address }, errors)
          );

          return;
        }

        await this.saveAndRedirectToNextPage(request, response, address);
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

        // store in api
        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          data
        );

        if (result?.errors) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { cache: { ...cache, ...cacheById }, limitedPartnership }, result.errors)
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
    } else if (AddressLookUpPageType.confirmPrincipalPlaceOfBusinessAddress) {
      data = { principal_place_of_business_address: address };
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

    const cacheKey = this.getCacheKey(pageType);

    const cache = this.cacheService.addDataToCache(request.signedCookies, {
      [ids.transactionId]: {
        [cacheKey]: dataToStore
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

    response.redirect(pageRouting.nextUrl);
  }

  private getCacheKey(pageType: any) {
    let cacheKey = "";
    if (this.isPrincipalPlaceOfBusinessPage(pageType)) {
      cacheKey = this.PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CACHE_KEY;
    } else {
      cacheKey = this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY;
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
}

export default AddressLookUpController;
