import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import RegistrationPageType from "../../../controller/registration/PageType";

describe("Update Submission", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  it("should send data an update the limited partnership", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.registrationGateway.submissionId)
      .build();

    appDevDependencies.registrationGateway.feedLimitedPartnerships([
      limitedPartnership,
    ]);

    await appDevDependencies.registrationService.sendPageData(
      { access_token: "access_token", refresh_token: "refresh_token" },
      appDevDependencies.registrationGateway.transactionId,
      limitedPartnership["_id"] as string,
      RegistrationPageType.email,
      {
        email: "email@example.com",
      }
    );

    expect(
      appDevDependencies.registrationGateway.limitedPartnerships[0]
    ).toEqual({
      ...limitedPartnership,
      data: { ...limitedPartnership.data, email: "email@example.com" },
    });
  });

  it("should return an error if no data are send", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.registrationGateway.submissionId)
      .build();

    appDevDependencies.registrationGateway.feedLimitedPartnerships([
      limitedPartnership,
    ]);

    const result = await appDevDependencies.registrationService.sendPageData(
      { access_token: "access_token", refresh_token: "refresh_token" },
      appDevDependencies.registrationGateway.transactionId,
      limitedPartnership["_id"] as string,
      RegistrationPageType.email,
      {}
    );

    expect(
      appDevDependencies.registrationGateway.limitedPartnerships[0]
    ).not.toEqual({
      ...limitedPartnership,
      data: { ...limitedPartnership.data, email: "email@example.com" },
    });

    expect(result).toEqual({
      errors: [
        new Error("data is empty - No data has been sent from the page"),
      ],
    });
  });
});
