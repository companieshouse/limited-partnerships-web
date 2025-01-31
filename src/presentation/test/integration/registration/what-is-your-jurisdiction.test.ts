import request from "supertest";
import {
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import {
  WHAT_IS_YOUR_JURISDICTION_URL
} from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

describe("Which jurisdiction page", () => {

  const URL = getUrl(WHAT_IS_YOUR_JURISDICTION_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
  });

  it("should load the jurisdiction page with English text for EnglandWales LP jurisdiction", async () => {
    setLocalesEnabled(true);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withPartnershipType(PartnershipType.LP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

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

  it("should load the jurisdiction page with Welsh text for EnglandWales LP jurisdiction", async () => {
    setLocalesEnabled(true);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withPartnershipType(PartnershipType.LP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

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

  it("should load the jurisdiction page with English text for EnglandWales PFLP jurisdiction", async () => {
    setLocalesEnabled(true);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withPartnershipType(PartnershipType.PFLP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

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

  it("should load the jurisdiction page with Welsh text for EnglandWales PFLP jurisdiction", async () => {
    setLocalesEnabled(true);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withPartnershipType(PartnershipType.PFLP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

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

  it("should load the jurisdiction page with English text for Scotland SLP jurisdiction", async () => {
    setLocalesEnabled(false);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withPartnershipType(PartnershipType.SLP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

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

  it("should load the jurisdiction page with English text for Scotland SPFLP jurisdiction", async () => {
    setLocalesEnabled(false);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withPartnershipType(PartnershipType.SPFLP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

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
