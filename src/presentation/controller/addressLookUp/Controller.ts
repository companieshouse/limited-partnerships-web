import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { Session } from "@companieshouse/node-session-handler";

import AddressService from "../../../application/addressLookUp/Service";
import addresssRouting, { addressLookUpRouting } from "./Routing";
import AbstractController from "../AbstractController";
import AddressLookUpPageType from "./PageType";
import CacheService from "../../../application/CacheService";
import {
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  SUBMISSION_ID,
  TRANSACTION_ID
} from "../../../config/constants";

class AddressLookUpController extends AbstractController {
  private addressService: AddressService;
  private cacheService: CacheService;

  constructor(addressService: AddressService, cacheService: CacheService) {
    super();
    this.addressService = addressService;
    this.cacheService = cacheService;
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
          limitedPartnership = await this.addressService.getLimitedPartnership(
            tokens,
            transactionId,
            submissionId
          );
        }

        const cache = await this.cacheService.getDataFromCache(session);

        pageRouting.data = {
          ...pageRouting.data,
          limitedPartnership,
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

  postcodeValidation(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );
        const postalCode = escape(request.body.postal_code);
        const addressLine1 = escape(request.body.address_line_1);

        const pageRouting = super.getRouting(
          addressLookUpRouting,
          pageType,
          request.url,
          request.params[TRANSACTION_ID],
          request.params[SUBMISSION_ID]
        );

        const { isValid, address } =
          await this.addressService.isValidUKPostcodeAndHasAnAddress(
            postalCode,
            addressLine1
          );

        if (!isValid) {
          response.render(super.templateName(pageRouting.currentUrl), {
            props: { ...pageRouting }
          });
          return;
        }

        await this.cacheService.addDataToCache(session, {
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${pageType}`]: address
        });

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default AddressLookUpController;
