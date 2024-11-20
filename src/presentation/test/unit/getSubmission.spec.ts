import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import RegistrationService from "../../../application/registration/Service";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import RegistrationInMemoryGateway from "../../../infrastructure/gateway/RegistrationInMemoryGateway";
import CustomError from "../../../domain/entities/CustomError";

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
      registrationGateway.feedLimitedPartnerships([limitedPartnership]);

      const result = await registrationService.getSubmissionById(
        limitedPartnership["_id"]
      );

      expect(result).toEqual(limitedPartnership);
    });

    it("should return the submission", async () => {
      registrationGateway.feedLimitedPartnerships([limitedPartnership]);

      await registrationService.getSubmissionById("wrong-id").catch((error) => {
        expect(error).toEqual(
          new CustomError("Limited partnership", "Not found: wrong-id")
        );
      });
    });
  });
});

const limitedPartnership = {
  _id: "123456",
  data: {
    partnership_name: "partnership_name test",
    name_ending: NameEndingType.LIMITED_PARTNERSHIP,
  },
  links: [
    {
      self: `/limited-partnership/transaction/098765/submission/123456/name`,
    },
  ],
};
