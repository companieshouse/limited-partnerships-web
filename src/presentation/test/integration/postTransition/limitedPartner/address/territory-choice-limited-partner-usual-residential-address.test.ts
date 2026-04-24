import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enGeneralTranslationText from "../../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../../locales/cy/address.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import { APPLICATION_CACHE_KEY } from "../../../../../../config/constants";

import {
  ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import {
  ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
} from "../../../../../controller/postTransition/url";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnerBuilder, { limitedPartnerPerson } from "../../../../builder/LimitedPartnerBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("Limited Partner Usual Residential Address Territory Choice", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText };
  const URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .withKind(PartnerKind.ADD_LIMITED_PARTNER_PERSON)
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET /limited-partner-usual-residential-address-choose-territory", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the limited partner usual residential address territory choice page with %s text", async (language: string, lang: string, translationText: Record<string, any>) => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        toEscapedHtml(
          `${translationText.address.territoryChoice.limitedPartnerUsualResidentialAddress.title} - ${translationText.serviceName.addLimitedPartner} - GOV.UK`
        )
      );

      testTranslations(res.text, translationText.address.territoryChoice.limitedPartnerUsualResidentialAddress);
      testTranslations(res.text, translationText.address.territories);
      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.addLimitedPartner))).toBe(2);

      expect(res.text).toContain(
        `${limitedPartnerPerson.forename.toUpperCase()} ${limitedPartnerPerson.surname.toUpperCase()}`
      );
    });

    it.each([
      [
        "update",
        PartnerKind.UPDATE_LIMITED_PARTNER_PERSON,
        UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
      ],
      ["add", PartnerKind.ADD_LIMITED_PARTNER_PERSON, ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL]
    ])(
      "should contain the correct back link when on %s limited partner person journey",
      async (_description: string, partnerKind: PartnerKind, backUrl: string) => {
        const limitedPartner = new LimitedPartnerBuilder()
          .isPerson()
          .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
          .withKind(partnerKind)
          .build();

        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(getUrl(backUrl));
      }
    );
  });

  describe("POST /limited-partner-territory-choice", () => {
    it.each([
      ["United Kingdom", "unitedKingdom", POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL],
      ["Overseas", "overseas", ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL]
    ])("should redirect to the correct page when %s is selected", async (option: string, parameter: string, expectedUrl: string) => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
        parameter: parameter
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(getUrl(expectedUrl));

      expect(appDevDependencies.cacheRepository.cache).toEqual({
        [APPLICATION_CACHE_KEY]: {
          [appDevDependencies.transactionGateway.transactionId]: {
            ura_territory_choice: parameter
          }
        }
      });
    });

    it("should show an error message when no selection is made for territory choice", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Select if the usual residential address is in the UK or overseas");
      expect(res.text).toContain(
        `${limitedPartnerPerson.forename.toUpperCase()} ${limitedPartnerPerson.surname.toUpperCase()}`
      );
    });
  });
});
