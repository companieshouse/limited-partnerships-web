import request from "supertest";
import { Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../locales/cy/errors.json";
import app from "../app";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { WHERE_IS_THE_JURISDICTION_URL } from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import RegistrationPageType from "../../../controller/registration/PageType";
import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../../../controller/addressLookUp/url/registration";

describe("Where is the jurisdiction page", () => {
  const URL = getUrl(WHERE_IS_THE_JURISDICTION_URL);
  const REDIRECT_URL = getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  describe("GET Where is the jurisdiction page", () => {
    it.each([
      ["en", PartnershipType.LP, "EnglandWales"],
      ["cy", PartnershipType.LP, "EnglandWales"],
      ["en", PartnershipType.PFLP, "EnglandWales"],
      ["cy", PartnershipType.PFLP, "EnglandWales"],
      ["en", PartnershipType.SLP, "Scotland"],
      ["cy", PartnershipType.SLP, "Scotland"],
      ["en", PartnershipType.SPFLP, "Scotland"],
      ["cy", PartnershipType.SPFLP, "Scotland"]
    ])("should load the jurisdiction page with %s text for %s %s jurisdiction", async (lang: string, partnershipType: PartnershipType, jurisdiction: string) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);

      if (jurisdiction === "Scotland") {
        expect(res.text).toContain(
          `${translationText.whereIsTheJurisdiction.scotland.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.whereIsTheJurisdiction.scotland, []);
      } else {
        expect(res.text).toContain(
          `${translationText.whereIsTheJurisdiction.title} - ${translationText.serviceRegistration} - GOV.UK`
        );

        testTranslations(res.text, translationText.whereIsTheJurisdiction, ["scotland"]);
      }

      expect(res.text).toContain(limitedPartnership.data?.partnership_name?.toUpperCase());
      expect(res.text).toContain(translationText.buttons.saveAndContinue);
    });
  });

  describe("POST Where is the jurisdiction page", () => {
    it.each([
      [PartnershipType.LP, Jurisdiction.ENGLAND_AND_WALES],
      [PartnershipType.PFLP, Jurisdiction.ENGLAND_AND_WALES],
      [PartnershipType.LP, Jurisdiction.NORTHERN_IRELAND],
      [PartnershipType.PFLP, Jurisdiction.NORTHERN_IRELAND]
    ])("should redirect to the postcode registered office address page for partnership type %s when %s jurisdiction is selected", async (partnershipType: PartnershipType, jurisdiction: Jurisdiction) => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.jurisdiction,
        jurisdiction: jurisdiction
      });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(REDIRECT_URL);
    });

    it.each([
      ["en", PartnershipType.LP],
      ["cy", PartnershipType.LP],
      ["en", PartnershipType.PFLP],
      ["cy", PartnershipType.PFLP],
    ])("should return validation error when no jurisdiction is selected", async (lang: string, partnershipType: PartnershipType) => {
      const translationText = lang === "en" ? enErrorMessages : cyErrorMessages;
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipName(partnershipType).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL + `?lang=${lang}`).send({ pageType: RegistrationPageType.jurisdiction });

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, translationText.errorMessages.limitedPartnership.jurisdiction.required)).toBe(2);
    });
  });
});
