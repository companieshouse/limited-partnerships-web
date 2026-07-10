import { Request, Response, NextFunction } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { localisationMiddleware } from "../../../middlewares/localisation.middleware";
import { setLocalesEnabled } from "../utils";

describe("localisationMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  const sessionWithLang = (lang: string): Session => {
    const session = new Session();
    session.setLanguage(lang);
    return session;
  };

  beforeEach(() => {
    req = { query: {}, session: undefined, originalUrl: "/limited-partnerships/some-page" };
    res = { locals: {} };
    next = jest.fn();
    setLocalesEnabled(true);
  });

  it.each([["en"], ["cy"]])("uses a valid '%s' lang query param over the session language", (lang) => {
    (req.query as Record<string, string>).lang = lang;
    // session deliberately holds the opposite language to prove the query wins
    req.session = sessionWithLang(lang === "en" ? "cy" : "en");

    localisationMiddleware(req as Request, res as Response, next as NextFunction);

    expect(res.locals?.lang).toEqual(lang);
    expect(next).toHaveBeenCalled();
  });

  it("falls back to the session language when there is no lang query param", () => {
    req.session = sessionWithLang("cy");

    localisationMiddleware(req as Request, res as Response, next as NextFunction);

    expect(res.locals?.lang).toEqual("cy");
    expect(next).toHaveBeenCalled();
  });

  it("falls back to the session language when the lang query param is malformed", () => {
    // reproduces the ?lang=cy?lang=cy double-append, which Express parses into
    // an invalid value that would otherwise render the page in English (LP-1529)
    (req.query as Record<string, string>).lang = "cy?lang=cy";
    req.session = sessionWithLang("cy");

    localisationMiddleware(req as Request, res as Response, next as NextFunction);

    expect(res.locals?.lang).toEqual("cy");
  });

  it("lets an explicit lang=en query param override a Welsh session language", () => {
    (req.query as Record<string, string>).lang = "en";
    req.session = sessionWithLang("cy");

    localisationMiddleware(req as Request, res as Response, next as NextFunction);

    expect(res.locals?.lang).toEqual("en");
  });

  it("defaults to English when there is neither a query param nor a session language", () => {
    localisationMiddleware(req as Request, res as Response, next as NextFunction);

    expect(res.locals?.lang).toEqual("en");
  });

  it("does not throw when there is no session on the request", () => {
    req.session = undefined;

    expect(() => localisationMiddleware(req as Request, res as Response, next as NextFunction)).not.toThrow();
    expect(res.locals?.lang).toEqual("en");
    expect(next).toHaveBeenCalled();
  });
});
