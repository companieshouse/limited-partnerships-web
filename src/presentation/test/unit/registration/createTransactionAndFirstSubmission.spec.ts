import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import CustomError from "../../../../domain/entities/CustomError";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";

describe("Create transaction and the first submission", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors([]);
  });

  describe("Create LimitedPartnerShip", () => {
    it("should create a new LimitedPartnership", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.registrationGateway.submissionId)
        .build();

      const result =
        await appDevDependencies.registrationService.createTransactionAndFirstSubmission(
          { access_token: "access_token", refresh_token: "refresh_token" },
          RegistrationPageType.name,
          {
            partnership_name: limitedPartnership.data?.partnership_name,
            name_ending: limitedPartnership.data?.name_ending,
            partnership_type: limitedPartnership.data?.partnership_type,
          }
        );

      expect(
        appDevDependencies.registrationGateway.limitedPartnerships.length
      ).toEqual(1);
      expect(result).toEqual({
        transactionId: appDevDependencies.registrationGateway.transactionId,
        submissionId: appDevDependencies.registrationGateway.submissionId,
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
      appDevDependencies.registrationGateway.feedErrors([
        partnershipNameError,
        nameEndingError,
      ]);

      const result =
        await appDevDependencies.registrationService.createTransactionAndFirstSubmission(
          { access_token: "access_token", refresh_token: "refresh_token" },
          RegistrationPageType.name,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
            partnership_type: "LP",
          }
        );

      expect(
        appDevDependencies.registrationGateway.limitedPartnerships.length
      ).toEqual(0);
      expect(result).toEqual({
        transactionId: "",
        submissionId: "",
        errors: [partnershipNameError, nameEndingError],
      });
    });

    it("should return an error - wrong type", async () => {
      const result =
        await appDevDependencies.registrationService.createTransactionAndFirstSubmission(
          { access_token: "access_token", refresh_token: "refresh_token" },
          RegistrationPageType.next,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
            partnership_type: "LP",
          }
        );

      expect(
        appDevDependencies.registrationGateway.limitedPartnerships.length
      ).toEqual(0);
      expect(result).toEqual({
        transactionId: "",
        submissionId: "",
        errors: [new Error("wrong type")],
      });
    });
  });
});
