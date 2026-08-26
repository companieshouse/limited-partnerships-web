import request from "supertest";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionLimitedPartnership from "../../../../../domain/entities/TransactionLimitedPartnership";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import { getServiceTitle, isPostTransition } from "../utils";

import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";

import { SERVICE_NAME_KEY_REGISTRATION, SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";

type AddLimitedPartnerPersonTestConfig = {
  url: string;
  urlWithIds: string;
  pageType: {
    addLimitedPartnerPerson: string;
    reviewLimitedPartners: string;
    limitedPartnerType: string;
  };
  pageRouting: any;
  redirectUrl: string;
  confirmRedirectUrl: string;
  baseUrlWithIds: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string |{ serviceName: string };
  partnerKind?: string;
};

export const runAddLimitedPartnerPersonTests = (config: AddLimitedPartnerPersonTestConfig) => {
  describe("Add Limited Partner Person Page", () => {
    let limitedPartnership: TransactionLimitedPartnership;
    let companyProfile: {
      _id: string;
      data: Partial<CompanyProfile>;
    };

    const limitedPartner = new LimitedPartnerBuilder()
      .isPerson()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .withAppointmentId(appDevDependencies.limitedPartnerGateway.limitedPartnerAppointmentId)
      .withKind(config.partnerKind ?? "")
      .build();

    // const datesBody = isPostTransition(config.serviceTitleTranslationKey) ? { "date_effective_from-day": "01", "date_effective_from-month": "11", "date_effective_from-year": "2024" } : {};

    const validPageData = {
      ...config.pageRouting.get(config.pageType.addLimitedPartnerPerson),
      partnershipType: PartnershipType.LP,
      forename: "test",
      previous_name: "false",
      former_names: "",
      surname: "surname",
      "date_of_birth-day": "01",
      "date_of_birth-month": "11",
      "date_of_birth-year": "1987",
      nationality1: "Mongolian",
      nationality2: "Uzbek",
      contribution_currency_type: "Pound Sterling (GBP)",
      contribution_currency_value: "100.00",
      contribution_sub_types: ["MONEY"]
    };

    beforeEach(() => {
      setLocalesEnabled(true);

      limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.LP).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      appDevDependencies.transactionGateway.feedTransactions([]);
    });

    describe("Get Add Limited Partner Page", () => {
      it.each([
        ["for type LP - english", PartnershipType.LP, true, "en", enTranslationText],
        ["for type LP - welsh", PartnershipType.LP, true, "cy", cyTranslationText],
        ["for type SLP - english", PartnershipType.SLP, true, "en", enTranslationText],
        ["for type SLP - welsh", PartnershipType.SLP, true, "cy", cyTranslationText],
        ["for type PFLP - english", PartnershipType.PFLP, false, "en", enTranslationText],
        ["for type PFLP - welsh", PartnershipType.PFLP, false, "cy", cyTranslationText],
        ["for type SPFLP - english", PartnershipType.SPFLP, false, "en", enTranslationText],
        ["for type SPFLP - welsh", PartnershipType.SPFLP, false, "cy", cyTranslationText]
      ])(
        "should load the add limited partner page with Welsh text for %s",
        async (_description: string, partnershipType: PartnershipType, isCapitalContributionPresent: boolean, lang: string, translationText: Record<string, any>) => {
          const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();

          appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

          setLocalesEnabled(true);
          const res = await request(app).get(`${getUrl(config.url)}?lang=${lang}`);

          expect(res.status).toBe(200);

          expect(res.text).toContain(
            `${translationText.partner.addPartnerPersonPage.limitedPartner.title} - ${getServiceTitle(config.serviceTitleTranslationKey, translationText)} - GOV.UK`
          );

          let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
          if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
            partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
          } else if (isPostTransition(config.serviceTitleTranslationKey)) {
            partnershipName = `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`;
          }

          expect(res.text).toContain(partnershipName);

          testTranslations(res.text, translationText.partner.addPartnerPersonPage, config.translateExclude);

          if (!isCapitalContributionPresent) {
            expect(res.text).not.toContain(translationText.partner.capitalContribution.title);
          }

          if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
            const key =
                        config.serviceTitleTranslationKey === SERVICE_NAME_KEY_REGISTRATION ? "registration" : "addGeneralPartner";
            expect(res.text).toContain(customerFeedbackUrlMap[key]);
          }
        }
      );

      it("should retrieve limited partner data from the api", async () => {
        const res = await request(app).get(getUrl(config.urlWithIds));

        expect(res.status).toBe(200);

        expect(res.text).toContain(limitedPartner?.data?.forename);
        expect(res.text).toContain(limitedPartner?.data?.surname);
      });

      it("should contain a back link to the review page when limited partners are present", async () => {
        const res = await request(app).get(getUrl(config.urlWithIds));

        expect(res.status).toBe(200);

        const regex = new RegExp(
          `${getUrl(config.baseUrlWithIds)}/${config.pageType.reviewLimitedPartners}`
        );
        expect(res.text).toMatch(regex);
      });

      it("should contain a back link to the choice page when limited partners are not present", async () => {
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

        const res = await request(app).get(getUrl(config.url));

        expect(res.status).toBe(200);

        const regex = new RegExp(
          `${getUrl(config.baseUrlWithIds)}/${config.pageType.limitedPartnerType}`
        );
        expect(res.text).toMatch(regex);
      });
    });

    describe("Post Add Limited Partner", () => {
      it.each([
        ["true", "john"],
        ["false", ""]
      ])("should send the Limited partner details", async (previousName, formerNames) => {
        const res = await request(app).post(getUrl(config.url)).send({
          ...validPageData,
          previous_name: previousName,
          former_names: formerNames,
        });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);
      });

      it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
        const res = await request(app).post(getUrl(config.url)).send({
          ...validPageData,
          forename: "!@£$%^&*()_+",
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain(toEscapedHtml("!@£$%^&*()_+"));
        expect(res.text).toContain("surname");
        expect(res.text).toContain('id="previous_name-2" name="previous_name" type="radio" value="false" checked');
        expect(res.text).toContain("Mongolian");
        expect(res.text).toContain("Uzbek");
        expect(res.text).toContain("01");
        expect(res.text).toContain("11");
        expect(res.text).toContain("1987");

        if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
          expect(res.text).toContain("100.00");
          expect(res.text).toContain("Pound Sterling (GBP)");
          expect(res.text).toContain('"MONEY" checked');
        }

        expect(res.text).toContain(enTranslationText.errorMessages.partners.addPartner.firstNameInvalid);

      });

      if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
        it("should show localised capital contribution errors when the section is left blank for an LP", async () => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=cy`)
            .send({
              ...validPageData,
              contribution_currency_type: null,
              contribution_currency_value: null,
              contribution_sub_types: []
            });

          expect(res.status).toBe(200);

          expect(res.text).toContain(cyTranslationText.errorMessages.capitalContribution.currencyRequired);
          expect(res.text).toContain(cyTranslationText.errorMessages.capitalContribution.valueRequired);
          expect(res.text).toContain(cyTranslationText.errorMessages.capitalContribution.atLeastOneType);
        });
      }

      it("should not require capital contribution when the section is not shown (PFLP)", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.PFLP).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).post(getUrl(config.url)).send({
          ...validPageData,
          partnershipType: PartnershipType.PFLP,
          contribution_currency_type: null,
          contribution_currency_value: null,
          contribution_sub_types: []
        });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);
      });

      it.each(["", "   ", undefined])(
        "should show error message if previous names is Yes but no previous name entered",
        async (formerNames: string | undefined) => {
          const res = await request(app).post(getUrl(config.url)).send({
            ...validPageData,
            former_names: formerNames,
            previous_name: "true",
          });

          expect(res.status).toBe(200);

          expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
          expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.partners.addPartner.formerNamesMissing));
        }
      );
    });

    describe("Patch from Add Limited Partner", () => {
      it("should send the limited partner details", async () => {
        const res = await request(app).post(getUrl(config.urlWithIds)).send({
          ...validPageData
        });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);
      });

      it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
        const res = await request(app).post(getUrl(config.urlWithIds)).send({
          ...validPageData,
          forename: "!@£$%^&*()_+",
          surname: "SURNAME",
          former_names: "FORMER-NAMES",
          previous_name: "true",
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain(toEscapedHtml("!@£$%^&*()_+"));
        expect(res.text).toContain("SURNAME");
        expect(res.text).toContain('id="previous_name" name="previous_name" type="radio" value="true" checked');
        expect(res.text).toContain("FORMER-NAMES");
        expect(res.text).toContain("Mongolian");
        expect(res.text).toContain("Uzbek");

        expect(res.text).toContain(enTranslationText.errorMessages.partners.addPartner.firstNameInvalid);
      });
    });

    describe("Validation", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation errors when no data is submitted (%s)",
        async (_language, lang, errorsText) => {
          setLocalesEnabled(true);

          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...config.pageRouting.get(config.pageType.addLimitedPartnerPerson),
              partnershipType: PartnershipType.LP,
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(toEscapedHtml(errorsText.errorMessages.partners.addPartner.firstNameMissing));
          expect(res.text).toContain(toEscapedHtml(errorsText.errorMessages.partners.addPartner.lastNameMissing));
          expect(res.text).toContain(errorsText.errorMessages.partners.addPartner.previousNameNotSelected);
          expect(res.text).toContain(toEscapedHtml(errorsText.errorMessages.partners.addPartner.dateOfBirthMissing));
          expect(res.text).toContain(toEscapedHtml(errorsText.errorMessages.partners.addPartner.nationality1Missing));

          if (config.serviceTitleTranslationKey !== SERVICE_NAME_KEY_TRANSITION) {
            expect(res.text).toContain(errorsText.errorMessages.capitalContribution.currencyRequired);
            expect(res.text).toContain(errorsText.errorMessages.capitalContribution.valueRequired);
            expect(res.text).toContain(errorsText.errorMessages.capitalContribution.atLeastOneType);
          }

          expect(res.text).not.toContain(errorsText.errorMessages.partners.addPartner.disqualificationStatementMissingGeneralPartner);
        }
      );

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation error if first name is too long (%s)",
        async (_language, lang, errorsText) => {
          setLocalesEnabled(true);

          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...validPageData,
              forename: "A".repeat(256)
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(errorsText.errorMessages.partners.addPartner.firstNameTooLong);
        }
      );

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation error if last name has invalid characters (%s)",
        async (_language, lang, errorsText) => {
          setLocalesEnabled(true);

          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...validPageData,
              surname: "!@£$%^&*()_+"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(errorsText.errorMessages.partners.addPartner.lastNameInvalid);
        }
      );

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation error if last name is too long (%s)",
        async (_language, lang, errorsText) => {
          setLocalesEnabled(true);

          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...validPageData,
              surname: "A".repeat(256)
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(errorsText.errorMessages.partners.addPartner.lastNameTooLong);
        }
      );

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation error if former names missing (%s)",
        async (_language, lang, errorsText) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...validPageData,
              previous_name: "true"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(toEscapedHtml(errorsText.errorMessages.partners.addPartner.formerNamesMissing));
        }
      );

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation error if former names has invalid characters (%s)",
        async (_language, lang, errorsText) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...validPageData,
              previous_name: "true",
              former_names: "!@£$%^&*()_+"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(errorsText.errorMessages.partners.addPartner.formerNamesInvalid);
        }
      );

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation error if former names is too long (%s)",
        async (_language, lang, errorsText) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...validPageData,
              previous_name: "true",
              former_names: "A".repeat(256)
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(errorsText.errorMessages.partners.addPartner.formerNamesTooLong);
        }
      );

      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should return validation error if nationality2 is same as nationality1 (%s)",
        async (_language, lang, errorsText) => {
          const res = await request(app)
            .post(`${getUrl(config.url)}?lang=${lang}`)
            .send({
              ...validPageData,
              nationality1: "British",
              nationality2: "British"
            });

          expect(res.status).toBe(200);
          expect(res.text).toContain(errorsText.errorMessages.partners.addPartner.nationality2Same);
        }
      );
    });
  });
};
