import { UIValidationErrors } from "../../domain/entities/UIErrors";
import PageType from "./PageType";

export enum PageDefault {
  default = "not-found",
}

export const pageRoutingDefault = {
  previousUrl: "",
  currentUrl: "",
  nextUrl: "",
  pageType: PageDefault.default,
  data: undefined as unknown as Record<string, any> | undefined,
  errors: undefined as unknown as UIValidationErrors | undefined,
};

export type PageRouting =
  | {
      previousUrl: string;
      currentUrl: string;
      nextUrl: string;
      pageType: PageType | PageDefault;
      data?: Record<string, any>;
      errors?: UIValidationErrors;
    }
  | typeof pageRoutingDefault;

export type PagesRouting = Map<PageType, PageRouting>;

