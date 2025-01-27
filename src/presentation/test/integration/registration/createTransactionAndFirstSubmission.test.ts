import request from "supertest";
import { Request, Response } from "express";
import {
  NameEndingType,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { EMAIL_URL, NAME_URL } from "../../../controller/registration/url";
import RegistrationPageType from "../../../controller/registration/PageType";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION
} from "../../../../config/constants";
import { getUrl } from "../../utils";

describe("Create transaction and the first submission", () => {
  const URL = getUrl(NAME_URL);
  const REDIRECT_URL = getUrl(EMAIL_URL);

  beforeAll(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the name page with status 200", async () => {
    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.LP
    });

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain("What is the limited partnership name?");
  });

  it("should create a transaction and the first submission", async () => {
    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.LP
    });

    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.name,
      partnership_name: "Test Limited Partnership",
      name_ending: NameEndingType.LIMITED_PARTNERSHIP,
      partnership_type: PartnershipType.LP
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {}
    });
  });

  it("should return validation errors", async () => {
    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.name
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain("partnership_name must be less than 160");
  });

  it("should return a status 500 if page type doesn't exist - sq", async () => {
    const res = await request(app).post(URL).send({
      pageType: "wrong-page-type"
    });

    expect(res.status).toBe(500);
  });

  it("should call next if type in path is incorrect - sq", async () => {
    const next = jest.fn();

    await appDevDependencies.globalController.getPageRouting()(
      {
        path: "/limited-partnerships/wrong-type"
      } as Request,
      {} as Response,
      next
    );

    expect(next).toHaveBeenCalled();
  });
});
