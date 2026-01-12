import request from "supertest";

import app from "../../../app";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import {
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder from "../../../../builder/GeneralPartnerBuilder";
import { GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL, WHEN_DID_GENERAL_PARTNER_DETAILS_CHANGE_URL } from "../../../../../controller/postTransition/url";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Confirm General Partner Correspondence Address Page", () => {
  const URL = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        service_address: {
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

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("GET Confirm Correspondence Address Page", () => {
    it("should load the confirm correspondence address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.correspondenceAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(enTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
    });

    it("should load the confirm correspondence address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.correspondenceAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(cyTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
    });

    it.each([
      ["overseas", getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL)],
      ["unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL)]
    ])("should have the correct back link", async (territory, backLink) => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          sa_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });

    it("should have back link to enter page when partner kind is UPDATE_GENERAL_PARTNER_PERSON", async () => {
      const updateGeneralPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([updateGeneralPartner]);

      const backLinkUrl = getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(backLinkUrl);
    });
  });

  describe("POST Confirm Correspondence Address Page", () => {
    it("should redirect to the next page", async () => {
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

      const redirectUrl = getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);

      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the next page for the update journey", async () => {
      const generalPartnerUpdate = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerUpdate]);
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

      const redirectUrl = getUrl(WHEN_DID_GENERAL_PARTNER_DETAILS_CHANGE_URL);

      expect(res.status).toBe(302);

      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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
