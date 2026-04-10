import { NextFunction, Request, Response } from "express";
import { LimitedPartnership, PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import AbstractController from "../AbstractController";
import UIErrors from "../../../domain/entities/UIErrors";
import registrationsRouting from "./Routing";
import RegistrationPageType from "./PageType";
import { Ids } from "../../../domain/types";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import PersonWithSignificantControlService from "../../../application/service/PersonWithSignificantControlService";

import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  CHECK_YOUR_ANSWERS_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL
} from "./url";

class PersonWithSignificantControlRegistrationController extends AbstractController {
  constructor(
    protected readonly limitedPartnershipService: LimitedPartnershipService,
    protected readonly personWithSignificantControlService: PersonWithSignificantControlService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.personWithSignificantControlService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        let personWithSignificantControl;
        if (ids.personWithSignificantControlId) {
          personWithSignificantControl = await this.personWithSignificantControlService.getPersonWithSignificantControl(
            tokens,
            ids.transactionId,
            ids.personWithSignificantControlId
          );
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, personWithSignificantControl }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  sendHasPersonWithSignificantControl() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        if (!request.body.has_person_with_significant_control) {
          return await this.handleHasPersonWithSignificantControlMissing(request, response);
        }

        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          request.body
        );

        if (result?.errors) {
          return await this.renderWithPartnershipAndErrors(request, response, result.errors);
        }

        pageRouting.nextUrl = this.handlePersonWithSignficantControlRequiredConditionalNextUrl(request);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  personWithSignificantControlChoice() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        if (!request.body.parameter) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          const uiErrors = new UIErrors();
          uiErrors.formatValidationErrorToUiErrors({
            errors: {
              parameter: response.locals.i18n.personWithSignificantControl.whichTypePage.errorMessage
            }
          });

          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, limitedPartnership, uiErrors)
          );
        }

        const redirectUrl = this.getAddPersonWithSignificantControlRedirectUrl(request, ids);

        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private getAddPersonWithSignificantControlRedirectUrl(request, ids: Ids) {
    let url = ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL;

    if (request.body.parameter === PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY) {
      url = ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL;
    } else if (request.body.parameter === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
      url = ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL;
    }

    return super.insertIdsInUrl(url, ids, request.url);
  }

  createPersonWithSignificantControl() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.personWithSignificantControlService.setI18n(response.locals.i18n);

        const { ids, pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.personWithSignificantControlService.createPersonWithSignificantControl(
          tokens,
          ids.transactionId,
          request.body
        );

        if (result.errors) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership, personWithSignificantControl: { data: request.body } },
              result.errors
            )
          );
        }

        const newIds = {
          ...ids,
          personWithSignificantControlId: result.personWithSignificantControlId
        };

        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  sendPageData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.personWithSignificantControlService.sendPageData(
          tokens,
          ids.transactionId,
          ids.personWithSignificantControlId,
          request.body
        );

        if (result?.errors) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership, personWithSignificantControl: { data: request.body } },
              result.errors
            )
          );
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async renderWithPartnershipAndErrors(request: Request, response: Response, resultErrors: UIErrors) {
    const { tokens, ids } = super.extract(request);
    const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
    const pageRouting = super.getRouting(registrationsRouting, pageType, request);

    const limitedPartnership: LimitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
      tokens,
      ids.transactionId,
      ids.submissionId
    );

    return response.render(
      super.templateName(pageRouting.currentUrl),
      super.makeProps(
        pageRouting,
        {
          limitedPartnership: {
            ...limitedPartnership,
            data: {
              ...limitedPartnership.data,
              ...request.body
            }
          }
        },
        resultErrors
      )
    );
  }

  private handlePersonWithSignficantControlRequiredConditionalNextUrl(request: Request) {
    const ids = super.extractIds(request);
    if (request.body.has_person_with_significant_control === "true") {
      return super.insertIdsInUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL, ids, request.url);
    } else {
      return super.insertIdsInUrl(CHECK_YOUR_ANSWERS_URL, ids, request.url);
    }
  }

  private async handleHasPersonWithSignificantControlMissing(request: Request, response: Response) {
    const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
    const pageRouting = super.getRouting(registrationsRouting, pageType, request);

    const uiErrors = new UIErrors();
    uiErrors.formatValidationErrorToUiErrors({
      errors: {
        has_person_with_significant_control:
          response.locals.i18n.personWithSignificantControl.willThePartnershipHaveAnyPscPage.errorMessage
      }
    });

    const ids = super.extractIds(request);

    let limitedPartnership;

    if (ids.transactionId && ids.submissionId) {
      limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        super.extractTokens(request),
        ids.transactionId,
        ids.submissionId
      );
    }

    return response.render(
      super.templateName(pageRouting.currentUrl),
      super.makeProps(pageRouting, { limitedPartnership }, uiErrors)
    );
  }
}

export default PersonWithSignificantControlRegistrationController;
