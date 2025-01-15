import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import {
  NameEndingType,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  NAME_URL,
  NAME_WITH_IDS_URL
} from "../../../controller/registration/url";
import {
  appDevDependencies,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION
} from "../../../../config";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

describe("Name Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the name page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.LP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.namePage.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(cyTranslationText.namePage.title);
    expect(res.text).toContain(cyTranslationText.namePage.whatIsName);
    expect(res.text).toContain(cyTranslationText.namePage.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the name page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.LP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.namePage.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.namePage.title);
    expect(res.text).toContain(enTranslationText.namePage.whatIsName);
    expect(res.text).toContain(enTranslationText.namePage.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the name page with data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.registrationGateway.submissionId)
      .withNameEnding(NameEndingType.LIMITED_PARTNERSHIP)
      .build();

    appDevDependencies.registrationGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

    const url = appDevDependencies.registrationController.insertIdsInUrl(
      NAME_WITH_IDS_URL,
      appDevDependencies.registrationGateway.transactionId,
      appDevDependencies.registrationGateway.submissionId
    );

    const res = await request(app).get(url);

    expect(res.status).toBe(200);
    expect(res.text).toContain(limitedPartnership?.data?.partnership_name);
    expect(res.text).toContain(limitedPartnership?.data?.name_ending);
  });

  it("should load the private name page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.PFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.namePage.privateFund.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(cyTranslationText.namePage.privateFund.title);
    expect(res.text).toContain(
      cyTranslationText.namePage.privateFund.nameEnding
    );
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the private name page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.PFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.namePage.privateFund.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.namePage.privateFund.title);
    expect(res.text).toContain(
      enTranslationText.namePage.privateFund.nameEnding
    );
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the Scottish limited partnership name page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.SLP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.namePage.scottish.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(cyTranslationText.namePage.scottish.title);
    expect(res.text).toContain(cyTranslationText.namePage.scottish.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the Scottish limited partnership name page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.SLP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.namePage.scottish.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.namePage.scottish.title);
    expect(res.text).toContain(enTranslationText.namePage.scottish.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the private name Scotland page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.SPFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.namePage.privateFund.scottish.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      cyTranslationText.namePage.privateFund.scottish.title
    );
    expect(res.text).toContain(cyTranslationText.namePage.whatIsNameHint);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the private name Scotland page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.SPFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.namePage.privateFund.scottish.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(
      enTranslationText.namePage.privateFund.scottish.title
    );
    expect(res.text).toContain(enTranslationText.namePage.whatIsNameHint);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });
});
