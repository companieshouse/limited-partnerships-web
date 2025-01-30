import request from "supertest";
import {
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { APPLICATION_CACHE_KEY_PREFIX_REGISTRATION } from "../../../../config/constants";
import RegistrationPageType from "../../../controller/registration/PageType";
import {
  WHAT_IS_YOUR_JURISDICTION_URL
} from "../../../controller/registration/url";

describe("Which jurisdiction page", () => {

  const URL = getUrl(WHAT_IS_YOUR_JURISDICTION_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
  });

  it("should load the name page with English text for EnglandWales jurisdiction", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
      PartnershipType.LP
    });

    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.whatIsYourJurisdiction.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.title);
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.whereIsJurisdiction);
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.options.EnglandWales);
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.options.NorthernIreland);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
  });

  it("should load the name page with Welsh text for EnglandWales jurisdiction", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
       PartnershipType.LP
    });

    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.whatIsYourJurisdiction.title} - ${cyTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(cyTranslationText.whatIsYourJurisdiction.title);
    expect(res.text).toContain(cyTranslationText.whatIsYourJurisdiction.whereIsJurisdiction);
    expect(res.text).toContain(cyTranslationText.whatIsYourJurisdiction.options.EnglandWales);
    expect(res.text).toContain(cyTranslationText.whatIsYourJurisdiction.options.NorthernIreland);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the name page with English text for Scotland SLP jurisdiction", async () => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.SLP
    });

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.whatIsYourJurisdiction.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.title);
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.scotlandHeading);
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.ifNotScotland);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
  });

  it("should load the name page with English text for Scotland SPFLP jurisdiction", async () => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache({
      [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`]:
        PartnershipType.SPFLP
    });

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.whatIsYourJurisdiction.title} - ${enTranslationText.service} - GOV.UK`
    );
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.title);
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.scotlandHeading);
    expect(res.text).toContain(enTranslationText.whatIsYourJurisdiction.ifNotScotland);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
  });
});
