import LimitedPartnershipController from "../../controller/registration/LimitedPartnershipController";

// we have to create the spy before the real one is initialised when we import app
jest.spyOn(LimitedPartnershipController.prototype, "getPageRouting").mockImplementation(() => {
  return (req, res, next) => {
    return Promise.resolve().then(() => next(new Error("Mocked Error 500")));
  };
});

import request from "supertest";
import app from "./app";
import { PARTNERSHIP_TYPE_URL } from "presentation/controller/registration/url";
import enTranslationText from "../../../../locales/en/translations.json";

describe("Error 500", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 'error-page' page", async () => {
    const response = await request(app).get(PARTNERSHIP_TYPE_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(enTranslationText.errorPage.sorryMessage);
    expect(response.text).toContain(enTranslationText.links.back);
    expect(response.text).toContain(enTranslationText.links.signOut);
  });
});
