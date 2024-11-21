import CustomError from "../../domain/entities/CustomError";
import PageRegistrationType from "./registration/PageRegistrationType";

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
  defualt = "default",
}

export const pageRoutingDefault = {
  previousUrl: "",
  currentUrl: "",
  nextUrl: "",
  pageType: PageDefault.defualt,
};
