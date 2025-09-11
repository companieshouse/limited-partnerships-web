import { NextFunction, Request, Response } from "express";

import AbstractController from "../AbstractController";

import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import postTransitionRouting from "./routing";
import PostTransitionPageType from "./pageType";
import TransactionService from "../../../application/service/TransactionService";
import {
  IncorporationKind,
  LimitedPartnership,
  PartnershipKind
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import AddressService from "../../../application/service/AddressService";
import UIErrors from "../../../domain/entities/UIErrors";
import {
  DATE_OF_UPDATE_TYPE_PREFIX,
  DATE_OF_UPDATE_TEMPLATE,
  JOURNEY_TYPE_PARAM,
  CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX,
  CHANGE_CHECK_YOUR_ANSWERS_TEMPLATE,
  TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP
} from "../../../config/constants";
import { Ids, Tokens } from "../../../domain/types";
import { formatDate } from "../../../utils/date-format";
import { CONFIRMATION_POST_TRANSITION_URL } from "../global/url";
import { getJourneyTypes } from "../../../utils";
import { PageRouting } from "../PageRouting";

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

        const cache = this.cacheService.getDataFromCache(request.signedCookies);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, cache }, null)
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
              updateName: super.insertIdsInUrl(pageRouting?.data?.updateName, ids)
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
            super.makeProps(pageRouting, { address: { ...request.body }, limitedPartnership }, errors)
          );
        }

        const resultTransaction = await this.transactionService.createTransaction(
          tokens,
          IncorporationKind.POST_TRANSITION,
          {
            companyName: limitedPartnership?.data?.partnership_name ?? "",
            companyNumber: limitedPartnership?.data?.partnership_number ?? ""
          },
          TRANSACTION_DESCRIPTION_UPDATE_LIMITED_PARTNERSHIP
        );

        if (resultTransaction.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { address: { ...request.body }, limitedPartnership }, resultTransaction.errors)
          );
        }

        const resultLimitedPartnershipCreate = await this.limitedPartnershipService.createLimitedPartnership(
          tokens,
          resultTransaction.transactionId,
          pageType,
          {
            partnership_number: limitedPartnership?.data?.partnership_number,
            partnership_name: limitedPartnership?.data?.partnership_name,
            partnership_type: limitedPartnership?.data?.partnership_type,
            kind: PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS,
            registered_office_address: request.body
          }
        );

        if (resultLimitedPartnershipCreate.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { address: { ...request.body }, limitedPartnership },
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
        const { limitedPartnership } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const resultTransaction = await this.createTransaction(limitedPartnership, tokens);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        if (resultTransaction.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              {
                limitedPartnership: {
                  ...limitedPartnership,
                  data: { ...limitedPartnership.data, ...request.body }
                }
              },
              resultTransaction.errors
            )
          );
        }

        const resultLimitedPartnershipCreate = await this.createPartnership(
          request,
          limitedPartnership,
          tokens,
          resultTransaction,
          pageType,
          PartnershipKind.UPDATE_PARTNERSHIP_NAME
        );

        if (resultLimitedPartnershipCreate.errors) {
          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { address: { ...request.body }, limitedPartnership },
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

  async createTransaction(limitedPartnership: LimitedPartnership, tokens) {
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

  async createPartnership(
    request,
    limitedPartnership: LimitedPartnership,
    tokens,
    resultTransaction,
    pageType,
    partnershipKind: PartnershipKind
  ) {
    const resultLimitedPartnershipCreate = await this.limitedPartnershipService.createLimitedPartnership(
      tokens,
      resultTransaction.transactionId,
      pageType,
      {
        partnership_number: limitedPartnership?.data?.partnership_number,
        partnership_name: limitedPartnership?.data?.partnership_name,
        partnership_type: limitedPartnership?.data?.partnership_type,
        kind: partnershipKind,
        ...request.body
      }
    );
    return resultLimitedPartnershipCreate;
  }

  sendPageData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let data = request.body;

        const { limitedPartnership } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        if (pageType === PostTransitionPageType.enterRegisteredOfficeAddress) {
          const errors = this.validateAddress(request, response, limitedPartnership);
          if (errors?.hasErrors()) {
            return response.render(
              super.templateName(pageRouting.currentUrl),
              super.makeProps(pageRouting, { address: { ...request.body }, limitedPartnership }, errors)
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
            super.makeProps(pageRouting, { ...request.body, limitedPartnership }, patchResult.errors)
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
}

export default LimitedPartnershipController;
