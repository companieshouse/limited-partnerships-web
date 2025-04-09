import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import appRealDependencies from "../../../../../app";
import {
  APPLICATION_SUBMITTED_URL,
  CHECK_YOUR_ANSWERS_URL
} from "../../../../controller/registration/url";
import RegistrationPageType from "../../../../controller/registration/PageType";
import sdkMock, {
  putTransaction
} from "../../mock/sdkMock";
import { getUrl } from "../../../utils";
import enTranslationText from "../../../../../../locales/en/translations.json";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

jest.mock("../../../../../infrastructure/repository/CacheRepository");

describe("Transaction Gateway Update tests for the 'Check Your Answers' page", () => {
  const URL = getUrl(CHECK_YOUR_ANSWERS_URL);
  const REDIRECT_URL = getUrl(APPLICATION_SUBMITTED_URL);

  beforeEach(() => {
    mockCreateApiClient.mockReturnValue(sdkMock);
  });

  it("should update the transaction in order to close it", async () => {
    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.checkYourAnswers
    });

    expect(putTransaction).toHaveBeenCalled();
    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
  });

  it("should load the error page if transaction update fails", async () => {
    mockCreateApiClient.mockReturnValue({
      ...sdkMock,
      transaction: {
        ...sdkMock.transaction,
        putTransaction: () => ({
          httpStatusCode: 422,
          resource: {}
        })
      }
    });

    const res = await request(appRealDependencies).post(URL).send({
      pageType: RegistrationPageType.checkYourAnswers
    });

    expect(res.status).toBe(500);
    expect(res.text).toContain(enTranslationText.errorPage.title);
  });
});
