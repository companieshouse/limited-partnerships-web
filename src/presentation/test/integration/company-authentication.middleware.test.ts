import { Request, Response } from "express";
import { companyAuthentication } from "../../../middlewares/company-authentication.middleware";
import * as constants from "../../../config/constants";
import { Session } from "@companieshouse/node-session-handler";
import { APPLICATION_CACHE_KEY_COMPANY_NUMBER } from "../../../config/constants";

const signedCookies = {
  [constants.APPLICATION_CACHE_KEY]: Buffer.from(
    JSON.stringify({ [APPLICATION_CACHE_KEY_COMPANY_NUMBER]: "12345678" })
  ).toString("base64")
};

describe("company authentication middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: { data: { signin_info: { company_number: "12345678" } } },
      signedCookies: {},
      url: "/test"
    } as Request & { session: Session };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next() if session company number matches cache", () => {
    req.signedCookies = signedCookies;

    companyAuthentication(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should call next() if session company number exists and cache is empty", () => {
    req.signedCookies = {};
    companyAuthentication(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should invoke authMiddleware if session company number does not match cache", () => {
    req.session = { data: { signin_info: { company_number: "87654321" } } } as Session;
    req.signedCookies = signedCookies;

    companyAuthentication(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
