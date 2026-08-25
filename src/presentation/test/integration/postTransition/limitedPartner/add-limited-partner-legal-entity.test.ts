import request from "supertest";
import { PartnerKind, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  LIMITED_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";

import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/postTransition";
import { customerFeedbackUrlMap } from "../../../../../middlewares/customer-feedback.middleware";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
import PostTransitionRouting from "../../../../controller/postTransition/routing";

describe("Add Limited Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  let companyProfile: { _id: string; data: Partial<CompanyProfile> };

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("Get Add Limited Partner Legal Entity Page", () => {
    it.each([
      [PartnershipType.LP, "en", enTranslationText, true],
      [PartnershipType.SLP, "en", enTranslationText, true],
      [PartnershipType.PFLP, "en", enTranslationText, false],
      [PartnershipType.SPFLP, "en", enTranslationText, false],
      [PartnershipType.LP, "cy", cyTranslationText, true],
      [PartnershipType.SLP, "cy", cyTranslationText, true],
      [PartnershipType.PFLP, "cy", cyTranslationText, false],
      [PartnershipType.SPFLP, "cy", cyTranslationText, false]
    ])(
      "should load the add limited partner legal entity page for partnership type %s and language %s",
      async (partnershipType: PartnershipType, lang: string, i18n: any, expectCapitalContributionText: boolean) => {
        companyProfile.data.subtype = partnershipType;

        setLocalesEnabled(true);
        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(`${i18n.partner.addOrUpdatePartnerLegalEntityPage.limitedPartner.title}`);
        testTranslations(res.text, i18n.partner.addOrUpdatePartnerLegalEntityPage, [
          "errorMessages",
          "generalPartner",
          "updateTitle",
          "dateEffectiveFrom",
          "capitalContribution"
        ]);

        if (expectCapitalContributionText) {
          testTranslations(res.text, i18n.partner.capitalContribution);
        } else {
          expect(res.text).not.toContain(toEscapedHtml(i18n.partner.capitalContribution.title));
        }

        if (lang !== "cy") {
          expect(res.text).not.toContain("WELSH -");
        }

        expect(countOccurrences(res.text, i18n.serviceName.addLimitedPartner)).toBe(4);
        expect(res.text).toContain(customerFeedbackUrlMap.addLimitedPartner);
      }
    );

    it("should contain a back link to the choice page when limited partners are not present", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL) + "?lang=en");

      const BACK_LINK = getUrl(LIMITED_PARTNER_CHOICE_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(BACK_LINK);
    });
  });

  describe("Post Add Limited Partner Legal Entity", () => {
    it("should send the limited partner legal entity details", async () => {
      const limitedPartner = new LimitedPartnerBuilder().isLegalEntity().build();

      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear().toString();

      const res = await request(app)
        .post(URL)
        .send({
          ...PostTransitionRouting.get(PostTransitionPageType.addLimitedPartnerLegalEntity),
          ...limitedPartner.data,
          "date_effective_from-day": day,
          "date_effective_from-month": month,
          "date_effective_from-year": year
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe(
        "Add a limited partner (legal entity)"
      );

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(1);
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.kind).toEqual(
        PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY
      );
    });

    it("should return a validation error when date effective from is %s", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          ...PostTransitionRouting.get(PostTransitionPageType.addLimitedPartnerLegalEntity),
          "date_effective_from-day": "222",
          "date_effective_from-month": "10",
          "date_effective_from-year": "2024"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.dateEffectiveFrom.dayInvalidLength);
    });

    it("should return a validation error when date effective from is before registration date", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          ...PostTransitionRouting.get(PostTransitionPageType.addLimitedPartnerLegalEntity),
          "date_effective_from-day": "22",
          "date_effective_from-month": "10",
          "date_effective_from-year": "2011"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.dateEffectiveFrom.beforeRegistrationDate));
    });

    it("should send the limited partner details and go to confirm principal office address page if already saved", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isLegalEntity()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addLimitedPartnerLegalEntity,
          ...limitedPartner.data,
          "date_effective_from-day": "01",
          "date_effective_from-month": "10",
          "date_effective_from-year": "2011"
        });

      const REDIRECT_URL = getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
