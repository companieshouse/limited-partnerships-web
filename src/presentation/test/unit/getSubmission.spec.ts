import CustomError from "../../../domain/entities/CustomError";
import LimitedPartnershipBuilder from "../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../config/dev-dependencies";

describe("Get Submission", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  describe("Get submission by id", () => {
    it("should return the submission", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.registrationGateway.feedLimitedPartnerships([
        limitedPartnership,
      ]);

      const result =
        await appDevDependencies.registrationService.getSubmissionById(
          limitedPartnership["_id"] as string
        );

      expect(result).toEqual(limitedPartnership);
    });

    it("should return the submission", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      appDevDependencies.registrationGateway.feedLimitedPartnerships([
        limitedPartnership,
      ]);

      await appDevDependencies.registrationService
        .getSubmissionById("wrong-id")
        .catch((error) => {
          expect(error).toEqual(
            new CustomError("Limited partnership", "Not found: wrong-id")
          );
        });
    });
  });
});
