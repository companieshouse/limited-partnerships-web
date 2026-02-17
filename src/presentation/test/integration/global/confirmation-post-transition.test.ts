import request from "supertest";

import app from "../app";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import { CONFIRMATION_POST_TRANSITION_URL } from "../../../controller/global/url";
import { getUrl, toEscapedHtml, setLocalesEnabled, testTranslations, countOccurrences } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { JOURNEY_TYPE_PARAM } from "../../../../config";
import { Journey } from "../../../../domain/entities/journey";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import {
  GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
  LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL
} from "../../../controller/postTransition/url";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import TransactionBuilder from "../../../../presentation/test/builder/TransactionBuilder";
import LimitedPartnershipBuilder from "../../../../presentation/test/builder/LimitedPartnershipBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Confirmation Page", () => {
  const URL = getUrl(CONFIRMATION_POST_TRANSITION_URL).replace(JOURNEY_TYPE_PARAM, Journey.postTransition);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(true);

    companyProfile = new CompanyProfileBuilder().build();
    const transaction = new TransactionBuilder().build();

    appDevDependencies.transactionGateway.feedTransactions([transaction]);
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
  });

  describe("GET /confirmation", () => {
    describe("General Partner", () => {
      describe("Person", () => {
        it.each([
          [
            enTranslationText.serviceName.addGeneralPartner,
            PartnerKind.ADD_GENERAL_PARTNER_PERSON,
            enTranslationText.confirmationPage.postTransition.partner.addPartner,
            "en"
          ],
          [
            cyTranslationText.serviceName.addGeneralPartner,
            PartnerKind.ADD_GENERAL_PARTNER_PERSON,
            cyTranslationText.confirmationPage.postTransition.partner.addPartner,
            "cy"
          ],
          [
            enTranslationText.serviceName.removeGeneralPartnerPerson,
            PartnerKind.REMOVE_GENERAL_PARTNER_PERSON,
            enTranslationText.confirmationPage.postTransition.partner.removePartner,
            "en"
          ],
          [
            cyTranslationText.serviceName.removeGeneralPartnerPerson,
            PartnerKind.REMOVE_GENERAL_PARTNER_PERSON,
            cyTranslationText.confirmationPage.postTransition.partner.removePartner,
            "cy"
          ],
          [
            enTranslationText.serviceName.updateGeneralPartnerPerson,
            PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
            enTranslationText.confirmationPage.postTransition.partner.updatePartner,
            "en"
          ],
          [
            cyTranslationText.serviceName.updateGeneralPartnerPerson,
            PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
            cyTranslationText.confirmationPage.postTransition.partner.updatePartner,
            "cy"
          ]
        ])(
          "should load confirmation page - general partner (person) - %s",
          async (serviceName, partnerKind, partnerText, lang) => {
            const translation = lang === "en" ? enTranslationText.confirmationPage : cyTranslationText.confirmationPage;

            const generalPartner = new GeneralPartnerBuilder()
              .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
              .isPerson()
              .build();
            appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

            const transaction = new TransactionBuilder().withKind(partnerKind).build();
            appDevDependencies.transactionGateway.feedTransactions([transaction]);

            const res = await request(app)
              .get(`${URL}?lang=${lang}`)
              .set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

            expect(res.status).toBe(200);

            expect(res.text).toContain("test@email.com");
            expect(res.text).toContain("Joe - GP");
            expect(res.text).toContain("Doe - GP");

            expect(res.text).toContain(translation.postTransition.title);
            expect(res.text).not.toContain(translation.title);

            expect(res.text).toContain(toEscapedHtml(partnerText));

            let excludedTranslations = ["limitedPartnerType", "updateGeneralPartnerType"];

            if (partnerKind === PartnerKind.ADD_GENERAL_PARTNER_PERSON) {
              excludedTranslations = [...excludedTranslations, "removePartner", "updatePartner"];
            } else if (partnerKind === PartnerKind.REMOVE_GENERAL_PARTNER_PERSON) {
              excludedTranslations = [...excludedTranslations, "addPartner", "updatePartner"];
            } else if (partnerKind === PartnerKind.UPDATE_GENERAL_PARTNER_PERSON) {
              excludedTranslations = [...excludedTranslations, "addPartner", "removePartner", "generalPartnerType"];
            }

            testTranslations(res.text, translation.postTransition.partner, excludedTranslations);

            expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);

            expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
            expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());

            expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
          }
        );
      });

      describe("Legal Entity", () => {
        it.each([
          [
            enTranslationText.serviceName.addGeneralPartner,
            PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY,
            enTranslationText.confirmationPage.postTransition.partner.addPartner,
            "en"
          ],
          [
            cyTranslationText.serviceName.addGeneralPartner,
            PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY,
            cyTranslationText.confirmationPage.postTransition.partner.addPartner,
            "cy"
          ],
          [
            enTranslationText.serviceName.removeGeneralPartnerEntity,
            PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY,
            enTranslationText.confirmationPage.postTransition.partner.removePartner,
            "en"
          ],
          [
            cyTranslationText.serviceName.removeGeneralPartnerEntity,
            PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY,
            cyTranslationText.confirmationPage.postTransition.partner.removePartner,
            "cy"
          ],
          [
            enTranslationText.serviceName.updateGeneralPartnerLegalEntity,
            PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY,
            enTranslationText.confirmationPage.postTransition.partner.updatePartner,
            "en"
          ],
          [
            cyTranslationText.serviceName.updateGeneralPartnerLegalEntity,
            PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY,
            cyTranslationText.confirmationPage.postTransition.partner.updatePartner,
            "cy"
          ]
        ])(
          "should load confirmation page - general partner (legal entity) - %s",
          async (serviceName, partnerKind, partnerText, lang) => {
            const translation = lang === "en" ? enTranslationText.confirmationPage : cyTranslationText.confirmationPage;

            const generalPartner = new GeneralPartnerBuilder()
              .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
              .isLegalEntity()
              .build();
            appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

            const transaction = new TransactionBuilder().withKind(partnerKind).build();
            appDevDependencies.transactionGateway.feedTransactions([transaction]);

            const res = await request(app)
              .get(`${URL}?lang=${lang}`)
              .set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

            expect(res.status).toBe(200);

            expect(res.text).toContain("test@email.com");
            expect(res.text).toContain("My Company ltd - GP");

            expect(res.text).toContain(translation.postTransition.title);
            expect(res.text).not.toContain(translation.title);

            expect(res.text).toContain(toEscapedHtml(partnerText));

            let excludedTranslations = ["limitedPartnerType", "updateGeneralPartnerType"];

            if (partnerKind === PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY) {
              excludedTranslations = [...excludedTranslations, "removePartner", "updatePartner"];
            } else if (partnerKind === PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY) {
              excludedTranslations = [...excludedTranslations, "addPartner", "updatePartner"];
            } else if (partnerKind === PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY) {
              excludedTranslations = [...excludedTranslations, "addPartner", "removePartner", "generalPartnerType"];
            }

            testTranslations(res.text, translation.postTransition.partner, excludedTranslations);

            expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);

            expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
            expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());

            expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
          }
        );
      });
    });
  });

  describe("Limited Partner", () => {
    describe("Person", () => {
      it.each([
        [
          enTranslationText.serviceName.addLimitedPartner,
          PartnerKind.ADD_LIMITED_PARTNER_PERSON,
          enTranslationText.confirmationPage.postTransition.partner.addPartner,
          "en"
        ],
        [
          cyTranslationText.serviceName.addLimitedPartner,
          PartnerKind.ADD_LIMITED_PARTNER_PERSON,
          cyTranslationText.confirmationPage.postTransition.partner.addPartner,
          "cy"
        ],
        [
          enTranslationText.serviceName.removeLimitedPartnerPerson,
          PartnerKind.REMOVE_LIMITED_PARTNER_PERSON,
          enTranslationText.confirmationPage.postTransition.partner.removePartner,
          "en"
        ],
        [
          cyTranslationText.serviceName.removeLimitedPartnerPerson,
          PartnerKind.REMOVE_LIMITED_PARTNER_PERSON,
          cyTranslationText.confirmationPage.postTransition.partner.removePartner,
          "cy"
        ]
      ])(
        "should load confirmation page - limited partner (person) - %s",
        async (serviceName, partnerKind, partnerText, lang) => {
          const translation = lang === "en" ? enTranslationText.confirmationPage : cyTranslationText.confirmationPage;

          const limitedPartner = new LimitedPartnerBuilder()
            .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
            .isPerson()
            .build();
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app)
            .get(`${URL}?lang=${lang}`)
            .set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);

          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("Joe - LP");
          expect(res.text).toContain("Doe - LP");

          expect(res.text).toContain(translation.postTransition.title);
          expect(res.text).not.toContain(translation.title);

          expect(res.text).toContain(toEscapedHtml(partnerText));

          let excludedTranslations = ["generalPartnerType", "updateGeneralPartnerType"];

          if (partnerKind === PartnerKind.ADD_LIMITED_PARTNER_PERSON) {
            excludedTranslations = [...excludedTranslations, "removePartner", "updatePartner"];
          } else if (partnerKind === PartnerKind.REMOVE_LIMITED_PARTNER_PERSON) {
            excludedTranslations = [...excludedTranslations, "addPartner", "updatePartner"];
          } else if (partnerKind === PartnerKind.UPDATE_LIMITED_PARTNER_PERSON) {
            excludedTranslations = [...excludedTranslations, "addPartner", "removePartner", "generalPartnerType"];
          }

          testTranslations(res.text, translation.postTransition.partner, excludedTranslations);

          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);

          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());

          expect(countOccurrences(res.text, serviceName)).toBe(2);
        }
      );
    });

    describe("Legal Entity", () => {
      it.each([
        [
          enTranslationText.serviceName.addLimitedPartner,
          PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY,
          enTranslationText.confirmationPage.postTransition.partner.addPartner,
          "en"
        ],
        [
          cyTranslationText.serviceName.addLimitedPartner,
          PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY,
          cyTranslationText.confirmationPage.postTransition.partner.addPartner,
          "cy"
        ],
        [
          enTranslationText.serviceName.removeLimitedPartnerEntity,
          PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY,
          enTranslationText.confirmationPage.postTransition.partner.removePartner,
          "en"
        ],
        [
          cyTranslationText.serviceName.removeLimitedPartnerEntity,
          PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY,
          cyTranslationText.confirmationPage.postTransition.partner.removePartner,
          "cy"
        ]
      ])(
        "should load confirmation page - limited partner (legal entity) - %s",
        async (serviceName, partnerKind, partnerText, lang) => {
          const translation = lang === "en" ? enTranslationText.confirmationPage : cyTranslationText.confirmationPage;

          const limitedPartner = new LimitedPartnerBuilder()
            .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
            .isLegalEntity()
            .build();
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app)
            .get(`${URL}?lang=${lang}`)
            .set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);

          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("My Company ltd - LP");

          expect(res.text).toContain(translation.postTransition.title);
          expect(res.text).not.toContain(translation.title);

          expect(res.text).toContain(toEscapedHtml(partnerText));

          let excludedTranslations = ["generalPartnerType", "updateGeneralPartnerType"];

          if (partnerKind === PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY) {
            excludedTranslations = [...excludedTranslations, "removePartner", "updatePartner"];
          } else if (partnerKind === PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY) {
            excludedTranslations = [...excludedTranslations, "addPartner", "updatePartner"];
          } else if (partnerKind === PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY) {
            excludedTranslations = [...excludedTranslations, "addPartner", "removePartner", "generalPartnerType"];
          }

          testTranslations(res.text, translation.postTransition.partner, excludedTranslations);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);

          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());

          expect(countOccurrences(res.text, serviceName)).toBe(2);
        }
      );
    });
  });

  describe("Limited Partnership", () => {
    it.each([
      [
        enTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress,
        "limited-partnership#update-partnership-registered-office-address",
        enTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
        "en"
      ],
      [
        cyTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress,
        "limited-partnership#update-partnership-registered-office-address",
        cyTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
        "cy"
      ],
      [
        enTranslationText.serviceName.updateLimitedPartnershipName,
        "limited-partnership#update-partnership-name",
        enTranslationText.confirmationPage.postTransition.name,
        "en"
      ],
      [
        cyTranslationText.serviceName.updateLimitedPartnershipName,
        "limited-partnership#update-partnership-name",
        cyTranslationText.confirmationPage.postTransition.name,
        "cy"
      ],
      [
        enTranslationText.serviceName.updateLimitedPartnershipTerm,
        "limited-partnership#update-partnership-term",
        enTranslationText.confirmationPage.postTransition.term,
        "en"
      ],
      [
        cyTranslationText.serviceName.updateLimitedPartnershipTerm,
        "limited-partnership#update-partnership-term",
        cyTranslationText.confirmationPage.postTransition.term,
        "cy"
      ],
      [
        enTranslationText.serviceName.updateLimitedPartnershipPrincipalPlaceOfBusinessAddress,
        "limited-partnership#update-partnership-principal-place-of-business-address",
        enTranslationText.confirmationPage.postTransition.principalPlaceOfBusinessAddress,
        "en"
      ],
      [
        cyTranslationText.serviceName.updateLimitedPartnershipPrincipalPlaceOfBusinessAddress,
        "limited-partnership#update-partnership-principal-place-of-business-address",
        cyTranslationText.confirmationPage.postTransition.principalPlaceOfBusinessAddress,
        "cy"
      ],
      [
        enTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP,
        "limited-partnership#update-partnership-redesignate-to-pflp",
        enTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
        "en"
      ],
      [
        cyTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP,
        "limited-partnership#update-partnership-redesignate-to-pflp",
        cyTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
        "cy"
      ]
    ])(
      "should load confirmation page - for limited partnership with english message text for the specific journey - %s",
      async (serviceName: string, kind: string, message: string, lang: string) => {
        const transaction = new TransactionBuilder().withKind(kind).build();

        appDevDependencies.transactionGateway.feedTransactions([transaction]);

        const limitedPartnership = new LimitedPartnershipBuilder().build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(toEscapedHtml(message));

        expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
        expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());

        expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
      }
    );
  });
});
