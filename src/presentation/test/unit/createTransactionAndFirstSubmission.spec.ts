import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationCoordinator from "../../../application/registration/Coordinator";
import { registrationRoutingName } from "../../../application/registration/Routing";
import RegistrationService from "../../../application/registration/Service";
import CustomError from "../../../domain/entities/CustomError";
import TransactionRegistrationType from "../../../application/registration/TransactionRegistrationType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import RegistrationInMemoryGateway from "../../../infrastructure/gateway/RegistrationInMemoryGateway";

describe("Create transaction and the first submission", () => {
  let registrationGateway: RegistrationInMemoryGateway;
  let registrationCoordinator: RegistrationCoordinator;
  let registrationService: RegistrationService;

  beforeAll(() => {
    registrationGateway = new RegistrationInMemoryGateway();
    registrationCoordinator = new RegistrationCoordinator();
    registrationService = new RegistrationService(
      registrationGateway as unknown as IRegistrationGateway,
      registrationCoordinator
    );
  });

  beforeEach(() => {
    registrationGateway.feedLimitedPartnerships([]);
    registrationGateway.feedErrors([]);
  });

  describe("Get registrationRoutingName", () => {
    it("should return the page corresponcting to the transaction", () => {
      const result = registrationService.getRegistrationRouting(
        TransactionRegistrationType.name
      );

      expect(result).toEqual(registrationRoutingName);
    });
  });

  describe("Create LimitedPartnerShip", () => {
    it("should create a new LimitedPartnership", async () => {
      const result =
        await registrationService.createTransactionAndFirstSubmission(
          TransactionRegistrationType.name,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
          }
        );

      expect(registrationGateway.limitedPartnerships.length).toEqual(1);
      expect(result).toEqual(
        expect.objectContaining({
          ...registrationRoutingName,
          data: {
            transactionId: registrationGateway.transactionId,
            submissionId: registrationGateway.submissionId,
          },
        })
      );
    });

    it("should return an error", async () => {
      const partnershipNameError = new CustomError(
        "partnership_name",
        "partnership_name must be at least 3 characters"
      );
      const nameEndingError = new CustomError(
        "name_ending",
        `name_ending must be one of ${Object.keys(NameEndingType).join(", ")}`
      );
      registrationGateway.feedErrors([partnershipNameError, nameEndingError]);

      const result =
        await registrationService.createTransactionAndFirstSubmission(
          TransactionRegistrationType.name,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
          }
        );

      expect(registrationGateway.limitedPartnerships.length).toEqual(0);
      expect(result).toEqual(
        expect.objectContaining({
          ...registrationRoutingName,
          errors: [partnershipNameError, nameEndingError],
        })
      );
    });
  });
});
