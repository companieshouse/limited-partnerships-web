import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../locales/en/errors.json";

import app from "../../app";

import GeneralPartnerBuilder from "../../../../../presentation/test/builder/GeneralPartnerBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import CompanyProfileBuilder from "../../../../../presentation/test/builder/CompanyProfileBuilder";
import { WHEN_DID_GENERAL_PARTNER_DETAILS_CHANGE_URL, GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL } from "presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { ApiErrors } from "domain/entities/UIErrors";

describe("General partner change date page", () => {
  const URL = getUrl(WHEN_DID_GENERAL_PARTNER_DETAILS_CHANGE_URL);

  let generalPartner;

  beforeEach(() => {
    setLocalesEnabled(false);
    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([
      generalPartner,
    ]);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  describe("GET general partner change date page", () => {
    it.each([
      ["English", "en"],
      ["Welsh", "cy"]
    ])("should load general partner change date page with %s text", async (_description: string, lang: string) => {
      setLocalesEnabled(true);
      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);

      if (lang === "cy") {
        expect(res.text).toContain("WELSH - ");
        expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.generalPartner.title}`);
      } else {
        expect(res.text).not.toContain("WELSH -");
        expect(res.text).toContain(`${enTranslationText.dateOfUpdate.generalPartner.title}`);
      }
    });
  });

  describe("POST general partner change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidGeneralPartnerDetailsChange
      });

      const REDIRECT_URL = getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should display the specifc error message rather than the original when the date is before the incorporation date", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const originalErrorMessage = "Default";
      const expectedErrorMessage = toEscapedHtml(enErrorMessages.errorMessages.dateOfUpdate.term);
      const apiErrors: ApiErrors = {
        errors: { date_of_update: originalErrorMessage }
      };
      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidTheTermChange
      });

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(originalErrorMessage);
      expect(res.text).toContain(expectedErrorMessage);
    });
  });
});
