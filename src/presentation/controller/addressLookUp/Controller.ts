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
import Address from "../../../domain/entities/Address";

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

        let addressList: Address[] = [];

        if (this.isAddressListRequired(pageRouting.pageType)) {
          const postcode =
            cache[this.REGISTERED_OFFICE_ADDRESS_CACHE_KEY].postal_code;

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

        await this.saveAndRedirectToNextPage(request, response, address);
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

        const { errors } =
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

          pageRouting.errors = errors?.errors;

          pageRouting.data = {
            ...pageRouting.data,
            address
          };

          response.render(super.templateName(pageRouting.currentUrl), {
            props: { ...pageRouting }
          });

          return;
        }

        await this.saveAndRedirectToNextPage(request, response, address);
      } catch (error) {
        next(error);
      }
    };
  }

  private async saveAndRedirectToNextPage(
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
}

export default AddressLookUpController;
