import request from "supertest";
import app from "../../app";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { CHECK_YOUR_ANSWERS_URL, PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL, WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL } from "../../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import RegistrationPageType from "../../../../controller/registration/PageType";

describe("Will Limited Partnership Have PSC Page", () => {
  const URL = getUrl(WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL);

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();
  });

  describe("Get Will Limited Partnership Have PSC Page", () => {
    it.each([
      "en",
      "cy"
    ])("should load the will limited partnership have psc page with %s text", async (lang: string) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;

      const limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${translationText.personWithSignificantControl.willThePartnershipHaveAnyPscPage.title} - ${translationText.serviceRegistration} - GOV.UK`
      );
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
      );
      testTranslations(res.text, translationText.personWithSignificantControl.willThePartnershipHaveAnyPscPage, ["errorMessage"]);

    });

    it.each([
      true,
      false
    ])("should preselect the has_person_with_significant_control value if it exists in the limited partnership data", async (hasPscSelection: boolean) => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withHasPersonWithSignificantControl(hasPscSelection)
        .build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(`value="${hasPscSelection}" checked`);
    });
  });

  describe("Post Will Limited Partnership Have PSC Page", () => {
    it.each([
      ["Which type of person with significant control (PSC) do you need to add page", "true"],
      ["check your answers page", "false"]
    ])("should redirect to %s page when the limited partnership has PSC selection %s", async (redirectPage: string, hasPscSelection: string) => {
      const REDIRECT_URL = hasPscSelection === "true" ? getUrl(PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL) : getUrl(CHECK_YOUR_ANSWERS_URL);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.willLimitedPartnershipHavePsc,
        has_person_with_significant_control: hasPscSelection
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should show an error when no selection is made", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.willLimitedPartnershipHavePsc
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.personWithSignificantControl.willThePartnershipHaveAnyPscPage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
      );
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
      );
      expect(res.text).toContain(enTranslationText.personWithSignificantControl.willThePartnershipHaveAnyPscPage.errorMessage);
    });

    it("should show an error when api validation error occurs", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
      const apiErrors = {
        errors: { has_person_with_significant_control: "has person with significant control cant be null" }
      };
      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.willLimitedPartnershipHavePsc,
        has_person_with_significant_control: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.personWithSignificantControl.willThePartnershipHaveAnyPscPage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
      );
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
      );
      expect(res.text).toContain(apiErrors.errors.has_person_with_significant_control);
    });
  });
});

