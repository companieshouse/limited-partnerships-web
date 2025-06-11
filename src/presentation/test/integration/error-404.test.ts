import request from "supertest";

import app from "./app";
import { WHICH_TYPE_URL } from "presentation/controller/registration/url";
import enTranslationText from "../../../../locales/en/translations.json";

describe("Error pages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 'page-not-found' page", async () => {
    const response = await request(app).get(WHICH_TYPE_URL + "wrong-url");

    expect(response.status).toEqual(404);
    expect(response.text).toContain(enTranslationText.pageNotFound.title);
    expect(response.text).toContain(enTranslationText.links.back);
    expect(response.text).toContain(enTranslationText.links.signOut);
  });
});
