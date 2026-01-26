import { PartnerKind, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { ApiErrors } from "../../../../../domain/entities/UIErrors";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import {
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL
} from "../../../../controller/postTransition/url";
import {
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/postTransition";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { POST_TRANSITION_WITH_ID_URL } from "../../../../../config/constants";

describe("Add Limited Partner Person Page", () => {
  const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_URL);
  const REDIRECT_URL = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  let companyProfile: { Id: string; data: Partial<CompanyProfile> };

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  describe("Get Add Limited Partner Page", () => {

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
    )("should load the add limited partner person page for partnership type %s and language %s",
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
          `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
        );

        testTranslations(res.text, i18n.addPartnerPersonPage, ["errorMessages", "generalPartner"]);
        testTranslations(res.text, i18n.limitedPartnersPage, [
          "title",
          "pageInformation",
          "disqualificationStatement",
          "disqualificationStatementLegend"
        ]);

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
      const res = await request(app).get(getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL) + "?lang=en");

      const BACK_LINK = `${getUrl(POST_TRANSITION_WITH_ID_URL)}/${PostTransitionPageType.limitedPartnerType}`;

      expect(res.status).toBe(200);
      const regex = new RegExp(BACK_LINK);
      expect(res.text).toMatch(regex);
    });

    it("should contain the proposed name - data from api", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`
      );
    });

    it("should retrieve limited partner data from the api", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .withNotDisqualifiedStatementChecked(true)
        .withFormerNames("FORMER-NAMES")
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain("Joe");
      expect(res.text).toContain("Doe");
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain('<option value="British" selected>British</option>');
    });
  });

  describe("Post Add Limited Partner", () => {
    it.each(["true", "false"])("should send the Limited partner details", async (previousName) => {
      const limitedPartner = new LimitedPartnerBuilder()
        .isPerson()
        .withNotDisqualifiedStatementChecked(true)
        .withFormerNames("john")
        .build();

      if (previousName === "true") {
        if (limitedPartner.data) {
          limitedPartner.data.former_names = "john";
        }
      }

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addLimitedPartnerPerson,
          previousName: previousName,
          ...limitedPartner.data
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

      expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
      expect(appDevDependencies.transactionGateway.transactions[0].description).toBe("Add a limited partner (person)");

      expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(1);
      expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.kind).toEqual(
        PartnerKind.ADD_LIMITED_PARTNER_PERSON
      );
    });

    it("should return a validation error when invalid data is entered", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("limited partner name is invalid");
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS-FORENAME",
        surname: "SURNAME",
        former_names: "",
        previousName: "false",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previousNameNo" name="previousName" type="radio" value="false" checked');
      expect(res.text).toContain('<option value="Mongolian" selected>Mongolian</option>');
      expect(res.text).toContain('<option value="Uzbek" selected>Uzbek</option>');
    });

    it.each(["", "   ", undefined])(
      "should show error message if previous names is Yes but no previous name entered",
      async (formerNames: string | undefined) => {
        const res = await request(app).post(URL).send({
          pageType: PostTransitionPageType.addLimitedPartnerPerson,
          forename: "forename",
          surname: "SURNAME",
          former_names: formerNames,
          previousName: "true",
          "date_of_birth-Day": "01",
          "date_of_birth-Month": "11",
          "date_of_birth-Year": "1987",
          nationality1: "Mongolian",
          nationality2: "Uzbek",
          not_disqualified_statement_checked: "true"
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
        expect(res.text).toContain("Enter the previous name(s) of the limited partner");
      }
    );
  });

  describe("Patch from Add Limited Partner", () => {
    it("should send the limited partner details", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addLimitedPartnerPerson,
          ...limitedPartner.data
        });

      expect(res.status).toBe(302);
    });

    it("should return a validation error when invalid data is entered", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS"
      });
      expect(res.status).toBe(200);
      expect(res.text).toContain("limited partner name is invalid");
    });

    it("should send the limited partner details and go to confirm ura address page if already saved", async () => {
      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: PostTransitionPageType.addLimitedPartnerPerson,
          ...limitedPartner.data
        });

      const REDIRECT = getUrl(CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Found. Redirecting to ${REDIRECT}`);
    });

    it("should replay entered data when invalid data is entered and a validation error occurs", async () => {
      const URL = getUrl(ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL);

      const limitedPartner = new LimitedPartnerBuilder()
        .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
        .isPerson()
        .build();

      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

      const apiErrors: ApiErrors = {
        errors: { forename: "limited partner name is invalid" }
      };

      appDevDependencies.limitedPartnerGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.addLimitedPartnerPerson,
        forename: "INVALID-CHARACTERS-FORENAME",
        surname: "SURNAME",
        former_names: "FORMER-NAMES",
        previousName: "true",
        "date_of_birth-Day": "01",
        "date_of_birth-Month": "11",
        "date_of_birth-Year": "1987",
        nationality1: "Mongolian",
        nationality2: "Uzbek"
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("INVALID-CHARACTERS-FORENAME");
      expect(res.text).toContain("SURNAME");
      expect(res.text).toContain('id="previousNameYes" name="previousName" type="radio" value="true" checked');
      expect(res.text).toContain("FORMER-NAMES");
      expect(res.text).toContain("Mongolian");
      expect(res.text).toContain("Uzbek");
    });
  });
});
