import { Request, Response } from "express";
import { companyAuthentication } from "../../../middlewares/company-authentication.middleware";
import { Session } from "@companieshouse/node-session-handler";

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

    companyAuthentication(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
