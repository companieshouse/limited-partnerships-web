import request from "supertest";

import app from "../../../app";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import { countOccurrences, getUrl, setLocalesEnabled, feedTransactionAndPartner, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL, UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL, WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL } from "../../../../../controller/postTransition/url";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";

describe("Confirm General Partner Correspondence Address Page", () => {
  const URL = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
  const CHANGE_LINK_URL = getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
  const cacheData = {
    ["service_address"]: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    },
    sa_territory_choice: ""
  };

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: cacheData
    });

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("GET Confirm Correspondence Address Page", () => {
    it.each([
      ["add", "en"],
      ["add", "cy"],
      ["update", "en"],
      ["update", "cy"]
    ])("should load the confirm correspondence address for %s general partner journey page with %s text", async (journey: string, lang: string) => {
      const translationtext = lang === "en" ? enTranslationText : cyTranslationText;
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationtext.address.confirm.correspondenceAddress);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(translationtext.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(res.text).toContain(generalPartnerPerson.forename?.toUpperCase() + " " + generalPartnerPerson.surname?.toUpperCase());

      const expectedServiceName = journey === "add" ? translationtext.serviceName.addGeneralPartner : translationtext.serviceName.updateGeneralPartnerPerson;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it.each([
      ["add", "overseas", getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL)],
      ["add", "unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL)],
      ["update", "", getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL)],
    ])("should have the correct back link and change link for %s journey and territory choice %s", async (journey, territory, backLink) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ...cacheData,
          sa_territory_choice: territory
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

  describe("POST Confirm Correspondence Address Page", () => {
    it.each([
      ["add"],
      ["update"]
    ])("should redirect to the next page", async (journey: string) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const REDIRECT_URL = journey === "add" ? getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL) : getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress
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
        pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
    });
  });
});
