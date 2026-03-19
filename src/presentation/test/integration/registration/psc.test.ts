import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { PSC_URL, WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL } from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("PSC Page", () => {
  const URL = getUrl(PSC_URL);
  const REDIRECT_URL = getUrl(WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL);
  let limitedPartnership;

  beforeEach(() => {
    setLocalesEnabled(true);

    limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  it.each([
    "en",
    "cy"
  ])("should load the PSC page with Welsh text", async (lang: string) => {
    const translationText = lang === "en" ? enTranslationText : cyTranslationText;

    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${translationText.pscPage.title} - ${translationText.serviceRegistration} - GOV.UK`
    );
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
    );
    expect(res.text).toContain(REDIRECT_URL);
    testTranslations(res.text, translationText.pscPage);
  });
});
