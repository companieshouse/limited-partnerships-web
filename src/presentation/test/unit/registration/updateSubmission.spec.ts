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
      { access_token: "access_token" },
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
});
