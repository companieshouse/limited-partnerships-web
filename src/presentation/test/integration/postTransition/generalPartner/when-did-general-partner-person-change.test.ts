import request from "supertest";

import app from "../../app";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
  UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL
} from "../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import { OFFICER_ROLE_GENERAL_PARTNER_PERSON } from "../../../../../config/constants";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";
import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
describe("General partner person change date page", () => {
  const URL = getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL);
  const BACK_LINK_URL = getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL);

  let generalPartner: TransactionGeneralPartner;

  beforeEach(() => {
    setLocalesEnabled(false);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const companyAppointmentPerson = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withCompanyNumber(companyProfile?.data?.companyNumber ?? "")
      .isPerson()
      .build();

    const [surname, forename] = companyAppointmentPerson?.name?.split(", ") ?? [];

    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withForename(forename)
      .withSurname(surname)
      .withDateOfUpdate("2024-10-10")
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET general partner change date page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load general partner change date page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);
        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(BACK_LINK_URL);
        expect(res.text).toContain(
          `${generalPartner.data?.forename?.toUpperCase()} ${generalPartner.data?.surname?.toUpperCase()}`
        );

        expect(res.text).toContain(`${translationText.dateOfUpdate.generalPartner.title}`);
        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateGeneralPartnerPerson))).toBe(2);

        expect(res.text).toContain(customerFeedbackUrlMap.updateGeneralPartnerPerson);

        expect(res.text).toContain(translationText.buttons.continue);
      }
    );

    it("should populate the date fields with the existing date of update if it exists", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-year"[^>]*value="2024"[^>]*>/);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-month"[^>]*value="10"[^>]*>/);
      expect(res.text).toMatch(/<input[^>]*name="date_of_update-day"[^>]*value="10"[^>]*>/);
    });
  });

  describe("POST general partner change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear().toString();

      expect(generalPartner.data?.date_of_update).toBeUndefined();

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange,
        "date_of_update-day": day,
        "date_of_update-month": month,
        "date_of_update-year": year
      });

      expect(generalPartner.data?.date_of_update).toBe(`${year}-${month}-${day}`);

      const REDIRECT_URL = getUrl(UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should display error message when date of update is before the incorporation date", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange,
        "date_of_update-day": "10",
        "date_of_update-month": "01",
        "date_of_update-year": "2022"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(enTranslationText.errorMessages.dateOfUpdate.beforeRegistrationDate.generalPartner)
      );
    });

    it("should display the specifc error message rather than the original when the date is before the incorporation date", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withDateOfUpdate("2024-10-10")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const expectedErrorMessage = toEscapedHtml(
        enTranslationText.errorMessages.dateOfUpdate.beforeRegistrationDate.generalPartner
      );
      const apiErrors: ApiErrors = {
        errors: { date_of_update: expectedErrorMessage }
      };
      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange,
        "date_of_update-day": "10",
        "date_of_update-month": "01",
        "date_of_update-year": "2000"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedErrorMessage);
      expect(res.text).toContain("10");
      expect(res.text).toContain("01");
      expect(res.text).toContain("2000");
      expect(res.text).toContain(BACK_LINK_URL);
      expect(res.text).toContain(
        `${generalPartner.data?.forename?.toUpperCase()} ${generalPartner.data?.surname?.toUpperCase()}`
      );
    });
  });
});
