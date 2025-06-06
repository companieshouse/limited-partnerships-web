import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";

describe("Get Submission", () => {
  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.addressLookUpGateway.setError(false);
  });

  describe("Get submission by id", () => {
    it("should return the submission", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const result =
        await appDevDependencies.limitedPartnershipService.getLimitedPartnership(
          { access_token: "access_token", refresh_token: "refresh_token" },
          "transaction_id",
          limitedPartnership["_id"] as string
        );

      expect(result).toEqual(limitedPartnership);
    });

    it("should return an error not found if id is wrong", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      appDevDependencies.limitedPartnershipGateway.setError(true);

      await expect(
        appDevDependencies.limitedPartnershipService.getLimitedPartnership(
          { access_token: "access_token", refresh_token: "refresh_token" },
          "transaction_id",
          "wrong-id"
        )
      ).rejects.toThrow("Not found: wrong-id");
    });
  });
});
