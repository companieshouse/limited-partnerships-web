import request from "supertest";
import app from "../app";

import {
  Jurisdiction,
  NatureOfControlType,
  PartnershipType,
  PersonWithSignificantControlType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CHECK_YOUR_ANSWERS_URL, REVIEW_LIMITED_PARTNERS_URL, REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL, WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL } from "../../../controller/registration/url";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { checkIfPartnerValuesInText, contributionKeys, getUrl, checkYourAnswersLegalEntityKeys, checkYourAnswersPersonKeys, setLocalesEnabled, testTranslations, countOccurrences } from "../../utils";
import RegistrationPageType from "../../../controller/registration/PageType";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import PersonWithSignificantControlBuilder from "../../builder/PersonWithSignificantControlBuilder";
import { formatDate } from "../../../../utils/date-format";
import {
  EMAIL_TEMPLATE,
  NAME_TEMPLATE,
  TERM_TEMPLATE,
  WHERE_IS_THE_JURISDICTION_TEMPLATE,
  PARTNERSHIP_TYPE_TEMPLATE
} from "../../../../presentation/controller/registration/template";
import {
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE,
  ENTER_REGISTERED_OFFICE_ADDRESS_TEMPLATE
} from "../../../../presentation/controller/addressLookUp/template";
import TransactionLimitedPartner from "../../../../domain/entities/TransactionLimitedPartner";
import TransactionGeneralPartner from "../../../../domain/entities/TransactionGeneralPartner";
import TransactionLimitedPartnership from "../../../../domain/entities/TransactionLimitedPartnership";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

