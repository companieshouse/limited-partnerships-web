import request from "supertest";
import { LocalesService } from "@companieshouse/ch-node-utils";
import * as config from "../../../../config/constants";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { EMAIL_URL } from "../../../controller/registration/Routing";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

describe("Email Page", () => {
  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
  });

  const setLocalesEnabled = (bool: boolean) => {
    jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
    LocalesService.getInstance().enabled = bool;
  };

  describe("Get Email Page", () => {
    it("should load the name page with English text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(EMAIL_URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.emailPage.emailUsedFor.title} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(enTranslationText.emailPage.whatIsEmail);
      expect(res.text).toContain(enTranslationText.emailPage.emailHint);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the name page with Welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(EMAIL_URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.emailPage.emailUsedFor.title} - ${cyTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(cyTranslationText.emailPage.whatIsEmail);
      expect(res.text).toContain(cyTranslationText.emailPage.emailHint);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the name page with data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.registrationGateway.feedLimitedPartnerships([
        limitedPartnership,
      ]);

      const res = await request(app).get(EMAIL_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain(
        `${limitedPartnership?.data?.partnership_name} ${limitedPartnership?.data?.name_ending}`
      );
    });
  });

  describe("Post email", () => {
    it("should send email", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.registrationGateway.submissionId)
        .build();

      appDevDependencies.registrationGateway.feedLimitedPartnerships([
        limitedPartnership,
      ]);

      const url = appDevDependencies.registrationController.insertIdsInUrl(
        EMAIL_URL,
        appDevDependencies.registrationGateway.transactionId,
        appDevDependencies.registrationGateway.submissionId
      );

      const res = await request(app).post(url).send({
        pageType: RegistrationPageType.email,
        email: "test@example.com",
      });

      const redirectUrl = `/limited-partnerships/transaction/${appDevDependencies.registrationGateway.transactionId}/submission/${appDevDependencies.registrationGateway.submissionId}/general-partners`;

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});
