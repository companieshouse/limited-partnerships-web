import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import RegistrationPageType from "../../../controller/registration/PageType";

describe("Update Submission", () => {
  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
  });

  it("should send data an update the limited partnership", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    await appDevDependencies.limitedPartnershipService.sendPageData(
      { access_token: "access_token", refresh_token: "refresh_token" },
      appDevDependencies.transactionGateway.transactionId,
      limitedPartnership["_id"] as string,
      RegistrationPageType.email,
      {
        email: "email@example.com"
      }
    );

    expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0]).toEqual({
      ...limitedPartnership,
      data: { ...limitedPartnership.data, email: "email@example.com" }
    });
  });

  it("should return an error if no data are send", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const apiErrors = {
      errors: {
        "data.email": "must be a well-formed email address"
      }
    };

    appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

    const result = await appDevDependencies.limitedPartnershipService.sendPageData(
      { access_token: "access_token", refresh_token: "refresh_token" },
      appDevDependencies.transactionGateway.transactionId,
      limitedPartnership["_id"] as string,
      RegistrationPageType.email,
      {}
    );

    expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships[0]).not.toEqual({
      ...limitedPartnership,
      data: { ...limitedPartnership.data, email: "email@example.com" }
    });

    expect(result).toEqual({
      errors: appDevDependencies.limitedPartnershipGateway.uiErrors
    });
  });
});
