import CustomError from "../../../../domain/entities/CustomError";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";

describe("Get Submission", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors();
  });

  describe("Get submission by id", () => {
    it("should return the submission", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.registrationGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      const result =
        await appDevDependencies.registrationService.getLimitedPartnership(
          { access_token: "access_token", refresh_token: "refresh_token" },
          "transaction_id",
          limitedPartnership["_id"] as string
        );

      expect(result).toEqual(limitedPartnership);
    });

    it("should return an error not found if id is wrong", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.registrationGateway.feedLimitedPartnerships([
        limitedPartnership
      ]);

      await appDevDependencies.registrationService
        .getLimitedPartnership(
          { access_token: "access_token", refresh_token: "refresh_token" },
          "transaction_id",
          "wrong-id"
        )
        .catch((error) => {
          expect(error).toEqual(
            new CustomError("Limited partnership", "Not found: wrong-id")
          );
        });
    });
  });
});
