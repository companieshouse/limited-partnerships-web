import request from "supertest";
import app from "../app";

import {
  GeneralPartner,
  LimitedPartner,
  Jurisdiction,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CHECK_YOUR_ANSWERS_URL, REVIEW_LIMITED_PARTNERS_URL, REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL, WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL } from "../../../controller/registration/url";
import enGeneralTranslationText from "../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../locales/cy/address.json";
import enErrorMessages from "../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../locales/cy/errors.json";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import RegistrationPageType from "../../../controller/registration/PageType";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import PersonWithSignificantControlBuilder from "../../builder/PersonWithSignificantControlBuilder";
import TransactionPersonWithSignificantControl from "../../../../domain/entities/TransactionPersonWithSignificantControl";
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

describe("Check Your Answers Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText, ...enErrorMessages };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText, ...cyErrorMessages };

  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const PAYMENT_LINK_JOURNEY = "https://api-test-payments.chs.local:4001";

  let limitedPartnership: TransactionLimitedPartnership;
  let generalPartnerPerson: TransactionGeneralPartner;
  let generalPartnerLegalEntity: TransactionGeneralPartner;
  let limitedPartnerPerson: TransactionLimitedPartner;
  let limitedPartnerLegalEntity: TransactionLimitedPartner;

  beforeEach(() => {
    limitedPartnership = new LimitedPartnershipBuilder().build();

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

    appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([]);
  });

  describe("GET Check Your Answers Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the check your answers page with %s text", async (_description: string, lang: string, translationText: Record<string, any>) => {
      const langParam = lang === "en" ? "?lang=en" : "?lang=cy";

      setLocalesEnabled(true);
      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.checkYourAnswersPage, [
        "headingTerm",
        "jurisdictions",
        "headingSic",
        "dateEffectiveFrom",
        "warningMessage",
        "headingNumber",
        "submitFiling",
        "update",
        "ceaseDate",
        "warningMessageUpdate",
        "psc"
      ]);
      expect(res.text).toContain(translationText.termPage.byAgreement);
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
      expect(res.text).toContain("12345,67890");
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
      ["BY_AGREEMENT", enTranslationText.termPage.byAgreement],
      ["UNTIL_DISSOLUTION", enTranslationText.termPage.untilDissolution],
      ["NONE", enTranslationText.termPage.noTerm],
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
    [PartnershipType.LP, enTranslationText.types.LP],
    [PartnershipType.SLP, enTranslationText.types.SLP],
    [PartnershipType.PFLP, enTranslationText.types.PFLP],
    [PartnershipType.SPFLP, enTranslationText.types.SPFLP]
  ])("should show the partnership type", async (partnershipType: PartnershipType, text: string) => {
    const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);

    expect(res.text).toContain("partnership-type");
    expect(res.text).toContain(text);
  });

  it.each([
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("should load the %s check your answers page with partners", async (lang: string, translationText: Record<string, any>) => {
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

    checkIfValuesInText(res, generalPartnerPerson, translationText);

    checkIfValuesInText(res, generalPartnerLegalEntity, translationText);

    checkIfValuesInText(res, limitedPartnerPerson, translationText);

    checkIfValuesInText(res, limitedPartnerLegalEntity, translationText);

    expect(res.text).toContain(translationText.nationalities.british);
    expect(res.text).toContain(translationText.countries.unitedStates);
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
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should display No PSC statement with change link in %s when has_person_with_significant_control is false",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const limitedPartnership = new LimitedPartnershipBuilder()
          .withPartnershipType(PartnershipType.SLP)
          .withHasPersonWithSignificantControl(false)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.title);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.headingPscStatement);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.noPscStatement);
        expect(res.text).toContain("will-the-partnership-have-any-people-with-significant-control");
        expect(res.text).toContain("change-psc-statement-button");
      }
    );

    it("should not display PSC section when has_person_with_significant_control is not set", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.SLP).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.psc.title);
      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.psc.noPscStatement);
    });

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
        if (hasPersonWithSignificantControl) {
          const personWithSignificantControl = new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build();
          appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([personWithSignificantControl]);
        }
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
  });

  describe("PSC details on CYA page", () => {
    beforeEach(() => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.SLP)
        .withHasPersonWithSignificantControl(true)
        .build();
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
      appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
      appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    });

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should render the PSC section heading and change link in %s",
      async (_description: string, lang: string, translationText: Record<string, any>) => {
        setLocalesEnabled(true);

        const rle = new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build();
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([rle]);

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.title);
        expect(res.text).toContain(translationText.checkYourAnswersPage.psc.changeRemoveOrAdd);
        expect(res.text).toContain("review-persons-with-significant-control");
      }
    );

    const rleOnlyValues = () => {
      const rleData = new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build().data!;
      return [rleData.legal_entity_register_name, rleData.registered_company_number];
    };

    it.each([
      ["RELEVANT_LEGAL_ENTITY", () => new PersonWithSignificantControlBuilder().isRelevantLegalEntity().build(), true],
      [
        "OTHER_REGISTRABLE_PERSON",
        () => new PersonWithSignificantControlBuilder().isOtherRegistrablePerson().build(),
        false
      ]
    ])(
      "should render the correct detail rows for %s",
      async (
        _type: string,
        buildPsc: () => TransactionPersonWithSignificantControl,
        expectRleOnlyRows: boolean
      ) => {
        const psc = buildPsc();
        appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([psc]);

        const res = await request(app).get(URL);
        const { legal_entity_name, legal_form, governing_law } = psc.data!;

        expect(res.status).toBe(200);
        expect(res.text).toContain(legal_entity_name);
        expect(res.text).toContain(legal_form);
        expect(res.text).toContain(governing_law);

        rleOnlyValues().forEach((value) => {
          if (expectRleOnlyRows) {
            expect(res.text).toContain(value);
          } else {
            expect(res.text).not.toContain(value);
          }
        });
      }
    );

    it("should render both an RLE and an ORP when both are present", async () => {
      const rle = new PersonWithSignificantControlBuilder().withId("rle-id").isRelevantLegalEntity().build();
      const orp = new PersonWithSignificantControlBuilder().withId("orp-id").isOtherRegistrablePerson().build();
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([rle, orp]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(rle.data!.legal_entity_name);
      expect(res.text).toContain(orp.data!.legal_entity_name);
    });

    it("should render an ORP when legal_entity_registration_location is absent", async () => {
      const orp = new PersonWithSignificantControlBuilder().withId("orp-id").isOtherRegistrablePerson().build();
      delete orp.data!.legal_entity_registration_location;
      appDevDependencies.personWithSignificantControlGateway.feedPersonsWithSignificantControl([orp]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(orp.data!.legal_entity_name);
    });

    it("should show the no PSC statement when user answered yes but no PSCs have been added", async () => {
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.psc.title);
      expect(res.text).toContain(enTranslationText.checkYourAnswersPage.psc.noPscStatement);
      expect(res.text).not.toContain(enTranslationText.checkYourAnswersPage.psc.changeRemoveOrAdd);
    });
  });

  describe("POST Check Your Answers Page", () => {
    it("should send lawful purpose statement", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers,
        lawful_purpose_statement_checked: "true"
      });

      expect(
        appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0]?.data?.lawful_purpose_statement_checked
      ).toBe("true");
    });

    it("should navigate to next page", async () => {
      const res = await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers,
        lawful_purpose_statement_checked: "true"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${PAYMENT_LINK_JOURNEY}`);
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
      ["English", "en", enTranslationText, enErrorMessages],
      ["Welsh", "cy", cyTranslationText, cyErrorMessages]
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

    it("should not send data when lawful purpose statement is not ticked", async () => {
      await request(app).post(URL).send({
        pageType: RegistrationPageType.checkYourAnswers
      });

      expect(
        appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0]?.data?.lawful_purpose_statement_checked
      ).toBeUndefined();
    });
  });
});

const checkIfValuesInText = (
  res: request.Response,
  partner: GeneralPartner | LimitedPartner,
  translationText: Record<string, any>
) => {
  for (const key in partner.data) {
    if (typeof partner.data[key] === "string" || typeof partner.data[key] === "object") {
      if (key === "nationality1") {
        const capitalized = partner.data[key].charAt(0).toUpperCase() + partner.data[key].slice(1).toLowerCase();

        expect(res.text).toContain(capitalized);
      } else if (key.includes("date_of_birth") && partner.data[key]) {
        expect(res.text).toContain(formatDate(partner.data[key], translationText));
      } else if (key.includes("address")) {
        const capitalized = partner.data[key].address_line_1
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
        expect(res.text).toContain(capitalized);
      } else if (key.includes("contribution_sub_types")) {
        const capitalContributionSubTypesMap = {
          MONEY: translationText.capitalContribution.money,
          LAND_OR_PROPERTY: translationText.capitalContribution.landOrProperty,
          SHARES: translationText.capitalContribution.shares,
          SERVICES_OR_GOODS: translationText.capitalContribution.servicesOrGoods,
          ANY_OTHER_ASSET: translationText.capitalContribution.anyOtherAsset
        };

        const str = partner.data[key].map((word) => capitalContributionSubTypesMap[word]).join(" / ");
        expect(res.text).toContain(str.replaceAll("_", " "));
      } else {
        expect(res.text).toContain(partner.data[key]);
      }
    }
  }
};
