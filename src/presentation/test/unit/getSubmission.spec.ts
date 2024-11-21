import RegistrationService from "../../../application/registration/Service";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import RegistrationInMemoryGateway from "../../../infrastructure/gateway/RegistrationInMemoryGateway";
import CustomError from "../../../domain/entities/CustomError";
import LimitedPartnershipBuilder from "../builder/LimitedPartnershipBuilder";

describe("Get Submission", () => {
  let registrationGateway: RegistrationInMemoryGateway;
  let registrationService: RegistrationService;

  beforeAll(() => {
    registrationGateway = new RegistrationInMemoryGateway();
    registrationService = new RegistrationService(
      registrationGateway as unknown as IRegistrationGateway
    );
  });

  beforeEach(() => {
    registrationGateway.feedLimitedPartnerships([]);
    registrationGateway.feedErrors([]);
  });

  describe("Get submission by id", () => {
    it("should return the submission", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      registrationGateway.feedLimitedPartnerships([limitedPartnership]);

      const result = await registrationService.getSubmissionById(
        limitedPartnership["_id"] as string
      );

      expect(result).toEqual(limitedPartnership);
    });

    it("should return the submission", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().build();

      registrationGateway.feedLimitedPartnerships([limitedPartnership]);

      await registrationService.getSubmissionById("wrong-id").catch((error) => {
        expect(error).toEqual(
          new CustomError("Limited partnership", "Not found: wrong-id")
        );
      });
    });
  });
});
