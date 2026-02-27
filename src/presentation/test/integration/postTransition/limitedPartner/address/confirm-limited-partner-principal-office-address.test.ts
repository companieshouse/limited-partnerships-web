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

import LimitedPartnerBuilder from "../../../../builder/LimitedPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL, UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL, WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL } from "../../../../../controller/postTransition/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe.each([
  ["Add", PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY],
  ["Update", PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY]
])("%s Confirm Limited Partner Principal Office Address Page", (description: string, partnerKind: PartnerKind) => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
  const redirectUrl = partnerKind === PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY ? getUrl(LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL) : getUrl(WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
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

    const transaction = new TransactionBuilder().withKind(partnerKind).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .withKind(partnerKind)
      .build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
  });

  describe("GET Confirm Principal Office Address Page", () => {
    it("should load the %s confirm principal office address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.limitedPartnerPrincipalOfficeAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(enTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");

      const expectedServiceName = partnerKind === PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY ?
        enTranslationText.serviceName.addLimitedPartner :
        enTranslationText.serviceName.updateLimitedPartnerLegalEntity;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it("should load the %s confirm principal office address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.limitedPartnerPrincipalOfficeAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(cyTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");

      const expectedServiceName = partnerKind === PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY ?
        enTranslationText.serviceName.addLimitedPartner :
        enTranslationText.serviceName.updateLimitedPartnerLegalEntity;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it.each([
      ["overseas"],
      ["unitedKingdom"]
    ])("should have the correct back link", async (territory: string) => {
      let backLink: string;
      if (partnerKind === PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY) {
        backLink = getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);
      } else {
        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            poa_territory_choice: territory
          }
        });
        backLink = territory === "overseas" ? getUrl(ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL) : getUrl(POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
      }

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });
  });

  describe("POST confirm Principal Office Address Page", () => {
    it("should redirect to the next page", async () => {
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

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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
