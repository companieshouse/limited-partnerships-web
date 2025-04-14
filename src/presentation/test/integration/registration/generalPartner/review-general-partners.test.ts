import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { REVIEW_GENERAL_PARTNERS_URL } from "../../../../controller/registration/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

describe("Review General Partners Page", () => {
  const URL = getUrl(REVIEW_GENERAL_PARTNERS_URL);

  const generalPartnerPerson = new GeneralPartnerBuilder().isPerson().build();
  const generalPartnerLegalEntity = new GeneralPartnerBuilder().isLegalEntity().build();

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);
  });

  it("should load the review general partners page with English text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.reviewGeneralPartnersPage.title} - ${enTranslationText.service} - GOV.UK`
    );

    testTranslations(res.text, enTranslationText.reviewGeneralPartnersPage);

    expect(res.text).toContain(`${generalPartnerPerson?.data?.forename} ${generalPartnerPerson?.data?.surname}`);
    expect(res.text).toContain(`${generalPartnerLegalEntity?.data?.legal_entity_name}`);
  });

  it("should load the review general partners page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.reviewGeneralPartnersPage.title} - ${cyTranslationText.service} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.reviewGeneralPartnersPage);
  });
});
