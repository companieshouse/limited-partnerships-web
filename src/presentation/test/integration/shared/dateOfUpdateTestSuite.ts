import request from "supertest";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { countOccurrences, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../utils";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import TransactionBuilder from "../../builder/TransactionBuilder";
import { PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

export interface DateOfUpdateTestConfig {
  url: string;
  pageType: string;
  redirectUrl: string;
  translateExclude: string[];
  serviceNameTranslationKey: string;
  partnershipKind: PartnershipKind;
  dateFieldType: string;
  getPartnershipDisplay: (lp: any) => string;
}

export function runDateOfUpdateTests(config: DateOfUpdateTestConfig): void {
  const {
    url,
    pageType,
    redirectUrl,
    translateExclude,
    serviceNameTranslationKey,
    partnershipKind,
    dateFieldType,
    getPartnershipDisplay
  } = config;

  describe("Date of update page", () => {
    beforeEach(() => {
      appDevDependencies.companyGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache(null);

      const companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const limitedPartnership = new LimitedPartnershipBuilder().build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const transaction = new TransactionBuilder().withKind(partnershipKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);
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

        const limitedPartnership = new LimitedPartnershipBuilder().build();
        expect(res.text).toContain(getPartnershipDisplay(limitedPartnership));
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
        expect(res.text).toContain(toEscapedHtml(cyTranslationText.errorMessages.dateOfUpdate.missing[dateFieldType]));
      });

      it.each([
        {
          description: "the date is in the future",
          day: "10",
          month: "01",
          year: "2030",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.notInPast[dateFieldType]
        },
        {
          description: "all date fields are missing",
          day: "",
          month: "",
          year: "",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.missing[dateFieldType]
        },
        {
          description: "day is missing",
          day: "",
          month: "01",
          year: "2025",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.dayMissing[dateFieldType]
        },
        {
          description: "month is missing",
          day: "10",
          month: "",
          year: "2025",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.monthMissing[dateFieldType]
        },
        {
          description: "year is missing",
          day: "10",
          month: "01",
          year: "",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.yearMissing[dateFieldType]
        },
        {
          description: "day and month are missing",
          day: "",
          month: "",
          year: "2025",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.dayAndMonthMissing[dateFieldType]
        },
        {
          description: "month and year are missing",
          day: "10",
          month: "",
          year: "",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.monthAndYearMissing[dateFieldType]
        },
        {
          description: "day and year are missing",
          day: "",
          month: "01",
          year: "",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.dayAndYearMissing[dateFieldType]
        },
        {
          description: "day field length is too long",
          day: "222",
          month: "02",
          year: "2023",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.dayInvalidLength
        },
        {
          description: "month field length is too long",
          day: "02",
          month: "123",
          year: "2023",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.monthInvalidLength
        },
        {
          description: "year field length is too long",
          day: "02",
          month: "02",
          year: "20201",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.yearInvalidLength
        },
        {
          description: "year field length is too short",
          day: "02",
          month: "02",
          year: "202",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.yearInvalidLength
        },
        {
          description: "a field is both too long and non-numeric",
          day: "aaa",
          month: "02",
          year: "2023",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.dayInvalidLength
        },
        {
          description: "day contains non-numeric characters",
          day: "a2",
          month: "02",
          year: "2023",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.invalidChars[dateFieldType]
        },
        {
          description: "month contains non-numeric characters",
          day: "02",
          month: "2a",
          year: "2023",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.invalidChars[dateFieldType]
        },
        {
          description: "year contains non-numeric characters",
          day: "02",
          month: "02",
          year: "202a",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.invalidChars[dateFieldType]
        },
        {
          description: "day is out of range",
          day: "32",
          month: "02",
          year: "2023",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.invalid[dateFieldType]
        },
        {
          description: "month is out of range",
          day: "02",
          month: "13",
          year: "2023",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.invalid[dateFieldType]
        },
        {
          description: "date is before the partnership incorporation date",
          day: "10",
          month: "01",
          year: "2000",
          getExpectedError: enTranslationText.errorMessages.dateOfUpdate.beforeRegistrationDate[dateFieldType]
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
