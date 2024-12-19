import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as constants from "../../../../config/constants";
import { appDevDependencies } from "../../../../config";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  LIMITED_PARTNER_CHOICE_URL,
  NEXT_URL,
  registrationRoutingLimitedPartnerChoice,
} from "../../../controller/registration/Routing";
import RegistrationPageType from "../../../controller/registration/PageType";

describe("Limited Partner Choice Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(constants, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  it("should load the limited partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(`${cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${cyTranslationText.service} - GOV.UK`);
    expect(res.text).toContain(cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity);
  });

  it("should load the limited partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(LIMITED_PARTNER_CHOICE_URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(`${enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${enTranslationText.service} - GOV.UK`);
    expect(res.text).toContain(enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity);
  });

  it("should pass the limited partner choice as a url query param to next page", async () => {
    const transactionId = "3664373";
    const submissionId = "1543454";
    const selectedChoice = "person";

    const url = appDevDependencies.registrationController.insertIdsInUrl(
      LIMITED_PARTNER_CHOICE_URL,
      transactionId,
      submissionId
    );

    const res = await request(app)
      .post(url)
      .send({
        pageType: registrationRoutingLimitedPartnerChoice.pageType,
        parameter: selectedChoice,
      });

    expect(res.status).toBe(302);
    const nextPageUrl = appDevDependencies.registrationController.insertIdsInUrl(
      NEXT_URL,
      transactionId,
      submissionId
    ) + `?${RegistrationPageType.limitedPartnerChoice}=${selectedChoice}`;
    expect(res.header.location).toEqual(nextPageUrl);
  });
});
