import { NextFunction, Request, Response } from "express";
import escape from "escape-html";
import {
  Address,
  GeneralPartner,
  LimitedPartner,
  PartnerKind,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import AbstractController from "../AbstractController";
import AddressService from "../../../application/service/AddressService";

import registrationAddressRouting, { AddressCacheKeys } from "./routing/registration/routing";
import transitionAddressRouting from "./routing/transition/routing";
import postTransitionAddressRouting from "./routing/postTransition/routing";

import { Ids, Tokens } from "../../../domain/types";
import { getJourneyTypes } from "../../../utils";
import { APPLICATION_CACHE_KEY, cookieOptions } from "../../../config/constants";
import UIErrors from "../../../domain/entities/UIErrors";

import AddressLookUpPageType, { isConfirmGeneralPartnerAddressPageType, isConfirmLimitedPartnerAddressPageType } from "./PageType";
import { PageDefault, PageRouting, pageRoutingDefault } from "../PageRouting";
import PageType from "../PageType";

import CacheService from "../../../application/service/CacheService";
import CompanyService from "../../../application/service/CompanyService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";

import { CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL } from "./url/registration";
import { REVIEW_GENERAL_PARTNERS_URL } from "../registration/url";
import { UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL, WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL, WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL, WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL } from "../postTransition/url";
import { isUpdateKind } from "../../../utils/kind";

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

  private static readonly LIST_PAGES: Set<PageType | PageDefault> = new Set([
    AddressLookUpPageType.chooseRegisteredOfficeAddress,
    AddressLookUpPageType.choosePrincipalPlaceOfBusinessAddress,
    AddressLookUpPageType.chooseGeneralPartnerUsualResidentialAddress,
    AddressLookUpPageType.chooseGeneralPartnerPrincipalOfficeAddress,
    AddressLookUpPageType.chooseGeneralPartnerCorrespondenceAddress,
    AddressLookUpPageType.chooseLimitedPartnerUsualResidentialAddress,
    AddressLookUpPageType.chooseLimitedPartnerPrincipalOfficeAddress
  ]);

  private static readonly GENERAL_PARTNER_PAGES: Set<PageType | PageDefault> = new Set([
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

  private static readonly LIMITED_PARTNER_PAGES: Set<PageType | PageDefault> = new Set([
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
    private readonly cacheService: CacheService,
    private readonly companyService: CompanyService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const addressRouting = this.getAddressRouting(request.url);
        const pageRouting = super.getRouting(addressRouting, pageType, request);

        const { limitedPartnership, generalPartner, limitedPartner } = await this.getData(ids, tokens);

        const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

        const addressList = await this.getAddressList(pageRouting, cacheById, tokens);

        const { chsCorrespondenceAddress, chsPrincipalOfficeAddress } = await this.getChsAddressesIfApplicable(tokens, pageRouting, generalPartner, limitedPartner, cacheById, ids);

        if (ids.generalPartnerId) {
          this.conditionalBackLink(pageRouting, generalPartner, ids);
        } else if (ids.limitedPartnerId){
          this.conditionalBackLink(pageRouting, limitedPartner, ids);
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(
            pageRouting,
            { limitedPartnership, generalPartner, limitedPartner, addressList, cache: { ...cacheById }, chsCorrespondenceAddress, chsPrincipalOfficeAddress },
            null
          )
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private async getChsAddressesIfApplicable(
    tokens: Tokens,
    pageRouting: PageRouting,
    generalPartner: GeneralPartner,
    limitedPartner: LimitedPartner,
    cache: Record<string, any>,
    ids: Ids,
  ): Promise<{ chsCorrespondenceAddress?: Address; chsPrincipalOfficeAddress?: Address }> {
    const partner = generalPartner?.data ? generalPartner : limitedPartner;
    const partnerKind = partner?.data?.kind as PartnerKind;
    let chsPartner;

    if (this.isChsAddressRequired(partnerKind, pageRouting, generalPartner, cache)) {
      if (ids.companyId && partner?.data?.appointment_id) {
        chsPartner = await this.companyService.buildPartnerFromCompanyAppointment(
          tokens,
          ids.companyId,
          partner.data.appointment_id
        );
      }
    }
    return {
      chsCorrespondenceAddress: chsPartner?.partner?.data?.service_address,
      chsPrincipalOfficeAddress: chsPartner?.partner?.data?.principal_office_address
    };
  }

  private isChsAddressRequired(partnerKind: PartnerKind, pageRouting: PageRouting, generalPartner: GeneralPartner, cache: Record<string, any>) {
    if (partnerKind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON) {
      if (pageRouting.pageType === AddressLookUpPageType.enterGeneralPartnerCorrespondenceAddress) {
        if (!generalPartner?.data?.service_address && !cache?.service_address) {
          return true;
        }
      }
    }

    if (partnerKind === PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY) {
      if (pageRouting.pageType === AddressLookUpPageType.enterGeneralPartnerPrincipalOfficeAddress) {
        if (!generalPartner?.data?.principal_office_address && !cache?.principal_office_address) {
          return true;
        }
      }
    }
    return false;
  }

  private conditionalBackLink(
    pageRouting: PageRouting,
    partner: GeneralPartner | LimitedPartner,
    ids: Ids
  ) {
    if (isUpdateKind(partner?.data?.kind)) {
      if (
        pageRouting.pageType === AddressLookUpPageType.territoryChoiceGeneralPartnerUsualResidentialAddress ||
        pageRouting.pageType === AddressLookUpPageType.enterGeneralPartnerCorrespondenceAddress ||
        pageRouting.pageType === AddressLookUpPageType.confirmGeneralPartnerCorrespondenceAddress
      ) {
        pageRouting.previousUrl = this.insertIdsInUrl(pageRouting.data?.previousUrlUpdateGeneralPartnerPerson, ids);
        return;
      }

      if (
        pageRouting.pageType === AddressLookUpPageType.enterGeneralPartnerPrincipalOfficeAddress ||
        pageRouting.pageType === AddressLookUpPageType.confirmGeneralPartnerPrincipalOfficeAddress
      ) {
        pageRouting.previousUrl = this.insertIdsInUrl(pageRouting.data?.previousUrlUpdateGeneralPartnerLegalEntity, ids);
        return;
      }

      if (
        pageRouting.pageType === AddressLookUpPageType.territoryChoiceLimitedPartnerUsualResidentialAddress ||
        pageRouting.pageType === AddressLookUpPageType.confirmLimitedPartnerUsualResidentialAddress
      ) {
        pageRouting.previousUrl = this.insertIdsInUrl(pageRouting.data?.previousUrlUpdateLimitedPartnerPerson, ids);
        return;
      }

      if (
        pageRouting.pageType === AddressLookUpPageType.enterLimitedPartnerPrincipalOfficeAddress
      ) {
        pageRouting.previousUrl = this.insertIdsInUrl(pageRouting.data?.previousUrlUpdateLimitedPartnerLegalEntity, ids);
      }
    }
  }

  postcodeValidation() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.addressService.setI18n(response.locals.i18n);

        const { tokens, ids } = super.extract(request);
        const { postal_code, premises } = request.body;
        const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
        const addressRouting = this.getAddressRouting(request.url);
        const pageRouting = super.getRouting(addressRouting, pageType, request);

        let limitedPartnership;
        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

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
          const { generalPartner, limitedPartner } = await this.getPartnerGPandLP(pageType, tokens, ids);

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

        let limitedPartnership;
        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        const addressRouting = this.getAddressRouting(request.url);
        const pageRouting = super.getRouting(addressRouting, pageType, request);

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
          const { generalPartner, limitedPartner } = await this.getPartnerGPandLP(pageType, tokens, ids);

          const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, ids.transactionId);

          this.conditionalBackLink(pageRouting, ids?.generalPartnerId ? generalPartner : limitedPartner, ids);

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
        const addressRouting = this.getAddressRouting(request.url);
        const pageRouting = super.getRouting(addressRouting, pageType, request);

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

        const isGeneralPartnerAddress = AddressLookUpController.GENERAL_PARTNER_PAGES.has(pageType);
        const isLimitedPartnerAddress = AddressLookUpController.LIMITED_PARTNER_PAGES.has(pageType);

        const uiErrors = this.addressService.hasCountry(address);

        // store in api
        let result;
        if (uiErrors?.hasErrors()) {
          result = { errors: uiErrors };
        } else if (isGeneralPartnerAddress) {
          result = await this.generalPartnerService.sendPageData(tokens, ids.transactionId, ids.generalPartnerId, data);
        } else if (isLimitedPartnerAddress) {
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
          const { generalPartner, limitedPartner } = await this.getPartnerGPandLP(pageType, tokens, ids);

          let limitedPartnership;

          if (!isGeneralPartnerAddress && !isLimitedPartnerAddress && ids.transactionId && ids.submissionId) {
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
              { cache: { ...cache, ...cacheById }, generalPartner, limitedPartner, limitedPartnership },
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

  generalPartnerUsualResidentialaddressChoice() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
        const addressRouting = this.getAddressRouting(request.url);
        const pageRouting = super.getRouting(addressRouting, pageType, request);

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
        const addressRouting = this.getAddressRouting(request.url);
        const pageRouting = super.getRouting(addressRouting, pageType, request);

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

  private getAddressRouting(url: string) {
    const journeyTypes = getJourneyTypes(url);

    if (journeyTypes.isRegistration) {
      return registrationAddressRouting;
    } else if (journeyTypes.isTransition) {
      return transitionAddressRouting;
    } else {
      return postTransitionAddressRouting;
    }
  }

  private async getData(ids: Ids, tokens: Tokens) {
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

    return { limitedPartnership, generalPartner, limitedPartner };
  }

  private async getAddressList(
    pageRouting: PageRouting,
    cache: Record<string, any>,
    tokens: Tokens
  ): Promise<Address[]> {
    let addressList: Address[] = [];

    if (AddressLookUpController.LIST_PAGES.has(pageRouting.pageType)) {
      const cacheKey = pageRouting.data?.[AddressCacheKeys.addressCacheKey];
      const postcode = cache[cacheKey]?.postal_code;

      addressList = await this.addressService.getAddressListForPostcode(tokens, postcode);
    }

    return addressList;
  }

  private addAddressToCache(
    request: Request,
    response: Response,
    pageType: any,
    transactionId: string,
    address: Address
  ) {
    const cacheById = this.cacheService.getDataFromCacheById(request.signedCookies, transactionId);
    const addressRouting = this.getAddressRouting(request.url);
    const pageRouting = super.getRouting(addressRouting, pageType, request);

    const cache = this.cacheService.addDataToCache(request.signedCookies, {
      [transactionId]: {
        ...cacheById,
        [pageRouting?.data?.[AddressCacheKeys.addressCacheKey]]: address
      }
    });
    response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);
  }

  private async conditionalNextUrl(tokens: Tokens, ids: Ids, pageRouting: PageRouting, request: Request) {
    const pageTypes: Array<PageType | PageDefault> = [
      AddressLookUpPageType.confirmRegisteredOfficeAddress,
      AddressLookUpPageType.confirmPrincipalPlaceOfBusinessAddress
    ];

    let limitedPartnership;

    if (pageTypes.includes(pageRouting.pageType) && ids.transactionId && ids.submissionId) {
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
    if (ids.generalPartnerId) {
      await this.handleConditionalNextUrlForGeneralPartners(tokens, ids, pageRouting, request);
    }
    if (ids.limitedPartnerId) {
      await this.handleConditionalNextUrlForLimitedPartners(tokens, ids, pageRouting, request);
    }
  }

  private async handleConditionalNextUrlForGeneralPartners(tokens: Tokens, ids: Ids, pageRouting: PageRouting, request: Request) {
    if (!isConfirmGeneralPartnerAddressPageType(pageRouting.pageType)) {
      return;
    }

    const generalPartner = await this.generalPartnerService.getGeneralPartner(
      tokens,
      ids.transactionId,
      ids.generalPartnerId
    );

    if (pageRouting.pageType === AddressLookUpPageType.confirmGeneralPartnerUsualResidentialAddress) {
      if (generalPartner?.data?.service_address?.address_line_1) {
        pageRouting.nextUrl = super.insertIdsInUrl(pageRouting.data?.confirmAddressUrl, ids, request.url);
      } else if (generalPartner?.data?.kind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL,
          ids,
          request.url
        );
      }
    }

    if (pageRouting.pageType === AddressLookUpPageType.confirmGeneralPartnerCorrespondenceAddress) {
      if (generalPartner.data?.kind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
          ids,
          request.url
        );
      }
    }

    if (pageRouting.pageType === AddressLookUpPageType.confirmGeneralPartnerPrincipalOfficeAddress) {
      if (generalPartner.data?.kind === PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
          ids,
          request.url
        );
      }
    }
  }

  private async handleConditionalNextUrlForLimitedPartners(tokens: Tokens, ids: Ids, pageRouting: PageRouting, request: Request) {
    if (!isConfirmLimitedPartnerAddressPageType(pageRouting.pageType)) {
      return;
    }

    const limitedPartner = await this.limitedPartnerService.getLimitedPartner(
      tokens,
      ids.transactionId,
      ids.limitedPartnerId
    );

    if (pageRouting.pageType === AddressLookUpPageType.confirmLimitedPartnerUsualResidentialAddress) {
      if (limitedPartner?.data?.kind === PartnerKind.UPDATE_LIMITED_PARTNER_PERSON) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL,
          ids,
          request.url
        );
      }
    }
  }

  private async handleAddressNotFound(
    tokens: Tokens,
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

    const ids = super.extractIds(response.req);

    let limitedPartnership;

    if (ids.transactionId && ids.submissionId) {
      limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        transactionId,
        submissionId
      );
    }

    return response.render(
      super.templateName(pageRouting.currentUrl),
      super.makeProps(pageRouting, { cache, limitedPartnership }, uiErrors)
    );
  }

  private saveAndRedirectToNextPage(request: Request, response: Response<any, Record<string, any>>, dataToStore: any) {
    const { ids } = super.extract(request);
    const pageType = super.extractPageTypeOrThrowError(request, AddressLookUpPageType);
    const addressRouting = this.getAddressRouting(request.url);
    const pageRouting = super.getRouting(addressRouting, pageType, request);

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

  private async getPartnerGPandLP(pageType: any, tokens: Tokens, ids: Ids) {
    let generalPartner = {};
    let limitedPartner = {};

    if (AddressLookUpController.GENERAL_PARTNER_PAGES.has(pageType)) {
      generalPartner = await this.generalPartnerService.getGeneralPartner(
        tokens,
        ids.transactionId,
        ids.generalPartnerId
      );
    }

    if (AddressLookUpController.LIMITED_PARTNER_PAGES.has(pageType)) {
      limitedPartner = await this.limitedPartnerService.getLimitedPartner(
        tokens,
        ids.transactionId,
        ids.limitedPartnerId
      );
    }

    return { generalPartner, limitedPartner };
  }
}

export default AddressLookUpController;
