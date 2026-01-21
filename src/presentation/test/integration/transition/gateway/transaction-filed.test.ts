import request from "supertest";
import { createApiClient } from "@companieshouse/api-sdk-node";

import enTranslationText from "../../../../../../locales/en/translations.json";

import appRealDependencies from "../../../../../app";

import { CONFIRM_LIMITED_PARTNERSHIP_URL, TRANSITION_ALREADY_FILED_URL } from "../../../../controller/transition/url";
import { NAME_URL } from "../../../../controller/registration/url";

import { getUrl } from "../../../utils";

import sdkMock from "../../mock/sdkMock";
import FilingHistoryBuilder from "../../../builder/FilingHistoryBuilder";

jest.mock("@companieshouse/api-sdk-node");

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue(sdkMock);

describe("Transition already filed - real gateway", () => {
  it(`should redirect to transition-already-filed url - form LPTS01`, async () => {
    const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

    const res = await request(appRealDependencies).get(URL);

    const REDIRECT_URL = getUrl(TRANSITION_ALREADY_FILED_URL);

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
  });

  it(`should not redirect to transition-already-filed url if the form is LP6D`, async () => {
    mockCreateApiClient.mockReturnValue({
      ...sdkMock,
      companyFilingHistory: {
        ...sdkMock.companyFilingHistory,
        getCompanyFilingHistory: () => ({
          httpStatusCode: 200,
          resource: {
            filing_history_status: "filing-history-available-limited-partnership-from-2014",
            items: [new FilingHistoryBuilder().withType("LP6D").build()],
            items_per_page: 25,
            start_index: 0,
            total_count: 1
          }
        })
      }
    });

    const URL = getUrl(CONFIRM_LIMITED_PARTNERSHIP_URL);

    const res = await request(appRealDependencies).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.confirmLimitedPartnership.title);
  });

  it("should not redirect to transition-already-filed url if it is not transiton journey", async () => {
    const res = await request(appRealDependencies).get(NAME_URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.namePage.nameEnding);
  });
});
