import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { Session } from "@companieshouse/node-session-handler";

import AddressService from "../../../application/service/AddressLookUpService";
import addresssRouting, { addressLookUpRouting } from "./Routing";
import AbstractController from "../AbstractController";
import AddressLookUpPageType from "./PageType";
import CacheService from "../../../application/service/CacheService";
import {
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  SUBMISSION_ID,
  TRANSACTION_ID
} from "../../../config/constants";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

class AddressLookUpController extends AbstractController {
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
          request.url,
          transactionId,
          submissionId
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
          const postcode = cache.registration_registered_office_address.postcode;

          addressList = await this.addressService.getAddressListForPostcode(
            tokens,
            postcode,
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
        const session = request.session as Session;
        const tokens = super.extractTokens(request);
        const { transactionId, submissionId } = super.extractIds(request);
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );
        const { postal_code, premise } = request.body;

        const pageRouting = super.getRouting(
          addressLookUpRouting,
          pageType,
          request.url,
          request.params[TRANSACTION_ID],
          request.params[SUBMISSION_ID]
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
            escape(premise)
          );

        if (errors?.errors) {
          pageRouting.errors = errors?.errors;
          pageRouting.data = {
            ...pageRouting.data,
            limitedPartnership
          };

          response.render(super.templateName(pageRouting.currentUrl), {
            props: { ...pageRouting }
          });
          return;
        }

        await this.cacheService.addDataToCache(session, {
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}registered_office_address`]:
            address
        });

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  selectAddress(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );

        const pageRouting = super.getRouting(
          addressLookUpRouting,
          pageType,
          request.url,
          request.params[TRANSACTION_ID],
          request.params[SUBMISSION_ID]
        );

        const selectedAddress: UKAddress = JSON.parse(request.body.selected_address);

        await this.cacheService.addDataToCache(session, {
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${pageType}`]:
            selectedAddress
        });

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default AddressLookUpController;
