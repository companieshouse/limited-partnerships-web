import { SUBMISSION_ID, TRANSACTION_ID } from "../../config/constants";
import { PageRouting, pageRoutingDefault, PagesRouting } from "./PageRouting";
import PageType from "./PageType";

abstract class AbstractController {
  protected getRouting(
    routing: PagesRouting,
    pageType: PageType,
    currentUrl: string,
    transactionId = "",
    submissionId = ""
  ) {
    let pageRouting = routing.get(pageType);

    if (!pageRouting) {
      return pageRoutingDefault;
    }

    pageRouting = this.insertIdsInAllUrl(
      pageRouting,
      transactionId,
      submissionId
    );

    pageRouting = this.addLangToUrls(currentUrl, pageRouting);

    return pageRouting;
  }

  protected pageType(path: string) {
    const type = this.templateName(path);

    return type as PageType;
  }

  protected templateName(url: string): string {
    const urlWithoutQueryParams = url.split("?")[0];
    const splitted = urlWithoutQueryParams.split("/");
    return splitted[splitted.length - 1];
  }

  insertIdsInUrl(url: string, transactionId = "", submissionId = ""): string {
    url = this.insertSubmissionId(url, submissionId);
    url = this.insertTransactionId(url, transactionId);
    return url;
  }

  protected insertTransactionId(url: string, transactionId: string): string {
    return transactionId
      ? url.replace(`:${TRANSACTION_ID}`, transactionId)
      : url;
  }

  protected insertSubmissionId(url: string, submissionId: string): string {
    return submissionId ? url.replace(`:${SUBMISSION_ID}`, submissionId) : url;
  }

  protected insertIdsInAllUrl(
    pageRouting: PageRouting,
    transactionId: string,
    submissionId: string
  ): PageRouting {
    return {
      ...pageRouting,
      previousUrl: this.insertIdsInUrl(
        pageRouting.previousUrl,
        transactionId,
        submissionId
      ),
      currentUrl: this.insertIdsInUrl(
        pageRouting.currentUrl,
        transactionId,
        submissionId
      ),
      nextUrl: this.insertIdsInUrl(
        pageRouting.nextUrl,
        transactionId,
        submissionId
      )
    };
  }

  private addLangToUrls(
    currentUrl: string,
    pageRouting: PageRouting
  ): PageRouting {
    const currentUrlParams = new URLSearchParams(
      new URL(`http://${currentUrl}`)?.search
    );

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
}

export default AbstractController;
