import request from "supertest";

import app from "../../../app";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import { countOccurrences, feedTransactionAndPartner, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL, UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL, WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL } from "../../../../../controller/postTransition/url";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { limitedPartnerPerson } from "../../../../builder/LimitedPartnerBuilder";

describe("Confirm Limited Partner Usual Residential Address Page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  const cacheData = {
    ["usual_residential_address"]: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    },
    ura_territory_choice: ""
  };

  beforeEach(() => {
    setLocalesEnabled(true);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: cacheData
    });

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();
    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("GET Confirm Usual Residential Address Page", () => {
    it.each([
      ["add", "en"],
      ["add", "cy"],
      ["update", "en"],
      ["update", "cy"]
    ])("should load the %s confirm usual residential address page with %s text", async (journey: string, lang: string) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      const partnerKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_PERSON : PartnerKind.UPDATE_LIMITED_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.address.confirm.limitedPartnerUsualResidentialAddress);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(translationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(res.text).toContain(limitedPartnerPerson.forename?.toUpperCase() + " " + limitedPartnerPerson.surname?.toUpperCase());

      const expectedServiceName = journey === "add" ? translationText.serviceName.addLimitedPartner : translationText.serviceName.updateLimitedPartnerPerson;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it.each([
      ["add", "overseas", ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL],
      ["add", "unitedKingdom", POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL],
      ["update", "overseas", ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL],
      ["update", "unitedKingdom", UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL]
    ])("should contain the correct back link when on %s limited partner person journey", async (journey: string, territory: string, backUrl: string) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_PERSON : PartnerKind.UPDATE_LIMITED_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ...cacheData,
          ura_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        getUrl(backUrl)
      );
    });
  });

  describe("POST Confirm Usual Residential Address Page", () => {
    it.each([
      ["update", WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL],
      ["add", LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL]
    ])("should redirect to the correct next page when on %s limited partner person journey", async (journey: string, nextUrl: string) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_LIMITED_PARTNER_PERSON : PartnerKind.UPDATE_LIMITED_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
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
      expect(res.text).toContain(`Redirecting to ${getUrl(nextUrl)}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmLimitedPartnerUsualResidentialAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it.each([
      ["en", enErrorMessages],
      ["cy", cyErrorMessages]
    ])("should show validation error message if validation error occurs when saving address with lang %s", async (lang: string, errorMessagesJson: any) => {
      setLocalesEnabled(true);
      const res = await request(app).post(`${URL}?lang=${lang}`).send({
        pageType: AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
    });
  });
});
