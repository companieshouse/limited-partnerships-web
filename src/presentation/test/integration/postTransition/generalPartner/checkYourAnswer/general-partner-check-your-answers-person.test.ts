import request from "supertest";
import app from "../../../app";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import GeneralPartnerBuilder from "../../../../builder/GeneralPartnerBuilder";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import { ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL, GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL } from "../../../../../controller/postTransition/url";
import { checkIfPartnerValuesInText, countOccurrences, getUrl, checkYourAnswersPersonKeys, setLocalesEnabled, expectChangeLinks } from "../../../../utils";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL, CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL, ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL, ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../../controller/addressLookUp/url/postTransition";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../../controller/global/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import TransactionGeneralPartner from "../../../../../../domain/entities/TransactionGeneralPartner";
import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";

describe("General Partner Check Your Answers Page", () => {
  const URL = getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);
  const REDIRECT_URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let generalPartnerPerson: TransactionGeneralPartner;

  beforeEach(() => {
    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    generalPartnerPerson = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withFormerNames("Joe Dee")
      .withDateEffectiveFrom("2024-10-10")
      .withNationality1("Welsh")
      .withKind(PartnerKind.ADD_GENERAL_PARTNER_PERSON)
      .build();
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_GENERAL_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  it.each([
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("should GET Check Your Answers Page %s text", async (lang, translationText) => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);

    expect(res.text).toContain(translationText.checkYourAnswersPage.update.title);
    expect(res.text).toContain(translationText.print.buttonText);
    expect(res.text).toContain(translationText.print.buttonTextNoJs);
    expect(res.text).toContain(translationText.nationalities.welsh);
    if (lang === "cy") {
      expect(res.text).toContain("WELSH -");
    } else {
      expect(res.text).not.toContain("WELSH -");
    }
    expect(countOccurrences(res.text, translationText.serviceName.addGeneralPartner)).toBe(2);
    expect(res.text).toContain(`data-event-id="check-your-answers-add-general-partner-submit-button"`);
  });

  it.each([
    [URL + "?lang=en", "/limited-partnerships/sign-out?lang=en"],
    [URL + "?lang=cy", "/limited-partnerships/sign-out?lang=cy"],
    [URL, "/limited-partnerships/sign-out"]
  ])(
    "should set the signout link href correctly for url: %s",
    async (testUrl: string, expectedHref: string) => {
      setLocalesEnabled(true);
      const res = await request(app).get(testUrl);

      expect(res.status).toBe(200);
      expect(res.text).toContain(expectedHref);
    }
  );

  it("Should contain a back link to the confirm correspondence address page", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).not.toContain(getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL));
    expect(res.text).toContain(getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL));
  });

  it("should load the check your answers page with partners - EN", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    checkIfPartnerValuesInText(res.text, generalPartnerPerson.data!, checkYourAnswersPersonKeys, enTranslationText);
  });

  it("should contain change links for general partner details", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);

    expectChangeLinks(res.text, [
      `${ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL}#forename`,
      `${ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL}#former_names`,
      `${ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL}#nationality1`,
      `${ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL}#date_of_birth-day`,
      `${ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL}#date_effective_from-day`,
      ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
    ]);
  });

  describe("POST Check Your Answers Page", () => {
    it("should navigate to next page", async () => {
      generalPartnerPerson = new GeneralPartnerBuilder()
        .isPerson()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .withDateEffectiveFrom("2024-10-10")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.generalPartnerCheckYourAnswers
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });
});
