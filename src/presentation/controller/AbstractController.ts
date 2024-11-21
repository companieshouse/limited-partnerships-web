import { PageRouting, pageRoutingDefault, PagesRouting } from "./PageRouting";
import PageType from "./PageType";

abstract class AbstractController {
  protected getRouting(routing: PagesRouting, pageType: PageType) {
    const registrationRouting = routing.get(pageType);

    return registrationRouting
      ? { ...registrationRouting }
      : pageRoutingDefault;
  }

  protected pageType(path: string) {
    const type = this.templateName(path);

    return type as PageType;
  }

  protected templateName(url: string): string {
    const splitted = url.split("/");
    return splitted[splitted.length - 1];
  }

  insertIdsInUrl(url: string, transactionId = "", submissionId = ""): string {
    return this.inserSubmissionId(
      this.inserTransactionId(url, transactionId),
      submissionId
    );
  }

  protected inserTransactionId(url: string, transactionId: string): string {
    return transactionId ? url.replace(":transactionId", transactionId) : url;
  }

  protected inserSubmissionId(url: string, submissionId: string): string {
    return submissionId ? url.replace(":submissionId", submissionId) : url;
  }

  protected inserIdsInAllUrl(
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
      ),
    };
  }
}

export default AbstractController;
