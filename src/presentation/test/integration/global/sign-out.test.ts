import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { SIGN_OUT_URL } from "../../../controller/global/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { ACCOUNTS_SIGN_OUT_URL, REGISTRATION_BASE_URL } from "../../../../config";
import { EMAIL_TEMPLATE } from "presentation/controller/registration/template";

describe("Sign out page", () => {
  const URL = getUrl(SIGN_OUT_URL);

  describe("GET sign out page", () => {
    it("should load the sign out page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");
      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.signOutPage);
    });

    it("should load the sign out page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.signOutPage);
    });
  });

  describe("POST sign out page", () => {
    it("should redirect to the CH search page when yes is selected", async () => {
      const previousPage = "";
      const res = await request(app).post(URL).send({
        sign_out: "yes",
        previousPage
      });
      expect(res.status).toEqual(302);
      expect(res.header.location).toEqual(ACCOUNTS_SIGN_OUT_URL);
    });

    it("should redirect to the specified previous page when no is selected", async () => {
      const previousPage = `${REGISTRATION_BASE_URL}/transaction/abc-123/submission/456-xyz/${EMAIL_TEMPLATE}`;
      const res = await request(app).post(URL).send({
        sign_out: "no",
        previousPage
      });
      expect(res.status).toEqual(302);
      expect(res.header.location).toEqual(previousPage);
    });
  });
});
