import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";

import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";

import LimitedPartnerBuilder, { limitedPartnerLegalEntity } from "../../../../builder/LimitedPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL, UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL, WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL } from "../../../../../controller/postTransition/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Confirm Limited Partner Principal Office Address Page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(true);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["principal_office_address"]: {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "England"
        }
      }
    });

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("GET Confirm Principal Office Address Page", () => {
    it.each([
      ["add", "en"],
      ["add", "cy"],
      ["update", "en"],
      ["update", "cy"]
    ])("should load the confirm principal office address page with %s limited partner person journey and %s language", async (journey: string, lang: string) => {
      const translationtext = lang === "en" ? enTranslationText : cyTranslationText;
      const transactionKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;
      setupTransactionAndLimitedPartner(transactionKind);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationtext.address.confirm.limitedPartnerPrincipalOfficeAddress);
      expect(res.text).not.toContain(lang === "en" ? "WELSH -" : "SAESNEG -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(lang === "en" ? enTranslationText.countries.england : cyTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(res.text).toContain(limitedPartnerLegalEntity.legal_entity_name?.toUpperCase());

      const expectedServiceName = journey === "add" ? translationtext.serviceName.addLimitedPartner : translationtext.serviceName.updateLimitedPartnerLegalEntity;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it.each([
      ["add", "overseas", getUrl(ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["add", "unitedKingdom", getUrl(POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["update", "", getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL)]
    ])("should have the correct back link for journey %s and territory %s", async (journey, territory, backLink) => {
      const transactionKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;
      setupTransactionAndLimitedPartner(transactionKind);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          poa_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });
  });

  describe("POST confirm Principal Office Address Page", () => {
    it.each([
      ["add"],
      ["update"]
    ])("should redirect to the next page", async (journey: string) => {
      const transactionKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;
      setupTransactionAndLimitedPartner(transactionKind);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const REDIRECT_URL = journey === "add" ? getUrl(LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL) : getUrl(WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it.each([
      [ "en", enErrorMessages ],
      [ "cy", cyErrorMessages ]
    ])("should show validation error message if validation error occurs when saving address with lang %s", async (lang: string, errorMessagesJson: any) => {
      setLocalesEnabled(true);
      const res = await request(app).post(`${URL}?lang=${lang}`).send({
        pageType: AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
    });
  });
});

const setupTransactionAndLimitedPartner = (transactionKind: PartnerKind) => {
  const transaction = new TransactionBuilder().withKind(transactionKind).build();
  appDevDependencies.transactionGateway.feedTransactions([transaction]);

  const limitedPartner = new LimitedPartnerBuilder()
    .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
    .isLegalEntity()
    .withKind(transactionKind)
    .build();

  appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
};
