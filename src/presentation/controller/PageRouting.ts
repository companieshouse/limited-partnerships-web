import CustomError from "../../domain/entities/CustomError";
import PageType from "./PageType";

export type PageRouting = {
  previousUrl: string;
  currentUrl: string;
  nextUrl: string;
  pageType: PageType | PageDefault;
  data?: Record<string, any>;
  errors?: CustomError[];
};

export type PagesRouting = Map<PageType, PageRouting>;

enum PageDefault {
  default = "not-found",
}

export const pageRoutingDefault = {
  previousUrl: "",
  currentUrl: "",
  nextUrl: "",
  pageType: PageDefault.default,
};
