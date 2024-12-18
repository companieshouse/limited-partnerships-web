import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import appRealDependencies from "../../../../app";
import {
  NAME_URL,
  WHICH_TYPE_URL,
} from "../../../controller/registration/Routing";
import RegistrationPageType from "../../../controller/registration/PageType";
import enTranslationText from "../../../../../locales/en/translations.json";

jest.mock("../../../../infrastructure/repository/CacheRepository", () => {
  return jest.fn().mockImplementation(() => {
    return {
      ...jest.requireActual(
        "../../../../infrastructure/repository/CacheRepository"
      ),
      getData: jest.fn().mockImplementation(() => ({
        [RegistrationPageType.whichType]: PartnershipType.LP,
      })),
      addData: jest.fn().mockImplementation(() => {}),
    };
  });
});

describe("Cache", () => {
  it("should redirect to name page", async () => {
    const postTypeResponse = await request(appRealDependencies)
      .post(WHICH_TYPE_URL)
      .send({
        pageType: RegistrationPageType.whichType,
        parameter: PartnershipType.LP,
      });

    expect(postTypeResponse.status).toBe(302);
    expect(postTypeResponse.text).toContain(`Redirecting to ${NAME_URL}`);

    const getNamePageResponse = await request(appRealDependencies).get(
      NAME_URL
    );

    expect(getNamePageResponse.status).toBe(200);
    expect(getNamePageResponse.text).toContain(
      enTranslationText.namePage.title
    );
    expect(getNamePageResponse.text).toContain(
      enTranslationText.namePage.whatIsName
    );
    expect(getNamePageResponse.text).toContain(
      enTranslationText.namePage.nameEnding
    );
    expect(getNamePageResponse.text).toContain(
      enTranslationText.buttons.saveAndContinue
    );
  });
});
