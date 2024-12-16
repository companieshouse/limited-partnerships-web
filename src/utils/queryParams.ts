import { Request } from "express";

import { PageRouting } from "../presentation/controller/PageRouting";

const addLangToUrls = (request: Request, pageRouting: PageRouting, locals: Record<string, any>, ): {
    previousUrl: string,
    currentUrl: string,
    nextUrl: string} => {
  const localsLang = locals.lang;
  console.log(localsLang);
  let previousUrl;

  // current url
  const currentUrlParams = new URLSearchParams(new URL(`http://${request.url}`)?.search);
  const lang = currentUrlParams.get("lang") as string;
  const pageRoutingCurrentUrl = new URL(`http://${pageRouting.currentUrl}`);

  // next url
  const pageRoutingNextUrl = new URL(`http://${pageRouting.nextUrl}`);
  const pageRoutingNextUrlParams = new URLSearchParams(pageRoutingNextUrl?.search);

  // set extra queries in current url
  pageRoutingCurrentUrl.search = currentUrlParams.toString();
  if (lang) {
    pageRoutingNextUrl.search = setLang(pageRoutingNextUrlParams, lang);
  }

  // if previous url
  if (request?.headers?.referer) {
    // previous url
    const previousUrlParams = new URLSearchParams(new URL(request?.headers?.referer)?.search);

    // same url - page refreshed
    if (new URL(request?.headers?.referer).pathname === pageRoutingCurrentUrl.pathname) {

      if (lang) {
        previousUrlParams.set("lang", lang);
      }

      pageRoutingCurrentUrl.search = previousUrlParams.toString();
    } else {
      const previousUrlParams = new URLSearchParams(new URL(request?.headers?.referer)?.search);
      const pageRoutingPreviousUrl = new URL(`http://${pageRouting.previousUrl}`);

      // give priority to the language of the current url, as the previous one may be different
      if (currentUrlParams.has("lang")) {
        const lang = currentUrlParams.get("lang") as string;

        pageRoutingPreviousUrl.search = setLang(previousUrlParams, lang);
      } else if (previousUrlParams.has("lang")) {

        const lang = previousUrlParams.get("lang") as string;

        pageRoutingCurrentUrl.search = setLang(currentUrlParams, lang);
        pageRoutingNextUrl.search = setLang(pageRoutingNextUrlParams, lang);
      }

      // deletes query passed as parameter if no longer necessary
      const previousTemplate = templateName(pageRouting.previousUrl);
      const currentTemplate = templateName(pageRouting.currentUrl);
      if (currentUrlParams.has(previousTemplate) || previousUrlParams.has(currentTemplate)) {
        previousUrlParams.delete(previousTemplate);
      }

      // re-set extra queries in previous url
      pageRoutingPreviousUrl.search = previousUrlParams.toString();
      previousUrl = buildUrl(pageRoutingPreviousUrl);
    }

  }

  return {
    previousUrl,
    currentUrl: buildUrl(pageRoutingCurrentUrl),
    nextUrl: buildUrl(pageRoutingNextUrl)
  };
};

const buildUrl = (pageRoutingUrl: URL): string => {
  return `/${pageRoutingUrl.hostname}${pageRoutingUrl.pathname}${pageRoutingUrl.search}`;
};

const setLang = (pageRoutingUrlParams: URLSearchParams, value: string): string => {
  pageRoutingUrlParams.set("lang", value);
  return pageRoutingUrlParams.toString();
};

const templateName = (url: string): string => {
  const urlWithoutQueryParams = url.split("?")[0];
  const splitted = urlWithoutQueryParams.split("/");
  return splitted[splitted.length - 1];
};

export default addLangToUrls;