describe("Check Your Answers Page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const PAYMENT_LINK_JOURNEY = "https://api-test-payments.chs.local:4001";

  let limitedPartnership: TransactionLimitedPartnership;
  let generalPartnerPerson: TransactionGeneralPartner;
  let generalPartnerLegalEntity: TransactionGeneralPartner;
  let limitedPartnerPerson: TransactionLimitedPartner;
  let limitedPartnerLegalEntity: TransactionLimitedPartner;

  const individualNatureOfControl = {
    type: NatureOfControlType.INDIVIDUAL,
    share_of_assets_25_to_50: true,
    voting_rights_25_to_50: true
  };

  const rle = new PersonWithSignificantControlBuilder()
    .withId("rle-id")
    .isRelevantLegalEntity()
    .withLegalEntityName("PSC_ORDER_RLE")
    .withNatureOfControlTypes([NatureOfControlType.INDIVIDUAL])
    .withNaturesOfControl([individualNatureOfControl])
    .build();
  const orp = new PersonWithSignificantControlBuilder()
    .withId("orp-id")
    .isOtherRegistrablePerson()
    .withLegalEntityName("PSC_ORDER_ORP")
    .withNatureOfControlTypes([NatureOfControlType.INDIVIDUAL])
    .withNaturesOfControl([individualNatureOfControl])
    .build();
  const individual = new PersonWithSignificantControlBuilder()
    .withId("individual-id")
    .isIndividualPerson()
    .withForename("PSC_ORDER_INDIVIDUAL")
    .withNatureOfControlTypes([NatureOfControlType.INDIVIDUAL])
    .withNaturesOfControl([individualNatureOfControl])
    .build();
  const protectedIndividual = new PersonWithSignificantControlBuilder()
    .withId("protected-individual-id")
    .withType(PersonWithSignificantControlType.PROTECTED_INDIVIDUAL_PERSON)
    .build();

  beforeEach(() => {
    limitedPartnership = new LimitedPartnershipBuilder()
      .withHasPersonWithSignificantControl(true)
      .withPartnershipType(PartnershipType.SLP)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    generalPartnerPerson = new GeneralPartnerBuilder().isPerson().withFormerNames("Joe Dee").build();
    generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

    limitedPartnerPerson = new LimitedPartnerBuilder()
      .isPerson()
      .withContributionCurrencyType("GBP")
      .withContributionCurrencyValue("5.00")
      .withContributionSubtypes(["SHARES", "ANY_OTHER_ASSET"])
      .withFormerNames("Joe Dee")
      .build();

    limitedPartnerLegalEntity = new LimitedPartnerBuilder()
      .isLegalEntity()
      .withContributionCurrencyType("GBP")
      .withContributionCurrencyValue("5.00")
      .withContributionSubtypes(["SHARES", "ANY_OTHER_ASSET"])
      .build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
      rle,
      protectedIndividual,
      individual,
      orp
    ]);
  });

  describe("GET Check Your Answers Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the check your answers page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const langParam = lang === "en" ? "?lang=en" : "?lang=cy";

      setLocalesEnabled(true);
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.LP).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.checkYourAnswersPage, [
        "dateEffectiveFrom",
        "jurisdictions",
        "warningMessage",
        "headingNumber",
        "submitFiling",
        "update",
        "ceaseDate",
        "warningMessageUpdate",
        "psc"
      ]);
      expect(res.text).toContain(translationText.partnership.termPage.byAgreement);
      expect(res.text).toContain(translationText.print.buttonText);
      expect(res.text).toContain(translationText.print.buttonTextNoJs);

      //  change links should retain the lang query parameter
      expect(res.text).toContain(`${NAME_TEMPLATE}${langParam}`);
      expect(res.text).toContain(`${PARTNERSHIP_TYPE_TEMPLATE}${langParam}`);
      expect(res.text).toContain(`${EMAIL_TEMPLATE}${langParam}`);
      expect(res.text).toContain(`${WHERE_IS_THE_JURISDICTION_TEMPLATE}${langParam}`);
      expect(res.text).toContain(`${ENTER_REGISTERED_OFFICE_ADDRESS_TEMPLATE}${langParam}`);
      expect(res.text).toContain(`${ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE}${langParam}`);
      expect(res.text).toContain(`${TERM_TEMPLATE}${langParam}`);
    });

    it.each([
      [URL + "?lang=en", "/limited-partnerships/sign-out?lang=en"],
      [URL + "?lang=cy", "/limited-partnerships/sign-out?lang=cy"],
      [URL, "/limited-partnerships/sign-out"]
    ])("should set the signout link href correctly for url: %s", async (testUrl: string, expectedHref: string) => {
      setLocalesEnabled(true);
      const res = await request(app).get(testUrl);

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedHref);
    });

    it("should load the check your answers page with data from api and show change links", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.LP).withSicCodes(["10110", "46711"]).build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(limitedPartnership?.data?.partnership_name?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.name_ending?.toUpperCase());
      expect(res.text).toContain(limitedPartnership?.data?.email);
      expect(res.text).toContain("4 Line 1, Line 2, Stoke-On-Trent, Region, England, ST6 3LJ");
      expect(res.text).toContain("enter-registered-office-address#premises");
      expect(res.text).toContain("2 Line 3, Line 4, Burton-On-Trent, Regionpp, England, DE6 3LJ");
      expect(res.text).toContain("enter-principal-place-of-business#premises");
      expect(res.text).toContain("Such term as decided by the partners within the partnership agreement");
      expect(res.text).toContain(`10110 - ${enTranslationText.sicCodes.condensedSicCodes["10110"]}`);
      expect(res.text).toContain(`46711 - ${enTranslationText.sicCodes.condensedSicCodes["46711"]}`);
      expect(res.text).toContain("name#partnership_name");
      expect(res.text).toContain("registered-email-address#email");
      expect(res.text).toContain("jurisdiction#jurisdiction");
      expect(res.text).toContain("term#term");
      expect(res.text).toContain("standard-industrial-classification-code#sic1");
    });

    it.each([
      [PartnershipType.LP, true],
      [PartnershipType.SLP, false],
      [PartnershipType.PFLP, true],
      [PartnershipType.SPFLP, false]
    ])(
      "should show a change link for jurisdiction based on the partnership type",
      async (partnershipType: PartnershipType, changeLinkExpected: boolean) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        if (changeLinkExpected) {
          expect(res.text).toContain("jurisdiction#jurisdiction");
        } else {
          expect(res.text).not.toContain("jurisdiction#jurisdiction");
        }
      }
    );

    it.each([
      [PartnershipType.LP, true],
      [PartnershipType.SLP, true],
      [PartnershipType.PFLP, false],
      [PartnershipType.SPFLP, false]
    ])(
      "should show the captial contribution fields based on the partnership type",
      async (partnershipType: PartnershipType, capitalContributionHeadingExpected: boolean) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        if (capitalContributionHeadingExpected) {
          expect(res.text).toContain(
            enTranslationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution
          );
        } else {
          expect(res.text).not.toContain(
            enTranslationText.checkYourAnswersPage.partners.limitedPartners.capitalContribution
          );
        }
      }
    );

    it.each([
      [Jurisdiction.ENGLAND_AND_WALES, enTranslationText.checkYourAnswersPage.jurisdictions.englandAndWales],
      [Jurisdiction.NORTHERN_IRELAND, enTranslationText.checkYourAnswersPage.jurisdictions.northernIreland],
      [Jurisdiction.SCOTLAND, enTranslationText.checkYourAnswersPage.jurisdictions.scotland]
    ])(
      "should show correct jurisdiction text based on jurisdiction",
      async (jurisdiction: Jurisdiction, jurisdictionTextExpected: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(jurisdiction).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        expect(res.text).toContain(jurisdictionTextExpected);
      }
    );

    it.each([
      [PartnershipType.LP, true],
      [PartnershipType.SLP, true],
      [PartnershipType.PFLP, false],
      [PartnershipType.SPFLP, false]
    ])(
      "should show term, SIC codes and change links based on the partnership type",
      async (partnershipType: PartnershipType, headingsAndChangeLinksExpected: boolean) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);

        if (headingsAndChangeLinksExpected) {
          expect(res.text).toContain("term#term");
          expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingTerm);
          expect(res.text).toContain("standard-industrial-classification-code#sic1");
          expect(res.text).toContain(enTranslationText.checkYourAnswersPage.headingSic);
        } else {
          expect(res.text).not.toContain("term#term");
          expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.headingTerm);
          expect(res.text).not.toContain("standard-industrial-classification-code#sic1");
          expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.headingSic);
        }
      }
    );

    it.each([
      ["BY_AGREEMENT", enTranslationText.partnership.termPage.byAgreement],
      ["UNTIL_DISSOLUTION", enTranslationText.partnership.termPage.untilDissolution],
      ["NONE", enTranslationText.partnership.termPage.noTerm],
      ["TERM_NOT_MATCHED", ""]
    ])(
      "should show the correct text for term based on term selected",
      async (termKey: any, expectedTermText: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withTerm(termKey).build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedTermText);
      }
    );
  });

  it.each([
    [PartnershipType.LP, enTranslationText.partnership.types.LP],
    [PartnershipType.SLP, enTranslationText.partnership.types.SLP],
    [PartnershipType.PFLP, enTranslationText.partnership.types.PFLP],
    [PartnershipType.SPFLP, enTranslationText.partnership.types.SPFLP]
  ])("should show the partnership type", async (partnershipType: PartnershipType, text: string) => {
    const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);

    expect(res.text).toContain("partnership-type");
    expect(res.text).toContain(text);
  });

  it.each([
    ["en", enTranslationText, { countries: enTranslationText.countries }],
    ["cy", cyTranslationText, { countries: cyTranslationText.countries }]
  ])("should load the %s check your answers page with partners", async (lang: string, translationText: Record<string, any>, countriesText: Record<string, any>) => {
    setLocalesEnabled(true);

    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);

    testTranslations(res.text, translationText.checkYourAnswersPage, [
      "scotland",
      "northernIreland",
      "dateEffectiveFrom",
      "warningMessage",
      "headingNumber",
      "submitFiling",
      "update",
      "ceaseDate",
      "warningMessageUpdate",
      "psc"
    ]);

    checkIfPartnerValuesInText(res.text, generalPartnerPerson.data!, checkYourAnswersPersonKeys, translationText);

    checkIfPartnerValuesInText(res.text, generalPartnerLegalEntity.data!, checkYourAnswersLegalEntityKeys, translationText);

    checkIfPartnerValuesInText(res.text, limitedPartnerPerson.data!, limitedPersonKeys, translationText);

    checkIfPartnerValuesInText(res.text, limitedPartnerLegalEntity.data!, limitedLegalEntityKeys, translationText);

    expect(res.text).toContain(translationText.nationalities.british);
    expect(res.text).toContain(countriesText.countries.unitedStates);
  });

  it("should load the check your answers page with capital contribution data for limited partner person", async () => {
    const limitedPartnerPerson = new LimitedPartnerBuilder()
      .isPerson()
      .withFormerNames("Joe Dee")
      .withContributionCurrencyType("GBP")
      .withContributionCurrencyValue("5.00")
      .withContributionSubtypes(["MONEY", "SERVICES_OR_GOODS", "LAND_OR_PROPERTY"])
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain("5.00 Pound Sterling (GBP)");
    expect(res.text).toContain("Money / Services or goods / Land or property");
  });

  it("should load the check your answers page with capital contribution data for limited partner legal entity", async () => {
    const limitedPartnerLegalEntity = new LimitedPartnerBuilder()
      .isLegalEntity()
      .withContributionCurrencyType("GBP")
      .withContributionCurrencyValue("5.00")
      .withContributionSubtypes(["SHARES", "ANY_OTHER_ASSET"])
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain("5.00 Pound Sterling (GBP)");
    expect(res.text).toContain("Shares or interests in other partnerships / Any other asset");
  });

  it("should load the check your answers page with capital contribution data in Welsh", async () => {
    const limitedPartnerLegalEntity = new LimitedPartnerBuilder()
      .isLegalEntity()
      .withContributionCurrencyType("GBP")
      .withContributionCurrencyValue("5.00")
      .withContributionSubtypes(["SHARES", "ANY_OTHER_ASSET"])
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerLegalEntity]);

    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain("5.00 WELSH - Pound Sterling (GBP)");
    expect(res.text).toContain("WELSH - Shares or interests in other partnerships / WELSH - Any other asset");
  });

  describe("PSC statement on CYA page", () => {
    it.each([
      [PartnershipType.LP],
      [PartnershipType.PFLP]
    ])(
      "should not display PSC section for non-Scottish partnership type %s even when has_person_with_significant_control is set",
      async (partnershipType: PartnershipType) => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withPartnershipType(partnershipType)
          .withHasPersonWithSignificantControl(false)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.psc.title);
        expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.psc.noPscStatement);
        expect(res.text).not.toContain("change-psc-statement-button");
      }
    );

    it.each([
      [PartnershipType.SLP, true, getUrl(REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL)],
      [PartnershipType.SPFLP, true, getUrl(REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL)],
      [PartnershipType.SLP, false, getUrl(WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL)],
      [PartnershipType.SPFLP, false, getUrl(WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL)],
      [PartnershipType.LP, false, getUrl(REVIEW_LIMITED_PARTNERS_URL)],
      [PartnershipType.PFLP, false, getUrl(REVIEW_LIMITED_PARTNERS_URL)]
    ])(
      "should set the back link correctly for partnership type %s when has_person_with_significant_control is %s",
      async (partnershipType: PartnershipType, hasPersonWithSignificantControl: boolean, expectedBackLinkPageType: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withPartnershipType(partnershipType)
          .withHasPersonWithSignificantControl(hasPersonWithSignificantControl)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain(`href="${expectedBackLinkPageType}" class="govuk-back-link"`);
      }
    );

    it.each([
      ["with Psc's", true, enTranslationText.checkYourAnswersPage.psc.yesPscStatement],
      ["without Psc's", false, enTranslationText.checkYourAnswersPage.psc.noPscStatement]
    ])("should render the yes PSC statement when answered yes and no PSC statement with change link when answered no", async (_description: string, hasPsc: boolean, expectedPscStatement: string) => {

      if (!hasPsc) {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withPartnershipType(PartnershipType.SLP)
          .withHasPersonWithSignificantControl(false)
          .build();
        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
      }

      const res = await request(app).get(URL);

      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.psc.headingPscStatement);
      expect(res.text).toContain(expectedPscStatement);
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.psc.title);

      if (hasPsc){
        expect(res.text).not.toContain("will-the-partnership-have-any-people-with-significant-control");
        expect(res.text).toContain(enTranslationText.checkYourAnswersPage.psc.changeRemoveOrAdd);
        expect(res.text).toContain("review-persons-with-significant-control");
      } else {
        expect(res.text).toContain("will-the-partnership-have-any-people-with-significant-control");
      }
    });
  });

  describe("PSC details on CYA page", () => {
    it("should render the correct number of register rows for GP LP and RLE and none for ORP", async () => {

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(countOccurrences(res.text, enTranslationText.checkYourAnswersPage.partners.legalEntity.legalForm)).toBe(4);
      expect(countOccurrences(res.text, enTranslationText.checkYourAnswersPage.partners.legalEntity.governingLaw)).toBe(4);
      expect(countOccurrences(res.text, "register-row")).toBe(3);
      expect(countOccurrences(res.text, "registration-number-row")).toBe(3);
    }
    );

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should render the Protected Individual Person correctly in %s",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.protectedPersonName);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.protectedPersonDescription);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.protectedPersonDescriptionHint);
      }
    );

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should render the Individual Person PSC correctly in %s",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.personTitle);
        expect(res.text).not.toContain(
          translationText.personWithSignificantControl.addPersonWithSignificantControl.addIndividualPerson.personTitle
        );
        expect(res.text).toContain(individual.data?.title);
        expect(res.text).toContain(individual.data?.forename);
        expect(res.text).toContain(individual.data?.middle_names);
        expect(res.text).toContain(individual.data?.surname);
        expect(res.text).toContain(formatDate(individual.data?.date_of_birth as string, translationText));
        expect(res.text).toContain(individual.data?.nationality1);
        expect(res.text).toContain(individual.data?.nationality2);
      }
    );

    it("should render the PSCs in the correct order - PSC Type", async () => {
      const protectedLabel = enTranslationText.checkYourAnswersPage.psc.protectedPersonName;

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      const protectedIndex = res.text.indexOf(protectedLabel);
      const rleIndex = res.text.indexOf(rle.data?.legal_entity_name as string);
      const orpIndex = res.text.indexOf(orp.data?.legal_entity_name as string);
      const individualIndex = res.text.indexOf(individual.data?.forename as string);

      expect(protectedIndex).toBeGreaterThan(-1);
      expect(rleIndex).toBeGreaterThan(-1);
      expect(orpIndex).toBeGreaterThan(-1);
      expect(individualIndex).toBeGreaterThan(-1);

      expect(protectedIndex).toBeLessThan(individualIndex);
      expect(protectedIndex).toBeLessThan(rleIndex);
      expect(protectedIndex).toBeLessThan(orpIndex);
      expect(individualIndex).toBeLessThan(orpIndex);
      expect(rleIndex).toBeLessThan(orpIndex);
    });

    it("should render the PSCs in the correct order - Nature of Control", async () => {
      const firmNatureOfControl = {
        type: NatureOfControlType.FIRM,
        share_of_assets_25_to_50: true,
        voting_rights_25_to_50: true
      };
      const trustNatureOfControl = {
        type: NatureOfControlType.TRUST,
        share_of_assets_25_to_50: true,
        voting_rights_25_to_50: true
      };

      const individualThroughFirm = new PersonWithSignificantControlBuilder()
        .withId("individual-firm-id")
        .isIndividualPerson()
        .withForename("PSC_ORDER_FIRM")
        .withNatureOfControlTypes([NatureOfControlType.FIRM])
        .withNaturesOfControl([firmNatureOfControl])
        .build();
      const individualThroughTrust = new PersonWithSignificantControlBuilder()
        .withId("individual-trust-id")
        .isIndividualPerson()
        .withForename("PSC_ORDER_TRUST")
        .withNatureOfControlTypes([NatureOfControlType.TRUST])
        .withNaturesOfControl([trustNatureOfControl])
        .build();

      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([
        individual,
        individualThroughTrust,
        individualThroughFirm
      ]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);

      const individualIndex = res.text.indexOf(individual.data?.forename as string);
      const firmIndex = res.text.indexOf(individualThroughFirm.data?.forename as string);
      const trustIndex = res.text.indexOf(individualThroughTrust.data?.forename as string);

      expect(individualIndex).toBeGreaterThan(-1);
      expect(firmIndex).toBeGreaterThan(-1);
      expect(trustIndex).toBeGreaterThan(-1);

      expect(individualIndex).toBeLessThan(firmIndex);
      expect(firmIndex).toBeLessThan(trustIndex);
    });
  });

  describe("POST Check Your Answers Page", () => {
    it("should send lawful purpose statement and redirect to next page", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers,
        lawful_purpose_statement_checked: "true"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
      expect(
        appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0]?.data?.lawful_purpose_statement_checked
      ).toBe("true");
    });

    it("should throw error when payment redirect url is missing", async () => {
      // call transaction gateway and ovverride so there is no payment header
      appDevDependencies.paymentGateway.feedPaymentWithEmptyJourney();
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers,
        lawful_purpose_statement_checked: "true"
      });

      expect(res.status).toBe(500);
      expect(res.text).not.toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
    });

    it.each([
      ["English", "en", enTranslationText, enTranslationText],
      ["Welsh", "cy", cyTranslationText, cyTranslationText]
    ])(
      "should re-render the CYA page with an error summary in %s when lawful purpose statement is not ticked",
      async (
        _description: string,
        lang: string,
        translationText: Record<string, any>,
        errorMessages: Record<string, any>
      ) => {
        setLocalesEnabled(true);

        const res = await request(app)
          .post(URL + `?lang=${lang}`)
          .send({
            pageType: RegistrationPageType.checkYourAnswers
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(errorMessages.errorMessages.checkYourAnswers.lawfulPurposeRequired);
        expect(res.text).toContain('href="#lawful_purpose_statement_checked"');
        expect(res.text).toContain(translationText.govUk.error.title);
      }
    );
  });
});

const limitedPersonKeys = [...checkYourAnswersPersonKeys, ...contributionKeys];
const limitedLegalEntityKeys = [...checkYourAnswersLegalEntityKeys, ...contributionKeys];
