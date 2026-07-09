import { Request, Response, NextFunction } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { languageMiddleware } from "../../../middlewares/language.middleware";
import { setLocalesEnabled } from "../utils";

describe("languageMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { query: {}, session: new Session() };
    res = {};
    next = jest.fn();
    setLocalesEnabled(true);
  });

  it.each([["en"], ["cy"]])(
    "stores the '%s' language on the session when the lang query param is present",
    (lang) => {
      (req.query as Record<string, string>).lang = lang;

      languageMiddleware(req as Request, res as Response, next as NextFunction);

      expect((req.session as Session).getLanguage()).toEqual(lang);
      expect(next).toHaveBeenCalled();
    }
  );

  it("normalises an unsupported language to 'en'", () => {
    (req.query as Record<string, string>).lang = "fr";

    languageMiddleware(req as Request, res as Response, next as NextFunction);

    expect((req.session as Session).getLanguage()).toEqual("en");
    expect(next).toHaveBeenCalled();
  });

  it("does not set a language when there is no lang query param", () => {
    languageMiddleware(req as Request, res as Response, next as NextFunction);

    expect((req.session as Session).getLanguage()).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it("does not throw when there is no session on the request", () => {
    req.session = undefined;
    (req.query as Record<string, string>).lang = "cy";

    expect(() => languageMiddleware(req as Request, res as Response, next as NextFunction)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });
});
