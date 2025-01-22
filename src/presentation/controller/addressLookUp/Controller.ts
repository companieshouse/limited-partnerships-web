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
        const generalPartner = {};
        const limitedPartner = {};

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
          addressList = await this.getAddressList(tokens, postcode);
        }

        pageRouting.data = {
          ...pageRouting.data,
          limitedPartnership,
          generalPartner,
          limitedPartner,
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

  private async getAddressList(tokens, postcode: string): Promise<UKAddress[]> {
    return await this.addressService.getAddressListForPostcode(
      tokens,
      postcode,
    );
  }

  postcodeValidation(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const tokens = super.extractTokens(request);
        const pageType = super.extractPageTypeOrThrowError(
          request,
          AddressLookUpPageType
        );
        const { postal_code, address_line_1 } = request.body;

        const pageRouting = super.getRouting(
          addressLookUpRouting,
          pageType,
          request.url,
          request.params[TRANSACTION_ID],
          request.params[SUBMISSION_ID]
        );

        const { isValid, address } =
          await this.addressService.isValidUKPostcodeAndHasAnAddress(
            tokens,
            escape(postal_code),
            escape(address_line_1)
          );

        if (!isValid) {
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
}

export default AddressLookUpController;
