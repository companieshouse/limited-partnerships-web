import CustomError from "../../domain/entities/CustomError";
import PageRegistrationType from "./registration/PageType";

export type PageRouting = {
  previousUrl: string;
  currentUrl: string;
  nextUrl: string;
  pageType: PageRegistrationType | PageDefault;
  data?: Record<string, any>;
  errors?: CustomError[];
};

export type PagesRouting = Map<PageRegistrationType, PageRouting>;

enum PageDefault {
  default = "not-found",
}

export const pageRoutingDefault = {
  previousUrl: "",
  currentUrl: "",
  nextUrl: "",
  pageType: PageDefault.default,
};
