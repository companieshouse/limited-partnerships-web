import { PartnerKind, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  LIMITED_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";

import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/postTransition";

describe("Add Limited Partner Legal Entity Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  let companyProfile: { Id: string; data: Partial<CompanyProfile> };

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("Get Add Limited Partner Legal Entity Page", () => {

    it.each(
      [
        [PartnershipType.LP, "en", enTranslationText, true],
        [PartnershipType.SLP, "en", enTranslationText, true],
        [PartnershipType.PFLP, "en", enTranslationText, false],
        [PartnershipType.SPFLP, "en", enTranslationText, false],
        [PartnershipType.LP, "cy", cyTranslationText, true],
        [PartnershipType.SLP, "cy", cyTranslationText, true],
        [PartnershipType.PFLP, "cy", cyTranslationText, false],
        [PartnershipType.SPFLP, "cy", cyTranslationText, false]
      ]
    )("should load the add limited partner legal entity page for partnership type %s and language %s",
      async (
        partnershipType: PartnershipType,
        lang: string,
        i18n: any,
        expectCapitalContributionText: boolean
      ) => {
        companyProfile.data.subtype = partnershipType;

        setLocalesEnabled(true);
        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(
          `${i18n.addOrUpdatePartnerLegalEntityPage.limitedPartner.title}`
        );
        testTranslations(res.text, i18n.addOrUpdatePartnerLegalEntityPage, ["errorMessages", "generalPartner", "updateTitle", "dateEffectiveFrom", "capitalContribution"]);

        if (expectCapitalContributionText) {
          expect(res.text).toContain(i18n.capitalContribution.title);
        } else {
          expect(res.text).not.toContain(i18n.capitalContribution.title);
        }

        if (lang !== "cy") {
          expect(res.text).not.toContain("WELSH -");
        }

        expect(countOccurrences(res.text, i18n.serviceName.addLimitedPartner)).toBe(4);
      }
    );

    it("should contain a back link to the choice page when limited partners are not present", async () => {
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL) + "?lang=en");

      const BACK_LINK = getUrl(LIMITED_PARTNER_CHOICE_URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(BACK_LINK);
    });
  });

  describe("Post Add Limited Partner Legal Entity", () => {
    it("should send the limited partner legal entity details", async () => {
      const limitedPartner = new LimitedPartnerBuilder().isLegalEntity().build();

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addLimitedPartnerLegalEntity,
          ...limitedPartner.data
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

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { legal_entity_name: "Legal entity name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addLimitedPartnerLegalEntity,
        legal_entity_name: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("Legal entity name is invalid");
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
          ...limitedPartner.data
        });

      const REDIRECT_URL = getUrl(CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
