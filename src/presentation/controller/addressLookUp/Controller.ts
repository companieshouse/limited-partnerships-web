import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { Session } from "@companieshouse/node-session-handler";

import AddressService from "../../../application/service/AddressLookUpService";
import addresssRouting, { addressLookUpRouting } from "./Routing";
import AbstractController from "../AbstractController";
import AddressLookUpPageType from "./PageType";
import CacheService from "../../../application/service/CacheService";
import { APPLICATION_CACHE_KEY_PREFIX_REGISTRATION } from "../../../config/constants";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import UIErrors from "../../../domain/entities/UIErrors";
import { Address, LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

class AddressLookUpController extends AbstractController {
  public readonly REGISTERED_OFFICE_ADDRESS_CACHE_KEY =
    APPLICATION_CACHE_KEY_PREFIX_REGISTRATION + "registered_office_address";

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
        const tokens = super.extractTokens(request);
        const pageType = super.pageType(request.path);

        const pageRouting = super.getRouting(
          addresssRouting,
          pageType,
          request
        );

        await this.renderPage(
          request,
          response,
          pageRouting,
          tokens
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private isAddressListRequired(pageType: string): boolean {
    return pageType === AddressLookUpPageType.chooseRegisteredOfficeAddress;
  }

  postcodeValidation(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const tokens = super.extractTokens(request);
        const { transactionId, submissionId } = super.extractIds(request);
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );
        const { postal_code, premises } = request.body;

        const pageRouting = super.getRouting(
          addressLookUpRouting,
          pageType,
          request
        );

        const limitedPartnership =
          await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            transactionId,
            submissionId
          );

        const { address, errors } =
          await this.addressService.isValidUKPostcodeAndHasAnAddress(
            tokens,
            limitedPartnership?.data?.partnership_type ?? "",
            escape(postal_code),
            escape(premises)
          );

        if (errors?.errors) {
          await this.renderPage(
            request,
            response,
            pageRouting,
            tokens,
            undefined,
            undefined,
            errors
          );
          return;
        }

        await this.cacheService.addDataToCache(session, {
          [this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY]: address
        });

        // if exact match - redirect to confirm page
        if (address.postal_code && address.premises && address.address_line_1) {
          const url = super.insertIdsInUrl(
            pageRouting?.data?.confirmAddressUrl,
            transactionId,
            submissionId
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

  selectAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const address: Address = JSON.parse(request.body.selected_address);

        await this.cacheAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  sendManualAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
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

        const tokens = super.extractTokens(request);
        const { transactionId, submissionId } = super.extractIds(request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          transactionId,
          submissionId
        );

        const errors =
          this.addressService.isValidJurisdictionAndCountry(
            limitedPartnership?.data?.jurisdiction ?? "",
            country,
          );

        if (errors?.errors) {
          const pageType = super.pageType(request.path);

          const pageRouting = super.getRouting(
            addresssRouting,
            pageType,
            request
          );

          await this.renderPage(
            request,
            response,
            pageRouting,
            tokens,
            undefined,
            address,
            errors
          );
          return;
        }

        await this.cacheAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  confirmAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const tokens = super.extractTokens(request);
        const { transactionId, submissionId } = super.extractIds(request);

        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );

        const pageRouting = super.getRouting(
          addressLookUpRouting,
          pageType,
          request
        );

        const cache = await this.cacheService.getDataFromCache(session);

        const address = cache[this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY];

        if (!address) {
          const uiErrors = new UIErrors();
          uiErrors.formatValidationErrorToUiErrors({
            errors: {
              address: "You must provide an address"
            }
          });

          await this.renderPage(
            request,
            response,
            pageRouting,
            tokens,
            undefined,
            undefined,
            uiErrors
          );
          return;
        }

        // store in api
        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          transactionId,
          submissionId,
          pageType,
          { registered_office_address: address }
        );

        if (result?.errors) {
          await this.renderPage(
            request,
            response,
            pageRouting,
            tokens,
            undefined,
            undefined,
            result.errors,
          );
          return;
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async cacheAndRedirectToNextPage(
    request: Request,
    response: Response<any, Record<string, any>>,
    dataToStore: any
  ) {
    const session = request.session as Session;
    const pageType = super.extractPageTypeOrThrowError(
      request,
      AddressLookUpPageType
    );

    const pageRouting = super.getRouting(
      addressLookUpRouting,
      pageType,
      request
    );

    const cacheKey = this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY;

    await this.cacheService.addDataToCache(session, {
      [cacheKey]: dataToStore
    });

    response.redirect(pageRouting.nextUrl);
  }

  private async renderPage(
    request: Request,
    response: Response,
    pageRouting: any,
    tokens: any,
    limitedPartnership?: LimitedPartnership,
    address?: any,
    errors?: any,
  ) {
    const { transactionId, submissionId } = super.extractIds(request);

    if (!limitedPartnership) {
      limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        transactionId,
        submissionId
      );
    }

    const session = request.session as Session;

    const cache = await this.cacheService.getDataFromCache(session);

    let addressList: Address[] = [];

    if (this.isAddressListRequired(pageRouting.pageType)) {
      const postcode =
        cache[this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY].postal_code;

      addressList = await this.addressService.getAddressListForPostcode(
        tokens,
        postcode
      );
    }

    pageRouting.errors = errors?.errors;
    pageRouting.data = {
      ...pageRouting.data,
      cache,
      limitedPartnership,
      addressList,
      address
    };

    response.render(super.templateName(pageRouting.currentUrl), {
      props: { ...pageRouting }
    });
  }
}

export default AddressLookUpController;
