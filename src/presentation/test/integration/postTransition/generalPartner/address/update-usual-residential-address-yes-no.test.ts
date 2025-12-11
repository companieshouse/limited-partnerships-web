import request from "supertest";
import app from "../../../app";

import { getUrl, setLocalesEnabled, testTranslations } from "../../../../../../presentation/test/utils";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import GeneralPartnerBuilder from "../../../../../../presentation/test/builder/GeneralPartnerBuilder";
import { UPDATE_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL } from "../../../../../../presentation/controller/postTransition/url";
import CompanyProfileBuilder from "../../../../../../presentation/test/builder/CompanyProfileBuilder";

describe("Update Usual Residential Address Yes No Page", () => {
  const URL = getUrl(UPDATE_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const companyProfile = new CompanyProfileBuilder().build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();

    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  describe("GET Update Usual Residential Address Yes No Page", () => {

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the update usual residential address yes no page with %s text", async (_description: string, lang: string, translationText: any) => {
      setLocalesEnabled(true);

      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([
        generalPartner,
      ]);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${generalPartner.data?.forename?.toUpperCase()} ${generalPartner.data?.surname?.toUpperCase()}`
      );

      testTranslations(res.text, translationText.address.update.usualResidentialAddress);

      if (lang === "cy") {
        expect(res.text).toContain("WELSH - ");
      } else {
        expect(res.text).not.toContain("WELSH -");
      }
    });
  });
});

