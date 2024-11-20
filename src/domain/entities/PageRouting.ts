import CustomError from "./CustomError";
import PageRegistrationType from "../../application/registration/PageRegistrationType";
import { START_URL } from "../../config/constants";
import { NAME_URL } from "../../application/registration/Routing";

export type PageRouting = {
  previousUrl: string;
  currentUrl: string;
  nextUrl: string;
  pageType: PageRegistrationType;
  data?: Record<string, any>;
  errors?: CustomError[];
};

export type PagesRouting = Map<PageRegistrationType, PageRouting>;

export const pageRoutingDefault = {
  previousUrl: "/",
  currentUrl: START_URL,
  nextUrl: NAME_URL,
  pageType: PageRegistrationType.start,
};
