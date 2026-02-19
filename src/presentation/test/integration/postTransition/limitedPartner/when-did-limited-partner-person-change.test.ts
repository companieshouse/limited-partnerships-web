import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../locales/en/errors.json";

import app from "../../app";

import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
} from "../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { ApiErrors } from "domain/entities/UIErrors";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionBuilder from "../../../builder/TransactionBuilder";

describe("Limited partner person change date page", () => {
  const URL = getUrl(WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL);
  const BACK_LINK_URL = getUrl(UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL);

  let limitedPartner;

  beforeEach(() => {
    setLocalesEnabled(false);
    limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([
      limitedPartner,
    ]);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET limited partner change date page", () => {
    it.each([
      ["English", "en"],
      ["Welsh", "cy"]
    ])("should load limited partner change date page with %s text", async (description: string, lang: string) => {
      setLocalesEnabled(true);
      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(BACK_LINK_URL);
      expect(res.text).toContain(`${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`);

      if (lang === "cy") {
        expect(res.text).toContain("WELSH - ");
        expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.limitedPartner.title}`);
        expect(countOccurrences(res.text, toEscapedHtml(cyTranslationText.serviceName.updateLimitedPartnerPerson))).toBe(2);
      } else {
        expect(res.text).not.toContain("WELSH -");
        expect(res.text).toContain(`${enTranslationText.dateOfUpdate.limitedPartner.title}`);
        expect(countOccurrences(res.text, toEscapedHtml(enTranslationText.serviceName.updateLimitedPartnerPerson))).toBe(2);
      }
    });

    it("should populate the date fields with the existing date of update if it exists", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-year"[^>]*value="2024"[^>]*>/);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-month"[^>]*value="10"[^>]*>/);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-day"[^>]*value="10"[^>]*>/);
    });
  });

  describe("POST limited partner change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      expect(limitedPartner.data?.date_of_update).toBeUndefined();

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidLimitedPartnerPersonDetailsChange,
        "date_of_update-day": "10",
        "date_of_update-month": "10",
        "date_of_update-year": "2024"
      });

      const REDIRECT_URL = "/";

      expect(res.status).toBe(302);
      expect(limitedPartner.data?.date_of_update).toBe("2024-10-10");
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should display the specifc error message rather than the original when the date is before the incorporation date", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const originalErrorMessage = "Default";
      const expectedErrorMessage = toEscapedHtml(enErrorMessages.errorMessages.dateOfUpdate.limitedPartner);
      const apiErrors: ApiErrors = {
        errors: { date_of_update: originalErrorMessage }
      };
      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidLimitedPartnerPersonDetailsChange,
        "date_of_update-day": "10",
        "date_of_update-month": "01",
        "date_of_update-year": "2000"
      });

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(originalErrorMessage);
      expect(res.text).toContain(expectedErrorMessage);
      expect(res.text).toContain("10");
      expect(res.text).toContain("01");
      expect(res.text).toContain("2000");
      expect(res.text).toContain(BACK_LINK_URL);
      expect(res.text).toContain(`${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`);
    });
  });
});
