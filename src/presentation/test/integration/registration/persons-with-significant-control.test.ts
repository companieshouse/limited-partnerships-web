import request from "supertest";

import enGeneralTranslationText from "../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../locales/cy/translations.json";
import enPersonWithSignificantControlTranslationText from "../../../../../locales/en/personWithSignificantControl.json";
import cyPersonWithSignificantControlTranslationText from "../../../../../locales/cy/personWithSignificantControl.json";

import app from "../app";
import { TELL_US_ABOUT_PSC_URL, WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL } from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

describe("Tell Us About PSC Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enPersonWithSignificantControlTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyPersonWithSignificantControlTranslationText };
  const URL = getUrl(TELL_US_ABOUT_PSC_URL);
  const REDIRECT_URL = getUrl(WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL);
  let limitedPartnership: LimitedPartnership;

  beforeEach(() => {
    setLocalesEnabled(true);

    limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  it.each(["en", "cy"])("should load the Tell Us About PSC page with %s text", async (lang: string) => {
    const translationText = lang === "en" ? enTranslationText : cyTranslationText;

    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${translationText.personWithSignificantControl.tellUsAboutPscPage.title} - ${translationText.serviceRegistration} - GOV.UK`
    );
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
    );
    expect(res.text).toContain(REDIRECT_URL);
    testTranslations(res.text, translationText.personWithSignificantControl.tellUsAboutPscPage);
  });
});
