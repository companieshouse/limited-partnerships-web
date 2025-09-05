import { UIValidationErrors } from "../../domain/entities/UIErrors";
import PageType from "./PageType";

export type PageRouting =
  | {
      previousUrl: string;
      currentUrl: string;
      currentUrlWithLimitedPartnershipId?: string;
      currentUrlWithGeneralPartnerId?: string;
      currentUrlWithLimitedPartnerId?: string;
      nextUrl: string;
      pageType: PageType | PageDefault;
      data?: Record<string, any>;
      errors?: UIValidationErrors;
    }
  | typeof pageRoutingDefault;

export type PagesRouting = Map<PageType, PageRouting>;

export enum PageDefault {
  default = "not-found"
}

export const pageRoutingDefault = {
  previousUrl: "",
  currentUrl: "",
  currentUrlWithLimitedPartnershipId: "",
  currentUrlWithGeneralPartnerId: "",
  currentUrlWithLimitedPartnerId: "",
  nextUrl: "",
  pageType: PageDefault.default,
  data: null,
  errors: null
};
