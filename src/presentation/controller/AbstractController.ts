import { Request } from "express";

import { BASE_URL, BASE_WITH_IDS_URL, SUBMISSION_ID, TRANSACTION_ID } from "../../config/constants";
import { PageRouting, pageRoutingDefault, PagesRouting } from "./PageRouting";
import PageType from "./PageType";
import { NAME_URL } from "./registration/url";
import { Session } from "@companieshouse/node-session-handler";
import UIErrors from "../../domain/entities/UIErrors";

abstract class AbstractController {
  protected getRouting(routing: PagesRouting, pageType: PageType, request: Request) {
    let pageRouting = routing.get(pageType);

    if (!pageRouting) {
      return pageRoutingDefault;
    }

    pageRouting = this.insertIdsInAllUrl(pageRouting, request.params[TRANSACTION_ID], request.params[SUBMISSION_ID]);

    pageRouting = this.addLangToUrls(request.url, pageRouting);

    return pageRouting;
  }

  protected pageType(path: string) {
    const type = this.templateName(path);

    return type as PageType;
  }

  protected makeProps(pageRouting: PageRouting, data: Record<string, any> | null, errors: UIErrors | null, i18n?: any) {
    if (data) {
      pageRouting.data = {
        ...pageRouting.data,
        ...data
      };
    }

    if (errors) {
      pageRouting.errors = errors.errors;
    }

    if (i18n) {
      console.log(JSON.stringify(pageRouting, null, 2));
      return {
        props: pageRouting,
        templateOptions: {
          baseTemplate: "layout.njk",
          whatIsOfficeAddress: i18n.address.findPostcode.registeredOfficeAddress.whatIsOfficeAddress,
          proposedName: `${data?.limitedPartnership.data.partnership_name?.toUpperCase()} ${data?.limitedPartnership.data.name_ending?.toUpperCase()}`,
          officialCommunication: i18n.address.findPostcode.registeredOfficeAddress.officialCommunication,
          partnership_type: data?.limitedPartnership.data.partnership_type,
          england: {
            physicalAddress: i18n.address.findPostcode.registeredOfficeAddress.england.physicalAddress,
            jurisdiction: i18n.address.findPostcode.registeredOfficeAddress.england.jurisdiction
          },
          scotland: {
            physicalAddress: i18n.address.findPostcode.registeredOfficeAddress.scotland.physicalAddress,
            jurisdiction: i18n.address.findPostcode.registeredOfficeAddress.scotland.jurisdiction
          },
          postcodeErrorMessage: i18n.address.findPostcode.errorPostcode,
          templateName: pageRouting.pageType,
          nameOrNumberHint: i18n.address.findPostcode.nameOrNumberHint,
          postcodeHint: i18n.address.findPostcode.postcodeHint,
          enterManualAddressUrl: pageRouting.currentUrl?.replace(pageRouting.pageType, pageRouting.data?.enterManualAddressPageType),
          enterAddressManually: i18n.address.findPostcode.enterAddressManually,
          findAddress: i18n.address.findPostcode.findAddress,
          publicRegisterTitle: i18n.address.findPostcode.registeredOfficeAddress.publicRegisterTitle,
          publicRegisterLine1: i18n.address.findPostcode.registeredOfficeAddress.publicRegisterLine1,
          govUk: {
            error: {
              title: i18n.govUk.error.title
            }
          },
          errors: pageRouting.errors,
          data: pageRouting.data
        }
      };
    }
    return {
      props: pageRouting
    };
  }

  protected extract(request: Request) {
    const session = request.session as Session;
    const tokens = this.extractTokens(request);
    const pageType = this.pageType(request.path);
    const { transactionId, submissionId } = this.extractIds(request);

    return {
      session,
      tokens,
      pageType,
      ids: {
        transactionId,
        submissionId
      }
    };
  }

  protected templateName(url: string): string {
    const urlWithoutQueryParams = url.split("?")[0];
    const splitted = urlWithoutQueryParams.split("/");
    return splitted[splitted.length - 1];
  }

  insertIdsInUrl(url: string, transactionId = "", submissionId = ""): string {
    url = this.replaceBaseUrlWithIds(transactionId, submissionId, url);
    url = this.insertSubmissionId(url, submissionId);
    url = this.insertTransactionId(url, transactionId);
    return url;
  }

  private replaceBaseUrlWithIds(transactionId: string, submissionId: string, url: string) {
    // urls that can exist with or without ids
    const URLS = [NAME_URL];

    if (transactionId && submissionId && URLS.includes(url)) {
      url = url.replace(BASE_URL, BASE_WITH_IDS_URL);
    }

    return url;
  }

  protected insertTransactionId(url: string, transactionId: string): string {
    return transactionId ? url.replace(`:${TRANSACTION_ID}`, transactionId) : url;
  }

  protected insertSubmissionId(url: string, submissionId: string): string {
    return submissionId ? url.replace(`:${SUBMISSION_ID}`, submissionId) : url;
  }

  protected insertIdsInAllUrl(pageRouting: PageRouting, transactionId: string, submissionId: string): PageRouting {
    return {
      ...pageRouting,
      previousUrl: this.insertIdsInUrl(pageRouting.previousUrl, transactionId, submissionId),
      currentUrl: this.insertIdsInUrl(pageRouting.currentUrl, transactionId, submissionId),
      nextUrl: this.insertIdsInUrl(pageRouting.nextUrl, transactionId, submissionId)
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

    return { transactionId, submissionId };
  }
}

export default AbstractController;
