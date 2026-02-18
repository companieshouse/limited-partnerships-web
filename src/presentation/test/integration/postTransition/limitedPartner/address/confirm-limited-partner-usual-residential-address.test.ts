import request from "supertest";

import app from "../../../app";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import {
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnerBuilder from "../../../../builder/LimitedPartnerBuilder";
import { LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL, UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL } from "../../../../../controller/postTransition/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Confirm Limited Partner Usual Residential Address Page", () => {
  const URL = getUrl(CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["usual_residential_address"]: {
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

    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET Confirm Usual Residential Address Page", () => {
    it("should load the confirm usual residential address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.limitedPartnerUsualResidentialAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(enTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(countOccurrences(res.text, enTranslationText.serviceName.addLimitedPartner)).toBe(2);
    });

    it("should load the confirm usual residential address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.limitedPartnerUsualResidentialAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(cyTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(countOccurrences(res.text, cyTranslationText.serviceName.addLimitedPartner)).toBe(2);
    });

    it.each([
      ["update", "overseas", PartnerKind.UPDATE_LIMITED_PARTNER_PERSON, UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL],
      ["update", "unitedKingdom", PartnerKind.UPDATE_LIMITED_PARTNER_PERSON, UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL],
      ["add", "overseas", PartnerKind.ADD_LIMITED_PARTNER_PERSON, ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL],
      ["add", "unitedKingdom", PartnerKind.ADD_LIMITED_PARTNER_PERSON, POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL]
    ])("should contain the correct back link when on %s limited partner person journey", async (_description: string, territory: string, partnerKind: PartnerKind, backUrl: string) => {
      const limitedPartner = new LimitedPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .withKind(partnerKind)
        .build();
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
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
    it("should redirect to the next page", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

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

      const redirectUrl = getUrl(LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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
      [ "en", enErrorMessages ],
      [ "cy", cyErrorMessages ]
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
