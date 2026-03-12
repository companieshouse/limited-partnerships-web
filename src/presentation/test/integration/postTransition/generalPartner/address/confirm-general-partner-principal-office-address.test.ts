import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { countOccurrences, feedTransactionAndPartner, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";

import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import {
  GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
  UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL
} from "../../../../../controller/postTransition/url";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Confirm General Partner Principal Office Address Page", () => {
  const URL = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
  const CHANGE_LINK_URL = getUrl(ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

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

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("GET Confirm Principal Office Address Page", () => {
    it.each([
      ["add", "en"],
      ["add", "cy"],
      ["update", "en"],
      ["update", "cy"]
    ])("should load the confirm principal office address page with %s journey and %s language", async (journey: string, lang: string) => {
      const translationtext = lang === "en" ? enTranslationText : cyTranslationText;
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationtext.address.confirm.principalOfficeAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(translationtext.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      const expectedServiceName = journey === "add" ? translationtext.serviceName.addGeneralPartner : translationtext.serviceName.updateGeneralPartnerLegalEntity;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it.each([
      ["add", "overseas", getUrl(ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["add", "unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["update", "", getUrl(UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL)]
    ])("should have the correct back link and change link for %s journey and %s territory choice", async (journey: string, territory: string, backLink: string) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY;
      feedTransactionAndPartner(partnerKind);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          poa_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      if (territory === "overseas") {
        expect(countOccurrences(res.text, CHANGE_LINK_URL)).toBe(2);
      } else {
        expect(countOccurrences(res.text, CHANGE_LINK_URL)).toBe(1);
      }

      expect(res.text).toContain(backLink);
    });
  });

  describe("POST confirm Principal Office Address Page", () => {
    it.each([
      ["add"],
      ["update"]
    ])("should redirect to the next page", async (journey: string) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY : PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const REDIRECT_URL = journey === "add" ? getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL) : getUrl(WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress
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
        pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
    });
  });
});
