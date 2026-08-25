import request from "supertest";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";

import { getServiceTitle, isPostTransition } from "./utils";
import { SERVICE_NAME_KEY_REGISTRATION, SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";
import { PagesRouting } from "../../../../controller/PageRouting";
import PageType from "../../../../controller/PageType";

type AddGeneralPartnerPersonTestConfig = {
  url: string;
  urlWithIds: string;
  pageType: {
    addGeneralPartnerPerson: string;
    reviewGeneralPartners: string;
    generalPartnerType: string;
  };
  pageRouting: PagesRouting;
  redirectUrl: string;
  confirmRedirectUrl: string;
  baseUrlWithIds: string;
  translateExcludeAddOrUpdatePartnerPersonPage: string[];
  translateExcludeGeneralPartnersPage: string[];
  serviceTitleTranslationKey: string | { serviceName: string };
  partnerKind?: string;
};

export const runAddGeneralPartnerPersonTests = (config: AddGeneralPartnerPersonTestConfig): void => {

  let limitedPartnership: TransactionLimitedPartnership;
  let companyProfile: {
      _id: string;
      data: Partial<CompanyProfile>;
    };

  describe("Add General Partner Person Page", () => {
    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);

      appDevDependencies.transactionGateway.feedTransactions([]);
    });

    describe("Get Add General Partner Page", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should load the add general partner page with %s text",
        async (_description: string, lang: string, translationText: Record<string, any>) => {
          const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${translationText.partner.addPartnerPersonPage.generalPartner.title} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
          );

          let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
          if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
            partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
          } else if (isPostTransition(config.serviceTitleTranslationKey)) {
            partnershipName = `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`;
          }

          expect(res.text).toContain(partnershipName);

          testTranslations(
            res.text,
            translationText.partner.addPartnerPersonPage,
            config.translateExcludeAddOrUpdatePartnerPersonPage
          );
          testTranslations(res.text, translationText.partner.generalPartnersPage, config.translateExcludeGeneralPartnersPage);

          if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
            const key =
              config.serviceTitleTranslationKey === SERVICE_NAME_KEY_REGISTRATION ? "registration" : "addGeneralPartner";
            expect(res.text).toContain(customerFeedbackUrlMap[key]);
          }
        }
      );

      it("should contain a back link to the choice page when general partners are not present", async () => {
        const res = await request(app).get(getUrl(config.url));

        expect(res.status).toBe(200);
        const regex = new RegExp(getUrl(`${getUrl(config.baseUrlWithIds)}/${config.pageType.generalPartnerType}`));
        expect(res.text).toMatch(regex);
      });

      it("should contain a back link to the review page when general partners are present", async () => {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isPerson()
          .withNotDisqualifiedStatementChecked(true)
          .withFormerNames("FORMER-NAMES")
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const res = await request(app).get(getUrl(config.urlWithIds));

        expect(res.status).toBe(200);
        expect(res.text).toContain("Joe - GP");
        expect(res.text).toContain("Doe - GP");
        expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
        expect(res.text).toContain("FORMER-NAMES");
        expect(res.text).toContain('<option value="British" selected>British</option>');

        if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
          expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
        }

        const regex = new RegExp(getUrl(`${getUrl(config.baseUrlWithIds)}/${config.pageType.reviewGeneralPartners}`));
        expect(res.text).toMatch(regex);
      });
    });

    describe("Post Add General Partner", () => {
      it.each(["true", "false"])("should send the general partner details", async (previousName: string) => {
        const generalPartner = new GeneralPartnerBuilder().isPerson().withNotDisqualifiedStatementChecked(true).build();

        if (previousName === "true") {
          if (generalPartner.data) {
            generalPartner.data.former_names = "john";
          }
        }

        const res = await request(app)
          .post(getUrl(config.url))
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
            previous_name: previousName,
            ...generalPartner.data,
            "date_of_birth-day": "01",
            "date_of_birth-month": "11",
            "date_of_birth-year": "1987",
            "date_effective_from-day": "01",
            "date_effective_from-month": "11",
            "date_effective_from-year": "2024"
          });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);

        if (isPostTransition(config.serviceTitleTranslationKey)) {
          expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
          expect(appDevDependencies.transactionGateway.transactions[0].description).toBe("Add a general partner (person)");

          expect(appDevDependencies.generalPartnerGateway.generalPartners).toHaveLength(1);
          expect(appDevDependencies.generalPartnerGateway.generalPartners[0].data?.kind).toEqual(config.partnerKind);
        }
      });

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should return validation errors when all data is missing - %s", async (lang: string, errorMessages: any) => {
        const res = await request(app)
          .post(`${getUrl(config.url)}?lang=${lang}`)
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType)
          });

        expect(res.status).toBe(200);

        expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.firstNameMissing));
        expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.lastNameMissing));
        expect(res.text).toContain(errorMessages.errorMessages.partners.addPartner.previousNameNotSelected);
        expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.dateOfBirthMissing));
        expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.nationality1Missing));

        if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
          expect(res.text).toContain(
            errorMessages.errorMessages.partners.addPartner.disqualificationStatementMissingGeneralPartner
          );
        }
      });

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should return validation errors when former names is missing - %s", async (lang: string, errorMessages: any) => {
        const res = await request(app)
          .post(`${getUrl(config.url)}?lang=${lang}`)
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
            previous_name: "true"
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.formerNamesMissing));
      });

      it.each([
        ["en", "§", enTranslationText.errorMessages.partners.addPartner.firstNameInvalid],
        ["en", "a".repeat(51), enTranslationText.errorMessages.partners.addPartner.firstNameTooLong],
        ["cy", "§", cyTranslationText.errorMessages.partners.addPartner.firstNameInvalid],
        ["cy", "a".repeat(51), cyTranslationText.errorMessages.partners.addPartner.firstNameTooLong]
      ])(
        "should return validation errors for forename errors - %s",
        async (lang: string, forename: string, errorMessage: string) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
              forename: forename
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(errorMessage);
        }
      );

      it.each([
        ["en", "§", enTranslationText.errorMessages.partners.addPartner.lastNameInvalid],
        ["en", "a".repeat(161), enTranslationText.errorMessages.partners.addPartner.lastNameTooLong],
        ["cy", "§", cyTranslationText.errorMessages.partners.addPartner.lastNameInvalid],
        ["cy", "a".repeat(161), cyTranslationText.errorMessages.partners.addPartner.lastNameTooLong]
      ])(
        "should return validation errors for surname errors - %s",
        async (lang: string, surname: string, errorMessage: string) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
              surname: surname
            });

          expect(res.status).toBe(200);

          expect(res.text).toContain(errorMessage);
        }
      );

      it.each([
        [enTranslationText.errorMessages.partners.addPartner.formerNamesInvalid, "en", "§"],
        [cyTranslationText.errorMessages.partners.addPartner.formerNamesInvalid, "cy", "§"],
        [enTranslationText.errorMessages.partners.addPartner.formerNamesTooLong, "en", "a".repeat(161)],
        [cyTranslationText.errorMessages.partners.addPartner.formerNamesTooLong, "cy", "a".repeat(161)],
        [enTranslationText.errorMessages.partners.addPartner.formerNamesMissing, "en", ""],
        [enTranslationText.errorMessages.partners.addPartner.formerNamesMissing, "en", "   "],
        [cyTranslationText.errorMessages.partners.addPartner.formerNamesMissing, "cy", undefined]
      ])(
        "should return validation errors for former names errors - %s",
        async (errorMessage: string, lang: string, formerNames: string | undefined) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
              former_names: formerNames,
              previous_name: "true"
            });

          expect(res.status).toBe(200);

          expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');

          expect(res.text).toContain(toEscapedHtml(errorMessage));
        }
      );

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])(
        "should return a validation error when nationality 1 and 2 are the same - %s",
        async (lang: string, errorMessages: any) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
              nationality1: "English",
              nationality2: "English"
            });

          expect(res.status).toBe(200);

          expect(res.text).toContain(toEscapedHtml(errorMessages.errorMessages.partners.addPartner.nationality2Same));
        }
      );

      it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
        const res = await request(app)
          .post(getUrl(config.url))
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
            forename: "§§",
            surname: "SURNAME",
            former_names: "",
            previous_name: "false",
            "date_of_birth-day": "01",
            "date_of_birth-month": "11",
            "date_of_birth-year": "1987",
            nationality1: "Mongolian",
            nationality2: "Uzbek",
            not_disqualified_statement_checked: "true"
          });

        expect(res.status).toBe(200);

        expect(res.text).toContain("§§");
        expect(res.text).toContain("SURNAME");
        expect(res.text).toContain('id="previous_name-2" name="previous_name" type="radio" value="false" checked');
        expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
        expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');

        if (config.serviceTitleTranslationKey === "transition") {
          expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
        }
      });

      it("should send the general partner details and go to confirm ura address page if already saved", async () => {
        const generalPartner = new GeneralPartnerBuilder()
          .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
          .isPerson()
          .build();

        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

        const URL = getUrl(config.urlWithIds);

        const res = await request(app)
          .post(URL)
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
            ...generalPartner.data,
            "date_of_birth-day": "01",
            "date_of_birth-month": "11",
            "date_of_birth-year": "1987",
            "date_effective_from-day": "01",
            "date_effective_from-month": "11",
            "date_effective_from-year": "2024",
            not_disqualified_statement_checked: "true",
            previous_name: "false"
          });

        const REDIRECT = getUrl(config.confirmRedirectUrl);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Found. Redirecting to ${REDIRECT}`);
      });

      it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
        const res = await request(app)
          .post(getUrl(config.url))
          .send({
            ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
            forename: "***!!!@@@£££%%%^^^***((()))___+++[]{}|;:',.<>?/~`",
            surname: "SURNAME",
            former_names: "",
            previous_name: "false",
            "date_of_birth-day": "01",
            "date_of_birth-month": "11",
            "date_of_birth-year": "1987",
            nationality1: "Mongolian",
            nationality2: "Uzbek",
            not_disqualified_statement_checked: "true"
          });

        expect(res.status).toBe(200);

        expect(res.text).toContain(toEscapedHtml("***!!!@@@£££%%%^^^***((()))___+++[]{}|;:',.<>?/~`"));
        expect(res.text).toContain("SURNAME");
        expect(res.text).toContain('id="previous_name-2" name="previous_name" type="radio" value="false" checked');
        expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
        expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');

        if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
          expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
        }
      });

      it.each(["", "   ", undefined])(
        "should show error message if previous names is Yes but no previous name entered",
        async (formerNames: string | undefined) => {
          const res = await request(app)
            .post(getUrl(config.url))
            .send({
              ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
              forename: "forename",
              surname: "SURNAME",
              former_names: formerNames,
              previous_name: "true",
              "date_of_birth-day": "01",
              "date_of_birth-month": "11",
              "date_of_birth-year": "1987",
              nationality1: "Mongolian",
              nationality2: "Uzbek",
              not_disqualified_statement_checked: "true"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
          expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.partners.addPartner.formerNamesMissing));
        }
      );
    });
  });

  describe("Patch from Add General Partner", () => {
    it("should send the general partner details", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app)
        .post(getUrl(config.urlWithIds))
        .send({
          ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
          forename: "test",
          surname: "test",
          previous_name: "true",
          former_names: "bob",
          "date_of_birth-day": "01",
          "date_of_birth-month": "11",
          "date_of_birth-year": "1987",
          nationality1: "Mongolian",
          nationality2: "Uzbek",
          not_disqualified_statement_checked: "true",
          "date_effective_from-day": "01",
          "date_effective_from-month": "11",
          "date_effective_from-year": "2024"
        });

      expect(res.status).toBe(302);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const res = await request(app)
        .post(getUrl(config.urlWithIds))
        .send({
          ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
          forename: "§§"
        });

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.errorMessages.partners.addPartner.firstNameInvalid);
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const res = await request(app)
        .post(getUrl(config.url))
        .send({
          ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
          forename: "***!!!@@@£££%%%^^^***((()))___+++[]{}|;:',.<>?/~`",
          surname: "SURNAME",
          former_names: "FORMER-NAMES",
          previous_name: "true",
          "date_of_birth-day": "01",
          "date_of_birth-month": "11",
          "date_of_birth-year": "1987",
          nationality1: "Mongolian",
          nationality2: "Uzbek",
          not_disqualified_statement_checked: "true"
        });

      expect(res.status).toBe(200);

      expect(res.text).toContain(toEscapedHtml("***!!!@@@£££%%%^^^***((()))___+++[]{}|;:',.<>?/~`"));
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
      expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');

      if (config.serviceTitleTranslationKey === "transition") {
        expect(res.text).toContain('name="not_disqualified_statement_checked" type="checkbox" value="true" checked');
      }
    });
  });
};
