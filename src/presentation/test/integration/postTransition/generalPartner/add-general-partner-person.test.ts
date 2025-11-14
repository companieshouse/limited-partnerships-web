import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL
} from "../../../../controller/postTransition/url";
import { POST_TRANSITION_WITH_ID_URL } from "../../../../../config/constants";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import {
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../presentation/controller/addressLookUp/url/postTransition";

describe("Add General Partner Person Page", () => {
  const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_URL);
  const REDIRECT = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.generalPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("Get Add General Partner Person Page", () => {
    it("should load the add general partner person page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, enTranslationText.addPartnerPersonPage, ["limitedPartner", "errorMessages"]);
      testTranslations(res.text, enTranslationText.generalPartnersPage, [
        "title",
        "pageInformation",
        "disqualificationStatement",
        "disqualificationStatementLegend"
      ]);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load the add general partner person page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );

      testTranslations(res.text, cyTranslationText.addPartnerPersonPage, ["limitedPartner", "errorMessages"]);
      testTranslations(res.text, cyTranslationText.generalPartnersPage, [
        "title",
        "pageInformation",
        "disqualificationStatement",
        "disqualificationStatementLegend"
      ]);
    });

    it("should contain a back link to the choice page when general partners are not present", async () => {
      const res = await request(app).get(getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL) + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(`${getUrl(POST_TRANSITION_WITH_ID_URL)}/${PostTransitionPageType.generalPartnerChoice}`);
      expect(res.text).toMatch(regex);
    });

    it("should contain the proposed name - data from api", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
      );
    });

    it("should load the add general partner person page and replay previously saved data", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withNotDisqualifiedStatementChecked(true)
        .withFormerNames("FORMER-NAMES")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      setLocalesEnabled(true);
      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Joe - GP");
      expect(res.text).toContain("Doe - GP");
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain('<option value="British" selected>British</option>');
      expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
    });
  });

  describe("Post Add General Partner Person", () => {
    it("should send the general partner person details", async () => {
      const generalPartner = new GeneralPartnerBuilder().isPerson().withNotDisqualifiedStatementChecked(true).build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addGeneralPartnerPerson,
          ...generalPartner.data
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe("Add a general partner (person)");

      expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
      expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(
        PartnerKind.ADD_GENERAL_PARTNER_PERSON
      );
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { first_name: "first name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addGeneralPartnerPerson,
        first_name: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("first name is invalid");
    });

    it("should send the general partner details and go to confirm ura address page if already saved", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const URL = getUrl(ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addGeneralPartnerPerson,
          ...generalPartner.data
        });

      const REDIRECT = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Found. Redirecting to ${REDIRECT}`);
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "general partner name is invalid" }
      };

      appDevDependencies.generalPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addGeneralPartnerPerson,
        forename: "INVALID-CHARACTERS-FORENAME",
        surname: "SURNAME",
        former_names: "",
        previousName: "false",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previousNameNo" name="previousName" type="radio" value="false" checked');
      expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
      expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');
      expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
    });

    it("should show error message if previous names is Yes but no previous name entered", async () => {
      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addGeneralPartnerPerson,
        forename: "forename",
        surname: "SURNAME",
        former_names: "",
        previousName: "true",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek",
        not_disqualified_statement_checked: "true"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("Enter the previous name(s) of the general partner");
    });
  });
});
