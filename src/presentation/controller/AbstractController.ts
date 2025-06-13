import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

import {
  GENERAL_PARTNER_ID,
  GENERAL_PARTNER_WITH_ID_URL,
  LIMITED_PARTNER_ID,
  LIMITED_PARTNER_WITH_ID_URL,
  REGISTRATION_BASE_URL,
  REGISTRATION_WITH_IDS_URL,
  SUBMISSION_ID,
  TRANSACTION_ID,
  TRANSITION_BASE_URL,
  TRANSITION_WITH_IDS_URL
} from "../../config/constants";
import { PageRouting, pageRoutingDefault, PagesRouting } from "./PageRouting";
import PageType from "./PageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  WHICH_TYPE_URL
} from "./registration/url";
import UIErrors from "../../domain/entities/UIErrors";
import { getJourneyTypes } from "../../utils";

type Ids = {
  transactionId: string,
  submissionId: string,
  generalPartnerId?: string,
  limitedPartnerId?: string
};

abstract class AbstractController {
  protected getRouting(routing: PagesRouting, pageType: PageType, request: Request) {
    let pageRouting = routing.get(pageType);

    if (!pageRouting) {
      return pageRoutingDefault;
    }

    pageRouting = this.insertIdsInAllUrl(
      pageRouting,
      {
        transactionId: request.params[TRANSACTION_ID],
        submissionId: request.params[SUBMISSION_ID],
        generalPartnerId: request.params[GENERAL_PARTNER_ID],
        limitedPartnerId: request.params[LIMITED_PARTNER_ID]
      } as Ids
    );

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
    ids: Ids,
    requestUrl?: string
  ): string {
    if (requestUrl) {
      const requestUrlParam = requestUrl.split("?")[1];
      const urlParam = url.split("?")[1];
      if (requestUrlParam && !urlParam) {
        url = `${url}?${requestUrlParam}`;
      }
    }
    url = this.replaceBaseUrlWithIds(url, ids);
    url = this.insertSubmissionId(url, ids.submissionId);
    url = this.insertTransactionId(url, ids.transactionId);
    url = this.insertGeneralPartnerId(url, ids.generalPartnerId);
    url = this.insertLimitedPartnerId(url, ids.limitedPartnerId);
    return url;
  }

  private replaceBaseUrlWithIds(
    url: string,
    ids: Ids
  ) {
    // general partner urls that can exist with or without ids
    const GP_URLS = [ADD_GENERAL_PARTNER_PERSON_URL, ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL];

    const urlWithIds = getJourneyTypes(url).isRegistration ? REGISTRATION_WITH_IDS_URL : TRANSITION_WITH_IDS_URL;

    if (ids.transactionId && ids.submissionId && ids.generalPartnerId && GP_URLS.includes(url)) {
      url = url.replace(urlWithIds, urlWithIds + GENERAL_PARTNER_WITH_ID_URL);
    }

    // limited partner urls that can exist with or without ids
    const LP_URLS = [ADD_LIMITED_PARTNER_PERSON_URL, ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL];

    if (ids.transactionId && ids.submissionId && ids.limitedPartnerId && LP_URLS.includes(url)) {
      url = url.replace(urlWithIds, urlWithIds + LIMITED_PARTNER_WITH_ID_URL);
    }

    return url;
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

  protected insertIdsInAllUrl(
    pageRouting: PageRouting,
    ids: Ids
  ): PageRouting {

    return {
      ...pageRouting,
      previousUrl: this.insertIdsInUrl(
        pageRouting.previousUrl,
        ids
      ),
      currentUrl: this.insertIdsInUrl(
        pageRouting.currentUrl,
        ids
      ),
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

  protected extractTokens(request: Request) {
    return {
      access_token: request?.session?.data?.signin_info?.access_token?.access_token ?? "",
      refresh_token: request?.session?.data?.signin_info?.access_token?.refresh_token ?? ""
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

    const previousPageUrlRegistration = headers.filter((item) => item.includes(REGISTRATION_BASE_URL))[0];
    const previousPageUrlTransition = headers.filter((item) => item.includes(TRANSITION_BASE_URL))[0];

    if (previousPageUrlRegistration) {
      const startingIndexOfRelativePath = previousPageUrlRegistration.indexOf(REGISTRATION_BASE_URL);
      return previousPageUrlRegistration.substring(startingIndexOfRelativePath);
    } else if (previousPageUrlTransition) {
      const startingIndexOfRelativePath = previousPageUrlTransition.indexOf(TRANSITION_BASE_URL);
      return previousPageUrlTransition.substring(startingIndexOfRelativePath);
    }

    return WHICH_TYPE_URL;
  }
}

export default AbstractController;
