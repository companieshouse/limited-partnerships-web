import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  NAME_URL,
} from "../../../controller/registration/Routing";
import { appDevDependencies } from "../../../../config";
import RegistrationPageType from "../../../controller/registration/PageType";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Name Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
    appDevDependencies.cacheRepository.feedCache(null);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the name page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.LP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.namePage.title);
    expect(res.text).toContain(cyTranslationText.namePage.whatIsName);
    expect(res.text).toContain(cyTranslationText.namePage.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the name page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.LP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.title);
    expect(res.text).toContain(enTranslationText.namePage.whatIsName);
    expect(res.text).toContain(enTranslationText.namePage.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the private name page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.PFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.namePage.privateFund.title);
    expect(res.text).toContain(cyTranslationText.namePage.privateFund.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the private name page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.PFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.privateFund.title);
    expect(res.text).toContain(enTranslationText.namePage.privateFund.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the Scottish limited partnership name page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.SLP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.namePage.scottish.title);
    expect(res.text).toContain(cyTranslationText.namePage.scottish.nameEnding);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the Scottish limited partnership name page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.SLP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.scottish.title);
    expect(res.text).toContain(enTranslationText.namePage.scottish.nameEnding);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });

  it("should load the private name Scotland page with Welsh text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.SPFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(cyTranslationText.namePage.privateFund.scottish.title);
    expect(res.text).toContain(cyTranslationText.namePage.whatIsNameHint);
    expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
  });

  it("should load the private name Scotland page with English text", async () => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [RegistrationPageType.whichType]: PartnershipType.SPFLP
    });

    const res = await request(app).get(NAME_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.privateFund.scottish.title);
    expect(res.text).toContain(enTranslationText.namePage.whatIsNameHint);
    expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    expect(res.text).not.toContain("WELSH -");
  });
});
