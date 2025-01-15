import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";

import * as constants from "../../../../config/constants";
import {
  appDevDependencies,
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION
} from "../../../../config";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  LIMITED_PARTNER_CHOICE_URL,
  NEXT_URL
} from "../../../controller/registration/url";
import { registrationRoutingLimitedPartnerChoice } from "../../../controller/registration/Routing";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

describe("Limited Partner Choice Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(constants, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the limited partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity
    );
  });

  it("should load the limited partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity
    );
  });

  it("should store the limited partner choice to cache", async () => {
    const transactionId = "3664373";
    const submissionId = "1543454";
    const selectedChoice = "person";

    const url = appDevDependencies.registrationController.insertIdsInUrl(
      LIMITED_PARTNER_CHOICE_URL,
      transactionId,
      submissionId
    );

    const res = await request(app).post(url).send({
      pageType: registrationRoutingLimitedPartnerChoice.pageType,
      parameter: selectedChoice
    });

    expect(res.status).toBe(302);
    const nextPageUrl =
      appDevDependencies.registrationController.insertIdsInUrl(
        NEXT_URL,
        transactionId,
        submissionId
      );
    expect(res.header.location).toEqual(nextPageUrl);

    // to be removed - not store in cache
    expect(appDevDependencies.cacheRepository.cache).toEqual({
      [APPLICATION_CACHE_KEY]: {
        [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.limitedPartnerChoice}`]:
          selectedChoice
      }
    });
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.registrationGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name} ${limitedPartnership?.data?.name_ending}`
    );
  });
});
