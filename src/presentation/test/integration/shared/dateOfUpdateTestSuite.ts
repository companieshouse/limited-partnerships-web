import request from "supertest";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { countOccurrences, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../utils";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import TransactionBuilder from "../../builder/TransactionBuilder";
import {
  GeneralPartner,
  LimitedPartner,
  LimitedPartnership,
  PartnerKind,
  PartnershipKind
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";
import { customerFeedbackUrlMap } from "../../../../middlewares/customer-feedback.middleware";

type DateOfUpdateEntity = LimitedPartnership | GeneralPartner | LimitedPartner;

export interface DateOfUpdateTestConfig {
  url: string;
  backLinkUrl: string;
  pageType: string;
  redirectUrl: string;
  translateExclude: string[];
  serviceNameTranslationKey: string;
  kind: PartnershipKind | PartnerKind;
  changeTypeKey: string;
  getDisplayedName: (entity: DateOfUpdateEntity) => string;
  // feeds any entity-specific gateways (e.g. a general/limited partner) and returns the entity under test
  additionalSetup?: () => DateOfUpdateEntity;
}

export function runDateOfUpdateTests(config: DateOfUpdateTestConfig): void {
  const {
    url,
    backLinkUrl,
    pageType,
    redirectUrl,
    translateExclude,
    serviceNameTranslationKey,
    kind,
    changeTypeKey,
    getDisplayedName,
    additionalSetup
  } = config;

  const dateFieldType = enTranslationText.errorMessages.dateOfUpdate.changeType[changeTypeKey];
  const dateFieldTypeCy = cyTranslationText.errorMessages.dateOfUpdate.changeType[changeTypeKey];

  let entity: DateOfUpdateEntity;
  let existingDateOfUpdate: { day: string; month: string; year: string };

  describe("Date of update page", () => {
    beforeEach(() => {
      appDevDependencies.companyGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache(null);

      const companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const transaction = new TransactionBuilder().withKind(kind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      entity = additionalSetup ? additionalSetup() : limitedPartnership;

      const [year, month, day] = entity.data?.date_of_update?.split("-") as string[];
      existingDateOfUpdate = { day, month, year };
    });

    describe("GET date of update page", () => {
      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should load date of update page with %s text", async (lang, translationText) => {
        setLocalesEnabled(true);
        const res = await request(app).get(url + `?lang=${lang}`);

        expect(res.status).toBe(200);
        testTranslations(res.text, translationText.dateOfUpdate, translateExclude);
        if (lang === "cy") {
          expect(res.text).toContain("WELSH -");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }
        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName[serviceNameTranslationKey]))).toBe(2);

        expect(res.text).toContain(getDisplayedName(entity));
        expect(res.text).toContain(customerFeedbackUrlMap[serviceNameTranslationKey]);
        expect(res.text).toContain(backLinkUrl);
      });

      it("should populate the date fields with the existing date of update if it exists", async () => {
        const res = await request(app).get(url);

        expect(res.status).toBe(200);
        expect(res.text).toMatch(new RegExp(`<input[^>]*name="date_of_update-year"[^>]*value="${existingDateOfUpdate.year}"[^>]*>`));
        expect(res.text).toMatch(new RegExp(`<input[^>]*name="date_of_update-month"[^>]*value="${existingDateOfUpdate.month}"[^>]*>`));
        expect(res.text).toMatch(new RegExp(`<input[^>]*name="date_of_update-day"[^>]*value="${existingDateOfUpdate.day}"[^>]*>`));
      });
    });

    describe("POST date of update page", () => {
      it("should navigate to next page with date of update", async () => {

        const res = await request(app).post(url).send({
          pageType,
          "date_of_update-day": "10",
          "date_of_update-month": "01",
          "date_of_update-year": "2024"
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });

      it("should not display error message when date is the same as the partnership incorporation date", async () => {
        const res = await request(app).post(url).send({
          pageType,
          "date_of_update-day": "29",
          "date_of_update-month": "12",
          "date_of_update-year": "2023"
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });

      it("should not display error message when date is today", async () => {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, "0");
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const year = today.getFullYear().toString();

        const res = await request(app).post(url).send({
          pageType,
          "date_of_update-day": day,
          "date_of_update-month": month,
          "date_of_update-year": year
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });

      it("should display error messages in welsh when the language is set to Welsh", async () => {
        setLocalesEnabled(true);
        const res = await request(app)
          .post(url + "?lang=cy")
          .send({
            pageType,
            "date_of_update-day": "",
            "date_of_update-month": "",
            "date_of_update-year": ""
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          toEscapedHtml(getExpectedErrorMessage(cyTranslationText.errorMessages.dateOfUpdate.missing, dateFieldTypeCy))
        );
      });

      it.each([
        {
          description: "the date is in the future",
          day: "10",
          month: "01",
          year: "2030",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.notInPast, dateFieldType)
        },
        {
          description: "all date fields are missing",
          day: "",
          month: "",
          year: "",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.missing, dateFieldType)
        },
        {
          description: "day is missing",
          day: "",
          month: "01",
          year: "2025",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.dayMissing, dateFieldType)
        },
        {
          description: "month is missing",
          day: "10",
          month: "",
          year: "2025",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.monthMissing, dateFieldType)
        },
        {
          description: "year is missing",
          day: "10",
          month: "01",
          year: "",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.yearMissing, dateFieldType)
        },
        {
          description: "day and month are missing",
          day: "",
          month: "",
          year: "2025",
          getExpectedError: getExpectedErrorMessage(
            enTranslationText.errorMessages.dateOfUpdate.dayAndMonthMissing,
            dateFieldType
          )
        },
        {
          description: "month and year are missing",
          day: "10",
          month: "",
          year: "",
          getExpectedError: getExpectedErrorMessage(
            enTranslationText.errorMessages.dateOfUpdate.monthAndYearMissing,
            dateFieldType
          )
        },
        {
          description: "day and year are missing",
          day: "",
          month: "01",
          year: "",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.dayAndYearMissing, dateFieldType)
        },
        {
          description: "day field length is too long",
          day: "222",
          month: "02",
          year: "2023",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.dayInvalidLength, dateFieldType)
        },
        {
          description: "month field length is too long",
          day: "02",
          month: "123",
          year: "2023",
          getExpectedError: getExpectedErrorMessage(
            enTranslationText.errorMessages.dateOfUpdate.monthInvalidLength,
            dateFieldType
          )
        },
        {
          description: "year field length is too long",
          day: "02",
          month: "02",
          year: "20201",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.yearInvalidLength, dateFieldType)
        },
        {
          description: "year field length is too short",
          day: "02",
          month: "02",
          year: "202",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.yearInvalidLength, dateFieldType)
        },
        {
          description: "a field is both too long and non-numeric",
          day: "aaa",
          month: "02",
          year: "2023",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.dayInvalidLength, dateFieldType)
        },
        {
          description: "day contains non-numeric characters",
          day: "a2",
          month: "02",
          year: "2023",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.invalidChars, dateFieldType)
        },
        {
          description: "month contains non-numeric characters",
          day: "02",
          month: "2a",
          year: "2023",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.invalidChars, dateFieldType)
        },
        {
          description: "year contains non-numeric characters",
          day: "02",
          month: "02",
          year: "202a",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.invalidChars, dateFieldType)
        },
        {
          description: "day is out of range",
          day: "32",
          month: "02",
          year: "2023",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.invalid, dateFieldType)
        },
        {
          description: "month is out of range",
          day: "02",
          month: "13",
          year: "2023",
          getExpectedError: getExpectedErrorMessage(enTranslationText.errorMessages.dateOfUpdate.invalid, dateFieldType)
        },
        {
          description: "date is before the partnership incorporation date",
          day: "10",
          month: "01",
          year: "2000",
          getExpectedError: getExpectedErrorMessage(
            enTranslationText.errorMessages.dateOfUpdate.beforeRegistrationDate,
            dateFieldType
          )
        }
      ])("should display error message when $description", async ({ day, month, year, getExpectedError }) => {
        const res = await request(app).post(url).send({
          pageType,
          "date_of_update-day": day,
          "date_of_update-month": month,
          "date_of_update-year": year
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(toEscapedHtml(getExpectedError));
      });
    });
  });
}

const getExpectedErrorMessage = (errorText: string, dateFieldType: string): string => {
  return errorText.replace("{change-type}", dateFieldType);
};
