import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

import {
  BASE_WITH_IDS_URL,
  GENERAL_PARTNER_ID,
  GENERAL_PARTNER_WITH_ID_URL,
  LIMITED_PARTNER_ID,
  LIMITED_PARTNER_WITH_ID_URL,
  BASE_URL,
  SUBMISSION_ID,
  TRANSACTION_ID
} from "../../config/constants";
import { PageRouting, pageRoutingDefault, PagesRouting } from "./PageRouting";
import PageType from "./PageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
} from "./registration/url";
import UIErrors from "../../domain/entities/UIErrors";
import { START_URL } from "./global/Routing";

abstract class AbstractController {
  protected getRouting(routing: PagesRouting, pageType: PageType, request: Request) {
    let pageRouting = routing.get(pageType);

    if (!pageRouting) {
      return pageRoutingDefault;
    }

    pageRouting = this.insertIdsInAllUrl(
      pageRouting,
      request.params[TRANSACTION_ID],
      request.params[SUBMISSION_ID],
      request.params[GENERAL_PARTNER_ID],
      request.params[LIMITED_PARTNER_ID]
    );

    pageRouting = this.addLangToUrls(request.url, pageRouting);

    return pageRouting;
  }

  protected pageType(path: string) {
    const type = this.templateName(path);

    return type as PageType;
  }

  protected makeProps(
    pageRouting: PageRouting,
    data: Record<string, any> | null,
    errors: UIErrors | null
  ) {
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
    const { transactionId, submissionId, generalPartnerId, limitedPartnerId } = this.extractIds(request);

    return {
      session,
      tokens,
      pageType,
      ids: {
        transactionId,
        submissionId,
        generalPartnerId,
        limitedPartnerId
      }
    };
  }

  protected templateName(url: string): string {
    const urlWithoutQueryParams = url.split("?")[0];
    const splitted = urlWithoutQueryParams.split("/");
    return splitted[splitted.length - 1];
  }

  insertIdsInUrl(
    url: string,
    transactionId = "",
    submissionId = "",
    generalPartnerId = "",
    limitedPartnerId = ""
  ): string {
    url = this.replaceBaseUrlWithIds(url, transactionId, submissionId, generalPartnerId, limitedPartnerId);
    url = this.insertSubmissionId(url, submissionId);
    url = this.insertTransactionId(url, transactionId);
    url = this.insertGeneralPartnerId(url, generalPartnerId);
    url = this.insertLimitedPartnerId(url, limitedPartnerId);
    return url;
  }

  private replaceBaseUrlWithIds(
    url: string,
    transactionId: string,
    submissionId: string,
    generalPartnerId: string,
    limitedPartnerId: string
  ) {
    // general partner urls that can exist with or without ids
    const GP_URLS = [
      ADD_GENERAL_PARTNER_PERSON_URL,
      ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL
    ];

    if (transactionId && submissionId && generalPartnerId && GP_URLS.includes(url)) {
      url = url.replace(BASE_WITH_IDS_URL, GENERAL_PARTNER_WITH_ID_URL);
    }

    // limited partner urls that can exist with or without ids
    const LP_URLS = [
      ADD_LIMITED_PARTNER_PERSON_URL,
      ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
    ];

    if (transactionId && submissionId && limitedPartnerId && LP_URLS.includes(url)) {
      url = url.replace(BASE_WITH_IDS_URL, LIMITED_PARTNER_WITH_ID_URL);
    }

    return url;
  }

  protected insertTransactionId(url: string, transactionId: string): string {
    return transactionId ? url.replace(`:${TRANSACTION_ID}`, transactionId) : url;
  }

  protected insertSubmissionId(url: string, submissionId: string): string {
    return submissionId ? url.replace(`:${SUBMISSION_ID}`, submissionId) : url;
  }

  protected insertGeneralPartnerId(url: string, generalPartnerId: string): string {
    return generalPartnerId
      ? url.replace(`:${GENERAL_PARTNER_ID}`, generalPartnerId)
      : url;
  }

  protected insertLimitedPartnerId(url: string, limitedPartnerId: string): string {
    return limitedPartnerId
      ? url.replace(`:${LIMITED_PARTNER_ID}`, limitedPartnerId)
      : url;
  }

  protected insertIdsInAllUrl(
    pageRouting: PageRouting,
    transactionId: string,
    submissionId: string,
    generalPartnerId: string,
    limitedPartnerId: string
  ): PageRouting {
    return {
      ...pageRouting,
      previousUrl: this.insertIdsInUrl(
        pageRouting.previousUrl,
        transactionId,
        submissionId,
        generalPartnerId,
        limitedPartnerId
      ),
      currentUrl: this.insertIdsInUrl(
        pageRouting.currentUrl,
        transactionId,
        submissionId,
        generalPartnerId,
        limitedPartnerId
      ),
      nextUrl: this.insertIdsInUrl(
        pageRouting.nextUrl,
        transactionId,
        submissionId,
        generalPartnerId,
        limitedPartnerId
      )
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

  protected extractTokens(request: Request) {
    return {
      access_token: request?.session?.data?.signin_info?.access_token?.access_token ?? "",
      refresh_token:
        request?.session?.data?.signin_info?.access_token?.refresh_token ?? ""
    };
  }

  protected extractIds(request: Request) {
    const transactionId = request.params.transactionId;
    const submissionId = request.params.submissionId;
    const generalPartnerId = request.params.generalPartnerId;
    const limitedPartnerId = request.params.limitedPartnerId;

    return { transactionId, submissionId, generalPartnerId, limitedPartnerId };
  }

  protected getPreviousPageUrl(request: Request) {
    const headers = request.rawHeaders;
    const previousPageUrl = headers.filter(item => item.includes(BASE_URL))[0];
    if (previousPageUrl) {
      const startingIndexOfRelativePath = previousPageUrl.indexOf(BASE_URL);
      return previousPageUrl.substring(startingIndexOfRelativePath);
    }
    return START_URL;
  }
}

export default AbstractController;
