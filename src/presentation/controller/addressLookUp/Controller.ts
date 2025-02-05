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
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import UIErrors from "../../../domain/entities/UIErrors";

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
        const session = request.session as Session;
        const tokens = super.extractTokens(request);
        const pageType = super.pageType(request.path);
        const { transactionId, submissionId } = super.extractIds(request);

        const pageRouting = super.getRouting(
          addresssRouting,
          pageType,
          request
        );

        let limitedPartnership = {};

        if (transactionId && submissionId) {
          limitedPartnership =
            await this.limitedPartnershipService.getLimitedPartnership(
              tokens,
              transactionId,
              submissionId
            );
        }

        const cache = await this.cacheService.getDataFromCache(session);

        let addressList: UKAddress[] = [];

        if (this.isAddressListRequired(pageRouting.pageType)) {
          const postcode =
            cache[this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY].postcode;

          addressList = await this.addressService.getAddressListForPostcode(
            tokens,
            postcode
          );
        }

        pageRouting.data = {
          ...pageRouting.data,
          limitedPartnership,
          addressList,
          cache
        };

        response.render(super.templateName(pageRouting.currentUrl), {
          props: { ...pageRouting }
        });
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
        const tokens = super.extractTokens(request);
        const { transactionId, submissionId } = super.extractIds(request);
        const { postal_code, premise } = request.body;

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
            escape(premise)
          );

        if (errors?.errors) {
          this.renderErrors(request, response, errors, { limitedPartnership });
          return;
        }

        this.cacheAddressAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  selectAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const selectedAddress: UKAddress = JSON.parse(
          request.body.selected_address
        );
        const address = {
          address_line_1: selectedAddress.addressLine1,
          address_line_2: selectedAddress.addressLine2,
          country: selectedAddress.country,
          locality: selectedAddress.postTown,
          postal_code: selectedAddress.postcode,
          premises: selectedAddress.premise
        };

        await this.cacheAddressAndRedirectToNextPage(request, response, address);
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

        await this.cacheAddressAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  confirmAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;

        const cache = await this.cacheService.getDataFromCache(session);

        const address = cache[this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY];

        if (!address) {
          const uiErrors = new UIErrors();
          uiErrors.formatValidationErrorToUiErrors({
            errors: {
              address: "You must provide an address"
            }
          });

          this.renderErrors(request, response, uiErrors);
          return;
        }

        this.redirectToNextPage(request, response);
      } catch (error) {
        next(error);
      }
    };
  }

  private renderErrors(request, response: Response<any, Record<string, any>>, uiErrors: UIErrors, data?: any) {
    const pageType = super.extractPageTypeOrThrowError(
      request,
      AddressLookUpPageType
    );

    const pageRouting = super.getRouting(
      addressLookUpRouting,
      pageType,
      request
    );

    pageRouting.errors = uiErrors.errors;
    pageRouting.data = {
      ...pageRouting.data,
      ...data
    };

    response.render(super.templateName(pageRouting.currentUrl), {
      props: { ...pageRouting }
    });
  }

  private async cacheAddressAndRedirectToNextPage(
    request: Request,
    response: Response<any, Record<string, any>>,
    dataToStore: any
  ) {
    const session = request.session as Session;
    const cacheKey = this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY;

    await this.cacheService.addDataToCache(session, {
      [cacheKey]: dataToStore
    });

    this.redirectToNextPage(request, response);
  }

  private redirectToNextPage(
    request: Request,
    response: Response<any, Record<string, any>>
  ) {
    const pageType = super.extractPageTypeOrThrowError(
      request,
      AddressLookUpPageType
    );

    const pageRouting = super.getRouting(
      addressLookUpRouting,
      pageType,
      request
    );

    response.redirect(pageRouting.nextUrl);
  }
}

export default AddressLookUpController;
