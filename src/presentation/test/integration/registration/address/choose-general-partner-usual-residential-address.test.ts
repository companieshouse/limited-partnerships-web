import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
    CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "presentation/controller/addressLookUp/url";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
 

describe("GET ", () => {

   const URL = getUrl(CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

   it("should load the choose usual residential address of the general partner page with Welsh text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    testTranslations(res.text, cyTranslationText.address.chooseAddress.generalPartnerUsualResidentialAddress);
  });
  it("should load the choose usual residential address of the general partner page with English text", async () => {
    setLocalesEnabled(true);

    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    testTranslations(res.text, enTranslationText.address.chooseAddress.generalPartnerUsualResidentialAddress);
  });
 });
