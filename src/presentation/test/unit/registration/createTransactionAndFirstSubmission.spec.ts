import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { ApiErrors } from "../../../../domain/entities/UIErrors";

describe("Create transaction and the first submission", () => {
  beforeEach(() => {
    appDevDependencies.registrationGateway.feedLimitedPartnerships([]);
    appDevDependencies.registrationGateway.feedErrors();
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
            partnership_type: limitedPartnership.data?.partnership_type
          }
        );

      expect(
        appDevDependencies.registrationGateway.limitedPartnerships.length
      ).toEqual(1);
      expect(result).toEqual({
        transactionId: appDevDependencies.registrationGateway.transactionId,
        submissionId: appDevDependencies.registrationGateway.submissionId
      });
    });

    it("should return an error", async () => {
      const apiErrors: ApiErrors = {
        errors: {
          "data.partnershipName": "partnership_name must be less than 160",
          "data.nameEnding": `name_ending must be one of ${Object.values(
            NameEndingType
          ).join(", ")}`
        }
      };

      appDevDependencies.registrationGateway.feedErrors(apiErrors);

      const result =
        await appDevDependencies.registrationService.createTransactionAndFirstSubmission(
          { access_token: "access_token", refresh_token: "refresh_token" },
          RegistrationPageType.name,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
            partnership_type: "LP"
          }
        );

      expect(
        appDevDependencies.registrationGateway.limitedPartnerships.length
      ).toEqual(0);
      expect(result).toEqual({
        transactionId: "",
        submissionId: "",
        errors: appDevDependencies.registrationGateway.uiErrors
      });
      expect(appDevDependencies.registrationGateway.uiErrors.errors).toEqual({
        errorList: [
          {
            href: "#partnership_name",
            text: "partnership_name must be less than 160"
          },
          {
            href: "#name_ending",
            text: "name_ending must be one of Limited Partnership, LP, L.P., Partneriaeth Cyfyngedig, PC, P.C."
          }
        ]
      });
    });

    it("should return an error - wrong type", async () => {
      await appDevDependencies.registrationService
        .createTransactionAndFirstSubmission(
          { access_token: "access_token", refresh_token: "refresh_token" },
          RegistrationPageType.next,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
            partnership_type: "LP"
          }
        )
        .catch((error) => {
          expect(error).toEqual(new Error("wrong type"));
        });

      expect(
        appDevDependencies.registrationGateway.limitedPartnerships.length
      ).toEqual(0);
    });
  });
});
