import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationService from "../../../application/registration/Service";
import CustomError from "../../../domain/entities/CustomError";
import PageRegistrationType from "../../controller/registration/PageRegistrationType";
import IRegistrationGateway from "../../../domain/IRegistrationGateway";
import RegistrationInMemoryGateway from "../../../infrastructure/gateway/RegistrationInMemoryGateway";
import LimitedPartnershipBuilder from "../builder/LimitedPartnershipBuilder";

describe("Create transaction and the first submission", () => {
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

  describe("Create LimitedPartnerShip", () => {
    it("should create a new LimitedPartnership", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(registrationGateway.submissionId)
        .build();

      const result =
        await registrationService.createTransactionAndFirstSubmission(
          PageRegistrationType.name,
          {
            partnership_name: limitedPartnership.data?.partnership_name,
            name_ending: limitedPartnership.data?.name_ending,
          }
        );

      expect(registrationGateway.limitedPartnerships.length).toEqual(1);
      expect(result).toEqual({
        limitedPartnership,
        transactionId: registrationGateway.transactionId,
        submissionId: registrationGateway.submissionId,
      });
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
          PageRegistrationType.name,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
          }
        );

      expect(registrationGateway.limitedPartnerships.length).toEqual(0);
      expect(result).toEqual({
        limitedPartnership: {},
        transactionId: "",
        submissionId: "",
        errors: [partnershipNameError, nameEndingError],
      });
    });
  });
});
