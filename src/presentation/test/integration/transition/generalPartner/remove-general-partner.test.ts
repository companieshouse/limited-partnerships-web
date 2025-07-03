import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { REMOVE_GENERAL_PARTNER_URL, REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/transition/url";
import TransitionPageType from "../../../../controller/transition/PageType";

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
        `${enTranslationText.removePartnerPage.title} - ${enTranslationText.serviceTransition} - GOV.UK`
      );

      testTranslations(res.text, enTranslationText.removePartnerPage);

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
        `${cyTranslationText.removePartnerPage.title} - ${cyTranslationText.serviceTransition} - GOV.UK`
      );

      testTranslations(res.text, cyTranslationText.removePartnerPage);

      expect(res.text).toContain(`${generalPartnerLegalEntity?.data?.legal_entity_name}`);
    });
  });

  describe("Post Remove General Partners Page", () => {
    it("should redirect to the review general partners page - gp removed", async () => {
      setLocalesEnabled(true);

      const generalPartnerPerson = new GeneralPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson]);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.removeGeneralPartner,
        remove: "yes"
      });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(getUrl(REVIEW_GENERAL_PARTNERS_URL));

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(0);
    });

    it("should redirect to the review general partners page - gp not removed", async () => {
      setLocalesEnabled(true);

      const generalPartnerLegalEntity = new GeneralPartnerBuilder()
        .isLegalEntity()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerLegalEntity]);

      const res = await request(app).post(URL).send({
        pageType: TransitionPageType.removeGeneralPartner,
        remove: "no"
      });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(getUrl(REVIEW_GENERAL_PARTNERS_URL));

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
    });
  });
});
