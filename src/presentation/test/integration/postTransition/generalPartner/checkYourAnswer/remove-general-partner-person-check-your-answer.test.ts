import request from "supertest";
import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../../utils";

import { REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import GeneralPartnerBuilder from "../../../../builder/GeneralPartnerBuilder";

describe("Remove general partner check your answers page", () => {
  const URL = getUrl(REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL);
  let generalPartner: GeneralPartner;

  beforeEach(() => {
    setLocalesEnabled(true);

    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withCeaseDate("2025-01-01")
      .build();
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("GET remove general partner check your answers page", () => {
    it("should load remove general partner check your answers page with english text", async () => {
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(`${enTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(generalPartner.data?.forename + " " + generalPartner.data?.surname);
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.partners.generalPartners.ceaseDate);

      expect(res.text).toContain(enTranslationText.print.buttonText);
      expect(res.text).toContain(enTranslationText.print.buttonTextNoJs);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load remove general partner check your answers page with welsh text", async () => {
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(`${cyTranslationText.checkYourAnswersPage.update.title}`);
      expect(res.text).toContain(generalPartner.data?.forename + " " + generalPartner.data?.surname);
      expect(res.text).toContain(cyTranslationText.checkYourAnswersPage.partners.generalPartners.ceaseDate);

      expect(res.text).toContain(cyTranslationText.print.buttonText);
      expect(res.text).toContain(cyTranslationText.print.buttonTextNoJs);
      expect(res.text).toContain("WELSH -");
    });
  });
});
