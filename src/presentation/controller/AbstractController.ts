import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

import {
  APPOINTMENT_ID,
  COMPANY_ID,
  GENERAL_PARTNER_ID,
  LIMITED_PARTNER_ID,
  POST_TRANSITION_BASE_URL,
  REGISTRATION_BASE_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
  TRANSITION_BASE_URL
} from "../../config/constants";
import { PageRouting, pageRoutingDefault, PagesRouting } from "./PageRouting";
import PageType from "./PageType";
import { WHICH_TYPE_URL } from "./registration/url";
import UIErrors from "../../domain/entities/UIErrors";
import { Ids, Tokens } from "../../domain/types";

// This class is global and must not contain anything specific to a journey or entity
abstract class AbstractController {
  protected getRouting(routing: PagesRouting, pageType: PageType, request: Request) {
    let pageRouting = { ...routing.get(pageType) } as PageRouting;

    if (!pageRouting) {
      return pageRoutingDefault;
    }

    const ids = {
      companyId: request.params[COMPANY_ID],
      transactionId: request.params[TRANSACTION_ID],
      submissionId: request.params[SUBMISSION_ID],
      generalPartnerId: request.params[GENERAL_PARTNER_ID],
      limitedPartnerId: request.params[LIMITED_PARTNER_ID],
      appointmentId: request.params[APPOINTMENT_ID]
    } as Ids;

    pageRouting = this.insertIdsInAllUrl(pageRouting, ids);

    pageRouting = this.addLangToUrls(request.url, pageRouting);

    return pageRouting;
  }

  protected pageType(path: string) {
    const type = this.templateName(path);

    return type as PageType;
  }

  protected makeProps(pageRouting: PageRouting, data: Record<string, any> | null, errors: UIErrors | null) {
    if (data) {
      pageRouting.data = {
        ...pageRouting.data,
        ...data
      };
    }

    if (errors) {
      pageRouting.errors = errors.errors;
    }

    return {
      props: pageRouting
    };
  }

  protected extract(request: Request) {
    const session = request.session as Session;
    const tokens = this.extractTokens(request);
    const pageType = this.pageType(request.path);
    const { companyId, transactionId, submissionId, generalPartnerId, limitedPartnerId, appointmentId } =
      this.extractIds(request);

    return {
      session,
      tokens,
      pageType,
      ids: {
        companyId,
        transactionId,
        submissionId,
        generalPartnerId,
        limitedPartnerId,
        appointmentId
      }
    };
  }

  protected templateName(url: string): string {
    const urlWithoutQueryParams = url.split("?")[0];
    const splitted = urlWithoutQueryParams.split("/");
    return splitted[splitted.length - 1];
  }

  insertIdsInUrl(url: string, ids: Ids, requestUrl?: string): string {
    if (requestUrl) {
      const requestUrlParam = requestUrl.split("?")[1];
      const urlParam = url.split("?")[1];
      if (requestUrlParam && !urlParam) {
        url = `${url}?${requestUrlParam}`;
      }
    }

    url = this.insertCompanyId(url, ids.companyId);
    url = this.insertTransactionId(url, ids.transactionId);
    url = this.insertSubmissionId(url, ids.submissionId);
    url = this.insertGeneralPartnerId(url, ids.generalPartnerId);
    url = this.insertLimitedPartnerId(url, ids.limitedPartnerId);
    url = this.insertAppointmentId(url, ids.appointmentId);
    return url;
  }

  protected insertCompanyId(url: string, companyId: string): string {
    return companyId ? url.replace(`:${COMPANY_ID}`, companyId) : url;
  }

  protected insertTransactionId(url: string, transactionId: string): string {
    return transactionId ? url.replace(`:${TRANSACTION_ID}`, transactionId) : url;
  }

  protected insertSubmissionId(url: string, submissionId: string): string {
    return submissionId ? url.replace(`:${SUBMISSION_ID}`, submissionId) : url;
  }

