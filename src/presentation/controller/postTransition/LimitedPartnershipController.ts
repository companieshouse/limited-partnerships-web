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
  TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP
} from "../../../config/constants";
import { formatDate } from "../../../utils/date-format";
import { getJourneyTypes } from "../../../utils";

import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import TransactionService from "../../../application/service/TransactionService";
import AddressService from "../../../application/service/AddressService";

import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import { LANDING_PAGE_URL } from "./url";

class LimitedPartnershipController extends AbstractController {
  constructor(
    private readonly addressService: AddressService,
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly transactionService: TransactionService
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
        console.log(error);
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
              updateName: super.insertIdsInUrl(pageRouting?.data?.updateName, ids),
              updateTerm: super.insertIdsInUrl(pageRouting?.data?.updateTerm, ids)
            },
            errors: undefined
          };
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership: result.limitedPartnership.data }, null)
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

        const result = await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, company_number);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { company_number }, result.errors)
          );

          return;
        }

        const url = super.insertIdsInUrl(pageRouting.nextUrl, {
          ...ids,
          companyId: company_number
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

  createRegisteredOfficeAddress() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const { limitedPartnership } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const errors = this.validateAddress(request, response, limitedPartnership);
        if (errors?.hasErrors()) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              this.makeErrorData(limitedPartnership, { address: { ...request.body } }),
              errors
            )
          );
        }

        const resultTransaction = await this.createTransaction(limitedPartnership, tokens);
        if (resultTransaction.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              this.makeErrorData(limitedPartnership, { address: { ...request.body } }),
              resultTransaction.errors
            )
          );
        }

        const resultLimitedPartnershipCreate = await this.createPartnership(
          request,
          limitedPartnership,
          resultTransaction.transactionId,
          PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS,
          { registered_office_address: request.body }
        );
        if (resultLimitedPartnershipCreate.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              this.makeErrorData(limitedPartnership, { address: { ...request.body } }),
              resultLimitedPartnershipCreate.errors
            )
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

  createPartnershipName() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const { limitedPartnership } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const resultTransaction = await this.createTransaction(limitedPartnership, tokens);
        if (resultTransaction.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, this.makeErrorData(limitedPartnership, request.body), resultTransaction.errors)
          );
        }

        const resultLimitedPartnershipCreate = await this.createPartnership(
          request,
          limitedPartnership,
          resultTransaction.transactionId,
          PartnershipKind.UPDATE_PARTNERSHIP_NAME,
          request.body
        );
        if (resultLimitedPartnershipCreate.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              this.makeErrorData(limitedPartnership, request.body),
              resultLimitedPartnershipCreate.errors
            )
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
        console.log(error);
        next(error);
      }
    };
  }

  sendPageData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let data = request.body;

        const limitedPartnership = await this.getLimitedPartnership(ids, tokens);

        if (pageType === PostTransitionPageType.enterRegisteredOfficeAddress) {
          const errors = this.validateAddress(request, response, limitedPartnership);
          if (errors?.hasErrors()) {
            return response.render(
              super.templateName(pageRouting.currentUrl),
              super.makeProps(
                pageRouting,
                this.makeErrorData(limitedPartnership, { address: { ...request.body } }),
                errors
              )
            );
          }

          data = {
            registered_office_address: request.body
          };
        }

        const patchResult = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          data
        );

        let template = super.templateName(pageRouting.currentUrl);

        if (pageRouting.currentUrl.includes(DATE_OF_UPDATE_TYPE_PREFIX)) {
          template = DATE_OF_UPDATE_TEMPLATE;
        } else if (pageRouting.currentUrl.includes(CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX)) {
          template = CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE;
        }

        if (patchResult?.errors) {
          return response.render(
            template,
            super.makeProps(
              pageRouting,
              this.makeErrorData(
                limitedPartnership,
                pageType === PostTransitionPageType.enterRegisteredOfficeAddress
                  ? { address: { ...request.body } }
                  : request.body
              ),
              patchResult.errors
            )
          );
        }

        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids);
        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  getDateOfUpdate() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        this.conditionalPreviousUrl(pageRouting, request);

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

        if (limitedPartnership?.data?.date_of_update) {
          limitedPartnership.data.date_of_update = formatDate(
            limitedPartnership.data.date_of_update,
            response.locals.i18n
          );
        }

        response.render(
          CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE,
          super.makeProps(pageRouting, { limitedPartnership, cache }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  postCheckYourAnswers() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        await this.limitedPartnershipService.closeTransaction(tokens, ids.transactionId);

        const url = super
          .insertIdsInUrl(CONFIRMATION_POST_TRANSITION_URL, ids, request.url)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  private validateAddress(
    request: Request,
    response: Response,
    limitedPartnership: LimitedPartnership
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

    errors = this.addressService.isValidJurisdictionAndCountry(
      limitedPartnership?.data?.jurisdiction ?? "",
      country,
      errors
    );

    return errors;
  }

  private async getLimitedPartnership(ids: Ids, tokens: Tokens): Promise<LimitedPartnership> {
    let limitedPartnership = {};

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

  private async createTransaction(limitedPartnership: LimitedPartnership, tokens: Tokens) {
    const resultTransaction = await this.transactionService.createTransaction(
      tokens,
      IncorporationKind.POST_TRANSITION,
      {
        companyName: limitedPartnership?.data?.partnership_name ?? "",
        companyNumber: limitedPartnership?.data?.partnership_number ?? ""
      },
      TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP
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
