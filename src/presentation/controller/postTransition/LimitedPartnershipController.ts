import { NextFunction, Request, Response } from "express";
import {
  IncorporationKind,
  LimitedPartnership,
  PartnershipKind,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import AbstractController from "../AbstractController";
import UIErrors from "../../../domain/entities/UIErrors";
import { Ids, Tokens } from "../../../domain/types";
import { PageRouting } from "../PageRouting";

import postTransitionRouting from "./routing";
import PostTransitionPageType from "./pageType";
import {
  DATE_OF_UPDATE_TYPE_PREFIX,
  DATE_OF_UPDATE_TEMPLATE,
  JOURNEY_TYPE_PARAM,
  CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX,
  CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE,
  TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP,
  CHS_URL,
  TRANSACTION_DESCRIPTION_DESIGNATE_AS_PRIVATE_FUND_PARTNERSHIP,
  JOURNEY_QUERY_PARAM
} from "../../../config/constants";
import { getJourneyTypes } from "../../../utils";
import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import TransactionService from "../../../application/service/TransactionService";
import AddressService from "../../../application/service/AddressService";

import { CONFIRMATION_POST_TRANSITION_URL, PAYMENT_RESPONSE_URL } from "../global/url";
import { LANDING_PAGE_URL } from "./url";
import PaymentService from "../../../application/service/PaymentService";

class LimitedPartnershipController extends AbstractController {
  constructor(
    private readonly addressService: AddressService,
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly transactionService: TransactionService,
    private readonly paymentService: PaymentService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        this.conditionalPreviousUrl(pageRouting, request);

        const limitedPartnership = await this.getLimitedPartnership(ids, tokens);

        const submissionId = ids.submissionId;

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, submissionId }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  getCompanyPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const { ids, pageType } = super.extract(request);
        let pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const result = await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, null, result.errors)
          );

          return;
        }

        if (pageRouting?.data) {
          pageRouting = {
            ...pageRouting,
            data: {
              ...pageRouting.data,
              addGeneralPartner: super.insertIdsInUrl(pageRouting?.data?.addGeneralPartner, ids), // insert company number into the link
              addLimitedPartner: super.insertIdsInUrl(pageRouting?.data?.addLimitedPartner, ids),
              updateROA: super.insertIdsInUrl(pageRouting?.data?.updateROA, ids),
              updatePPOB: super.insertIdsInUrl(pageRouting?.data?.updatePPOB, ids),
              updateName: super.insertIdsInUrl(pageRouting?.data?.updateName, ids),
              updateTerm: super.insertIdsInUrl(pageRouting?.data?.updateTerm, ids),
              redesignateToPflp: super.insertIdsInUrl(pageRouting?.data?.redesignateToPflp, ids)
            },
            errors: undefined
          };
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership: result.limitedPartnership }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  checkCompanyNumber() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);
        const { company_number } = request.body;

        const result = await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, company_number.trim());

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { company_number: company_number.trim() }, result.errors)
          );

          return;
        }

        const url = super.insertIdsInUrl(pageRouting.nextUrl, {
          ...ids,
          companyId: company_number.trim()
        });

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  limitedPartnershipConfirm() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  getTermRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        this.conditionalPreviousUrl(pageRouting, request);

        const limitedPartnership = await this.getLimitedPartnership(ids, tokens);

        if (
          limitedPartnership?.data?.partnership_type === PartnershipType.PFLP ||
          limitedPartnership?.data?.partnership_type === PartnershipType.SPFLP
        ) {
          response.redirect(
            super
              .insertIdsInUrl(LANDING_PAGE_URL, ids, request.url)
              .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey)
          );
          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Handles the creation of a limited partnership entity.
   *
   * This method returns an Express middleware function that processes the creation flow for a limited partnership,
   * including validation, transaction creation, and partnership submission. It supports conditional address validation
   * and error handling at each step, rendering the appropriate template with error data if necessary, or redirecting
   * to the next page on success.
   *
   * @param partnershipKind - The type of partnership to create.
   * @param addressKey - (Optional) The key for the address field to validate and process.
   * @returns An Express middleware function for handling the limited partnership creation request.
   */
  create(partnershipKind: PartnershipKind, addressKey?: string) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const { limitedPartnership } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const errorData = this.makeErrorData(
          limitedPartnership,
          addressKey ? { [addressKey]: { ...request.body } } : request.body
        );

        if (addressKey) {
          const errors = this.validateAddress(request, response, limitedPartnership, partnershipKind);
          if (errors?.hasErrors()) {
            return response.render(
              super.templateName(pageRouting.currentUrl),
              super.makeProps(pageRouting, errorData, errors)
            );
          }
        }

        const transactionDescription = response.locals.serviceName ?? TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP;
        const resultTransaction = await this.createTransaction(
          limitedPartnership, tokens, transactionDescription);
        if (resultTransaction.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, errorData, resultTransaction.errors)
          );
        }

        const resultLimitedPartnershipCreate = await this.createPartnership(
          request,
          limitedPartnership,
          resultTransaction.transactionId,
          partnershipKind,
          addressKey ? { [addressKey]: request.body } : request.body
        );
        if (resultLimitedPartnershipCreate.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, errorData, resultLimitedPartnershipCreate.errors)
          );
        }

        const newIds = {
          ...ids,
          transactionId: resultTransaction.transactionId,
          submissionId: resultLimitedPartnershipCreate.submissionId
        };
        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);
        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Handles the update of a limited partnership entity.
   *
   * This method returns an Express middleware function that:
   * - Extracts tokens, IDs, and page type from the request.
   * - Retrieves the limited partnership data.
   * - Validates address data if an address key is provided.
   * - Renders the page with errors if validation fails.
   * - Sends the page data to the limited partnership service.
   * - Renders the page with service errors if any are returned.
   * - Redirects to the next page upon successful submission.
   *
   * @param addressKey - Optional key indicating which address is being processed.
   * @returns An Express middleware function to handle the request.
   */
  sendPageData(addressKey?: string) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const limitedPartnership = await this.getLimitedPartnership(ids, tokens);

        const errorData = this.makeErrorData(
          limitedPartnership,
          addressKey ? { [addressKey]: { ...request.body } } : request.body
        );

        if (addressKey) {
          const errors = this.validateAddress(request, response, limitedPartnership, limitedPartnership.data?.kind ?? "");
          if (errors?.hasErrors()) {
            return response.render(
              super.templateName(pageRouting.currentUrl),
              super.makeProps(pageRouting, errorData, errors)
            );
          }
        }

        const patchResult = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          addressKey ? { [addressKey]: request.body } : request.body
        );

        let template = super.templateName(pageRouting.currentUrl);

        if (pageRouting.currentUrl.includes(DATE_OF_UPDATE_TYPE_PREFIX)) {
          template = DATE_OF_UPDATE_TEMPLATE;
        } else if (pageRouting.currentUrl.includes(CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX)) {
          template = CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE;
        }

        if (patchResult?.errors) {
          this.specifyErrorMessagesForDateOfUpdate(patchResult.errors, response, pageRouting);
          return response.render(template, super.makeProps(pageRouting, errorData, patchResult.errors));
        }

        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids);
        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  private specifyErrorMessagesForDateOfUpdate(errors: UIErrors, response: Response<any, Record<string, any>>, pageRouting: PageRouting) {
    if (errors.errors.errorList[0].href === "#date_of_update") {
      errors.errors.errorList[0].text = response.locals.i18n.errorMessages.dateOfUpdate[pageRouting?.data?.titleKey];
      errors.errors.date_of_update.text = response.locals.i18n.errorMessages.dateOfUpdate[pageRouting?.data?.titleKey];
    }
  }

  getDateOfUpdate() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const limitedPartnership = await this.getLimitedPartnership(ids, tokens);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);

        response.render(DATE_OF_UPDATE_TEMPLATE, super.makeProps(pageRouting, { limitedPartnership, cache }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  getCheckYourAnswersPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const limitedPartnership = await this.getLimitedPartnership(ids, tokens);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);

        response.render(
          CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE,
          super.makeProps(pageRouting, { limitedPartnership, cache }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  postCheckYourAnswers(payment = false) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);

        let redirectUrl = super
          .insertIdsInUrl(CONFIRMATION_POST_TRANSITION_URL, ids, request.url)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        if (response.locals?.serviceName) {
          const serviceName = response.locals?.serviceName.toLowerCase().replace(/\s+/g, '-');
          redirectUrl = this.addOrAppendQueryParam(redirectUrl, JOURNEY_QUERY_PARAM, serviceName);
        }

        const closeTransactionResponse = await this.limitedPartnershipService.closeTransaction(
          tokens,
          ids.transactionId
        );

        if (payment) {
          const startPaymentSessionUrl: string = closeTransactionResponse.headers?.["x-payment-required"];

          if (!startPaymentSessionUrl) {
            throw new Error("No payment URL found in response header from closeTransaction");
          }

          const urlWithJourney = `${CHS_URL}${PAYMENT_RESPONSE_URL}`.replace(
            JOURNEY_TYPE_PARAM,
            getJourneyTypes(request.url).journey
          );

          const paymentReturnUri = super.insertIdsInUrl(urlWithJourney, ids, request.url);

          redirectUrl = await this.paymentService.startPaymentSession(
            tokens,
            startPaymentSessionUrl,
            paymentReturnUri,
            ids.transactionId
          );

          if (!redirectUrl) {
            throw new Error("No payment redirect URL returned from start payment session");
          }
        }

        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  postRedesignateToPFLP() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);
        const { limitedPartnership } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const errorData = this.makeErrorData(
          limitedPartnership,
          request.body
        );

        const resultTransaction = await this.createTransaction(
          limitedPartnership, tokens, TRANSACTION_DESCRIPTION_DESIGNATE_AS_PRIVATE_FUND_PARTNERSHIP);
        if (resultTransaction.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, errorData, resultTransaction.errors)
          );
        }

        const resultLimitedPartnershipCreate = await this.createPartnership(
          request,
          limitedPartnership,
          resultTransaction.transactionId,
          PartnershipKind.UPDATE_PARTNERSHIP_REDESIGNATE_TO_PFLP,
          {
            ...request.body,
            date_of_update: new Date().toISOString().split('T')[0]
          }
        );
        if (resultLimitedPartnershipCreate.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, errorData, resultLimitedPartnershipCreate.errors)
          );
        }

        const newIds = {
          ...ids,
          transactionId: resultTransaction.transactionId,
          submissionId: resultLimitedPartnershipCreate.submissionId
        };

        let redirectUrl = super
          .insertIdsInUrl(CONFIRMATION_POST_TRANSITION_URL, newIds, request.url)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        if (response.locals?.serviceName) {
          const serviceName = response.locals?.serviceName.toLowerCase().replace(/\s+/g, '-');
          redirectUrl = this.addOrAppendQueryParam(redirectUrl, JOURNEY_QUERY_PARAM, serviceName);
        }

        const closeTransactionResponse = await this.limitedPartnershipService.closeTransaction(
          tokens,
          newIds.transactionId
        );

        const startPaymentSessionUrl: string = closeTransactionResponse.headers?.["x-payment-required"];
        if (!startPaymentSessionUrl) {
          throw new Error("No payment URL found in response header from closeTransaction");
        }

        const urlWithJourney = `${CHS_URL}${PAYMENT_RESPONSE_URL}`.replace(
          JOURNEY_TYPE_PARAM,
          getJourneyTypes(request.url).journey
        );

        const paymentReturnUri = super.insertIdsInUrl(urlWithJourney, newIds, request.url);

        redirectUrl = await this.paymentService.startPaymentSession(
          tokens,
          startPaymentSessionUrl,
          paymentReturnUri,
          newIds.transactionId
        );

        if (!redirectUrl) {
          throw new Error("No payment redirect URL returned from start payment session");
        }
        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private validateAddress(
    request: Request,
    response: Response,
    limitedPartnership: LimitedPartnership,
    partnershipKind: string
  ): UIErrors | undefined {
    this.addressService.setI18n(response.locals.i18n);

    let errors: UIErrors | undefined;

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

    errors = this.addressService.validateAddressCharactersAndLength(address, errors);

    errors = this.addressService.isValidPostcode(postal_code ?? "", country, errors);

    if (partnershipKind !== PartnershipKind.UPDATE_PARTNERSHIP_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS) {
      errors = this.addressService.isValidJurisdictionAndCountry(
        limitedPartnership?.data?.jurisdiction ?? "",
        country,
        errors
      );
    }

    return errors;
  }

  private async getLimitedPartnership(ids: Ids, tokens: Tokens): Promise<LimitedPartnership> {
    let limitedPartnership: LimitedPartnership;

    if (ids.transactionId && ids.submissionId) {
      limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        ids.transactionId,
        ids.submissionId
      );
    } else {
      limitedPartnership = (await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId))
        .limitedPartnership;
    }

    return limitedPartnership;
  }

  private conditionalPreviousUrl(pageRouting: PageRouting, request: Request) {
    const previousPageType = super.pageType(request.get("Referrer") ?? "");

    const endOfPreviousUrl = pageRouting.previousUrl.split("/").pop() ?? "";

    if (previousPageType.includes(CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX)) {
      pageRouting.previousUrl = pageRouting.previousUrl.replace(endOfPreviousUrl, previousPageType);
    }
  }

  private async createTransaction(limitedPartnership: LimitedPartnership, tokens: Tokens, description: string) {
    const resultTransaction = await this.transactionService.createTransaction(
      tokens,
      IncorporationKind.POST_TRANSITION,
      {
        companyName: limitedPartnership?.data?.partnership_name ?? "",
        companyNumber: limitedPartnership?.data?.partnership_number ?? ""
      },
      description
    );

    return resultTransaction;
  }

  private async createPartnership(
    request: Request,
    limitedPartnership: LimitedPartnership,
    transactionId: string,
    partnershipKind: PartnershipKind,
    data: Record<string, any>
  ) {
    const { tokens } = super.extract(request);
    const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);

    const resultLimitedPartnershipCreate = await this.limitedPartnershipService.createLimitedPartnership(
      tokens,
      transactionId,
      pageType,
      {
        partnership_number: limitedPartnership?.data?.partnership_number,
        partnership_name: limitedPartnership?.data?.partnership_name,
        partnership_type: limitedPartnership?.data?.partnership_type,
        jurisdiction: limitedPartnership?.data?.jurisdiction,
        kind: partnershipKind,
        ...data
      }
    );

    return resultLimitedPartnershipCreate;
  }

  private makeErrorData(limitedPartnership: LimitedPartnership, data: Record<string, any>): Record<string, any> | null {
    return {
      limitedPartnership: {
        ...limitedPartnership,
        data: { ...limitedPartnership.data, ...data }
      }
    };
  }
}

export default LimitedPartnershipController;