  protected insertGeneralPartnerId(url: string, generalPartnerId?: string): string {
    return generalPartnerId ? url.replace(`:${GENERAL_PARTNER_ID}`, generalPartnerId) : url;
  }

  protected insertLimitedPartnerId(url: string, limitedPartnerId?: string): string {
    return limitedPartnerId ? url.replace(`:${LIMITED_PARTNER_ID}`, limitedPartnerId) : url;
  }

  protected insertAppointmentId(url: string, appointmentId?: string): string {
    return appointmentId ? url.replace(`:${APPOINTMENT_ID}`, appointmentId) : url;
  }

  protected insertIdsInAllUrl(pageRouting: PageRouting, ids: Ids): PageRouting {
    return {
      ...pageRouting,
      previousUrl: this.insertIdsInUrl(pageRouting.previousUrl, ids),
      currentUrl: this.insertIdsInUrl(pageRouting.currentUrl, ids),
      nextUrl: this.insertIdsInUrl(pageRouting.nextUrl, ids)
    };
  }

  private addLangToUrls(currentUrl: string, pageRouting: PageRouting): PageRouting {
    const currentUrlParams = new URLSearchParams(new URL(`http://${currentUrl}`)?.search);

    if (currentUrlParams.has("lang")) {
      const langQuery = `?lang=${currentUrlParams.get("lang")}`;

      return {
        ...pageRouting,
        previousUrl: `${pageRouting.previousUrl}${langQuery}`,
        currentUrl: `${pageRouting.currentUrl}${langQuery}`,
        nextUrl: `${pageRouting.nextUrl}${langQuery}`
      };
    }

    return pageRouting;
  }

  protected extractPageTypeOrThrowError(request: Request, pageTypeEnum: object) {
    const pageTypeList = Object.values(pageTypeEnum);
    const pageType = request.body.pageType;

    if (!pageTypeList.includes(pageType)) {
      throw new Error(`wrong page type: ${pageType}`);
    }
    return pageType;
  }

  protected extractTokens(request: Request): Tokens {
    return {
      access_token: request?.session?.data?.signin_info?.access_token?.access_token ?? "",
      refresh_token: request?.session?.data?.signin_info?.access_token?.refresh_token ?? ""
    };
  }

  protected extractIds(request: Request): Ids {
    const companyId = request.params.companyId;
    const transactionId = request.params.transactionId;
    const submissionId = request.params.submissionId;
    const generalPartnerId = request.params.generalPartnerId;
    const limitedPartnerId = request.params.limitedPartnerId;
    const appointmentId = request.params.appointmentId;

    return { transactionId, submissionId, companyId, generalPartnerId, limitedPartnerId, appointmentId };
  }

  protected getPreviousPageUrl(request: Request) {
    const headers = request.rawHeaders;

    const previousPageUrlRegistration = headers.filter((item) => item.includes(REGISTRATION_BASE_URL))[0];
    const previousPageUrlTransition = headers.filter((item) => item.includes(TRANSITION_BASE_URL))[0];
    const previousPageUrlPostTransition = headers.filter((item) => item.includes(POST_TRANSITION_BASE_URL))[0];

    if (previousPageUrlRegistration) {
      const startingIndexOfRelativePath = previousPageUrlRegistration.indexOf(REGISTRATION_BASE_URL);
      return previousPageUrlRegistration.substring(startingIndexOfRelativePath);
    } else if (previousPageUrlTransition) {
      const startingIndexOfRelativePath = previousPageUrlTransition.indexOf(TRANSITION_BASE_URL);
      return previousPageUrlTransition.substring(startingIndexOfRelativePath);
    } else if (previousPageUrlPostTransition) {
      const startingIndexOfRelativePath = previousPageUrlPostTransition.indexOf(POST_TRANSITION_BASE_URL);
      return previousPageUrlPostTransition.substring(startingIndexOfRelativePath);
    }

    return WHICH_TYPE_URL;
  }
}

export default AbstractController;
