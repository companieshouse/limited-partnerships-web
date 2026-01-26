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
      describe("English", () => {
        it.each(
          [
            [PartnerKind.ADD_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.addGeneralPartner, enTranslationText.confirmationPage.postTransition.partner.addPartner],
            [PartnerKind.REMOVE_GENERAL_PARTNER_PERSON, enTranslationText.serviceName.removeGeneralPartnerPerson, enTranslationText.confirmationPage.postTransition.partner.removePartner],
          ]
        )("should load confirmation page - general partner (person)", async (partnerKind, serviceName, partnerText) => {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isPerson()
            .build();
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app).get(URL).set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("Joe - GP");
          expect(res.text).toContain("Doe - GP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).toContain(toEscapedHtml(partnerText));
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, [
            "limitedPartnerType",
            "addPartner",
            "removePartner",
            "updatePartner",
            "updateGeneralPartnerType"
          ]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
        });

        it.each(
          [
            [PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY, enTranslationText.serviceName.addGeneralPartner, enTranslationText.confirmationPage.postTransition.partner.addPartner],
            [PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY, enTranslationText.serviceName.removeGeneralPartnerEntity, enTranslationText.confirmationPage.postTransition.partner.removePartner],
          ]
        )("should load confirmation page - general partner (legal entity)", async (partnerKind, serviceName, partnerText) => {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isLegalEntity()
            .build();
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app).get(URL).set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("My Company ltd - GP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).toContain(toEscapedHtml(partnerText));
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, [
            "limitedPartnerType",
            "addPartner",
            "removePartner",
            "updatePartner",
            "updateGeneralPartnerType"
          ]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
        });
      });

      describe("Welsh", () => {
        it.each(
          [
            [PartnerKind.ADD_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.addGeneralPartner, cyTranslationText.confirmationPage.postTransition.partner.addPartner],
            [PartnerKind.REMOVE_GENERAL_PARTNER_PERSON, cyTranslationText.serviceName.removeGeneralPartnerPerson, cyTranslationText.confirmationPage.postTransition.partner.removePartner],
          ]
        )("should load confirmation page - general partner (person)", async (partnerKind, serviceName, partnerText) => {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isPerson()
            .build();
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app)
            .get(URL + "?lang=cy")
            .set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("Joe - GP");
          expect(res.text).toContain("Doe - GP");
          expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
          expect(res.text).toContain(toEscapedHtml(partnerText));
          expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
          testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, [
            "limitedPartnerType",
            "addPartner",
            "removePartner",
            "updatePartner",
            "updateGeneralPartnerType"
          ]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, serviceName)).toBe(2);
        });

        it.each(
          [
            [PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY, cyTranslationText.serviceName.addGeneralPartner, cyTranslationText.confirmationPage.postTransition.partner.addPartner],
            [PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY, cyTranslationText.serviceName.removeGeneralPartnerEntity, cyTranslationText.confirmationPage.postTransition.partner.removePartner],
          ]
        )("should load confirmation page - general partner (legal entity)", async (partnerKind, serviceName, partnerText) => {
          const generalPartner = new GeneralPartnerBuilder()
            .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
            .isLegalEntity()
            .build();
          appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app)
            .get(URL + "?lang=cy")
            .set("Referrer", GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("My Company ltd - GP");
          expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
          expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
          expect(res.text).toContain(toEscapedHtml(partnerText));
          testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, [
            "limitedPartnerType",
            "addPartner",
            "removePartner",
            "updatePartner",
            "updateGeneralPartnerType"
          ]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, serviceName)).toBe(2);
        });
      });
    });

    describe("Limited Partner", () => {
      describe("English", () => {

        it.each(
          [
            [PartnerKind.ADD_LIMITED_PARTNER_PERSON, enTranslationText.serviceName.addLimitedPartner, enTranslationText.confirmationPage.postTransition.partner.addPartner],
            [PartnerKind.REMOVE_LIMITED_PARTNER_PERSON, enTranslationText.serviceName.removeLimitedPartnerPerson, enTranslationText.confirmationPage.postTransition.partner.removePartner],
          ]
        )("should load confirmation page - limited partner (person)", async (partnerKind, serviceName, partnerText) => {
          const limitedPartner = new LimitedPartnerBuilder()
            .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
            .isPerson()
            .build();
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app).get(URL).set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("Joe - LP");
          expect(res.text).toContain("Doe - LP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).toContain(toEscapedHtml(partnerText));
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, [
            "generalPartnerType",
            "addPartner",
            "removePartner",
            "updatePartner",
            "updateGeneralPartnerType"
          ]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, serviceName)).toBe(2);
        });

        it.each(
          [
            [PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY, enTranslationText.serviceName.addLimitedPartner, enTranslationText.confirmationPage.postTransition.partner.addPartner],
            [PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY, enTranslationText.serviceName.removeLimitedPartnerEntity, enTranslationText.confirmationPage.postTransition.partner.removePartner],
          ]
        )("should load confirmation page - limited partner (legal entity)", async (partnerKind, serviceName, partnerText) => {
          const limitedPartner = new LimitedPartnerBuilder()
            .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
            .isLegalEntity()
            .build();
          appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app).get(URL).set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

          expect(res.status).toBe(200);
          expect(res.text).toContain("test@email.com");
          expect(res.text).toContain("My Company ltd - LP");
          expect(res.text).toContain(enTranslationText.confirmationPage.postTransition.title);
          expect(res.text).toContain(toEscapedHtml(partnerText));
          expect(res.text).not.toContain(enTranslationText.confirmationPage.title);
          testTranslations(res.text, enTranslationText.confirmationPage.postTransition.partner, [
            "generalPartnerType",
            "addPartner",
            "removePartner",
            "updatePartner",
            "updateGeneralPartnerType"
          ]);
          expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, serviceName)).toBe(2);
        });
      });
    });

    describe("Welsh", () => {
      it.each(
        [
          [PartnerKind.ADD_LIMITED_PARTNER_PERSON, cyTranslationText.serviceName.addLimitedPartner, cyTranslationText.confirmationPage.postTransition.partner.addPartner],
          [PartnerKind.REMOVE_LIMITED_PARTNER_PERSON, cyTranslationText.serviceName.removeLimitedPartnerPerson, cyTranslationText.confirmationPage.postTransition.partner.removePartner],
        ]
      )("should load confirmation page - limited partner (person)", async (partnerKind, serviceName, partnerText) => {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isPerson()
          .build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

        const transaction = new TransactionBuilder().withKind(partnerKind).build();
        appDevDependencies.transactionGateway.feedTransactions([transaction]);

        const res = await request(app)
          .get(URL + "?lang=cy")
          .set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("Joe - LP");
        expect(res.text).toContain("Doe - LP");
        expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
        expect(res.text).toContain(toEscapedHtml(partnerText));
        expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
        testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, [
          "generalPartnerType",
          "addPartner",
          "removePartner",
          "updatePartner",
          "updateGeneralPartnerType"
        ]);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
        expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
        expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
        expect(countOccurrences(res.text, serviceName)).toBe(2);
      });

      it.each(
        [
          [PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY, cyTranslationText.serviceName.addLimitedPartner, cyTranslationText.confirmationPage.postTransition.partner.addPartner],
          [PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY, cyTranslationText.serviceName.removeLimitedPartnerEntity, cyTranslationText.confirmationPage.postTransition.partner.removePartner],
        ]
      )("should load confirmation page - limited partner (legal entity)", async (partnerKind, serviceName, partnerText) => {
        const limitedPartner = new LimitedPartnerBuilder()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .isLegalEntity()
          .build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

        const transaction = new TransactionBuilder().withKind(partnerKind).build();
        appDevDependencies.transactionGateway.feedTransactions([transaction]);

        const res = await request(app)
          .get(URL + "?lang=cy")
          .set("Referrer", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("test@email.com");
        expect(res.text).toContain("My Company ltd - LP");
        expect(res.text).toContain(cyTranslationText.confirmationPage.postTransition.title);
        expect(res.text).toContain(toEscapedHtml(partnerText));
        expect(res.text).not.toContain(cyTranslationText.confirmationPage.title);
        testTranslations(res.text, cyTranslationText.confirmationPage.postTransition.partner, [
          "generalPartnerType",
          "addPartner",
          "removePartner",
          "updatePartner",
          "updateGeneralPartnerType"
        ]);
        expect(res.text).toContain(appDevDependencies.transactionGateway.transactionId);
        expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
        expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
        expect(countOccurrences(res.text, serviceName)).toBe(2);
      });
    });

    describe("Limited Partnership", () => {
      it.each([
        [
          "limited-partnership#update-partnership-registered-office-address",
          enTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
          enTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress
        ],
        [
          "limited-partnership#update-partnership-name",
          enTranslationText.confirmationPage.postTransition.name,
          enTranslationText.serviceName.updateLimitedPartnershipName
        ],
        [
          "limited-partnership#update-partnership-term",
          enTranslationText.confirmationPage.postTransition.term,
          enTranslationText.serviceName.updateLimitedPartnershipTerm
        ],
        [
          "limited-partnership#update-partnership-principal-place-of-business-address",
          enTranslationText.confirmationPage.postTransition.principalPlaceOfBusinessAddress,
          enTranslationText.serviceName.updateLimitedPartnershipPrincipalPlaceOfBusinessAddress
        ],
        [
          "limited-partnership#update-partnership-redesignate-to-pflp",
          enTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
          enTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP
        ]
      ])(
        "should load confirmation page - for limited partnership with english message text for the specific journey",
        async (kind: string, message: string, serviceName: string) => {
          const transaction = new TransactionBuilder().withKind(kind).build();

          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const limitedPartnership = new LimitedPartnershipBuilder().build();

          appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

          const res = await request(app).get(URL + "?lang=en");
          expect(res.status).toBe(200);
          expect(res.text).toContain(toEscapedHtml(message));
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, serviceName)).toBe(2);
        }
      );

      it.each([
        [
          "limited-partnership#update-partnership-registered-office-address",
          cyTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
          cyTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress
        ],
        [
          "limited-partnership#update-partnership-name",
          cyTranslationText.confirmationPage.postTransition.name,
          cyTranslationText.serviceName.updateLimitedPartnershipName
        ],
        [
          "limited-partnership#update-partnership-term",
          cyTranslationText.confirmationPage.postTransition.term,
          cyTranslationText.serviceName.updateLimitedPartnershipTerm
        ],
        [
          "limited-partnership#update-partnership-principal-place-of-business-address",
          cyTranslationText.confirmationPage.postTransition.principalPlaceOfBusinessAddress,
          cyTranslationText.serviceName.updateLimitedPartnershipPrincipalPlaceOfBusinessAddress
        ],
        [
          "limited-partnership#update-partnership-redesignate-to-pflp",
          cyTranslationText.confirmationPage.postTransition.registeredOfficeAddress,
          cyTranslationText.serviceName.updateLimitedPartnershipRedesignateToPFLP
        ]
      ])(
        "should load confirmation page - for limited partnership with welsh message text for the specific journey",
        async (kind: string, message: string, serviceName: string) => {
          const transaction = new TransactionBuilder().withKind(kind).build();

          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const limitedPartnership = new LimitedPartnershipBuilder().build();

          appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

          const res = await request(app).get(URL + "?lang=cy");

          expect(res.status).toBe(200);
          expect(res.text).toContain(toEscapedHtml(message));
          expect(res.text).toContain(companyProfile.data?.companyName?.toUpperCase());
          expect(res.text).toContain(companyProfile.data?.companyNumber?.toUpperCase());
          expect(countOccurrences(res.text, serviceName)).toBe(2);
        }
      );
    });
  });
});
