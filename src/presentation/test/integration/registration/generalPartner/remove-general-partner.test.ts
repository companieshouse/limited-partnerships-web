import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { REMOVE_GENERAL_PARTNER_URL } from "../../../../controller/registration/url";

describe("Remove General Partner Page", () => {
  const URL = getUrl(REMOVE_GENERAL_PARTNER_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get Remove General Partners Page", () => {
    it("should load the remove general partners page with English text", async () => {
      setLocalesEnabled(true);

      const generalPartnerPerson = new GeneralPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${enTranslationText.removeGeneralPartnerPage.title} - ${enTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, enTranslationText.removeGeneralPartnerPage);

      expect(res.text).toContain(`${generalPartnerPerson?.data?.forename} ${generalPartnerPerson?.data?.surname}`);
    });

    it("should load the remove general partners page with Welsh text", async () => {
      setLocalesEnabled(true);

      const generalPartnerLegalEntity = new GeneralPartnerBuilder()
        .isLegalEntity()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerLegalEntity]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${cyTranslationText.removeGeneralPartnerPage.title} - ${cyTranslationText.service} - GOV.UK`
      );

      testTranslations(res.text, cyTranslationText.removeGeneralPartnerPage);

      expect(res.text).toContain(`${generalPartnerLegalEntity?.data?.legal_entity_name}`);
    });
  });
});
