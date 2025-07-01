import { IncorporationKind, NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { ApiErrors } from "../../../../domain/entities/UIErrors";
import { Journey, JourneyTypes } from "../../../../domain/entities/journey";

describe("Create transaction and the first submission", () => {
  const journeyTypes: JourneyTypes = {
    isRegistration: true,
    isTransition: false,
    isPostTransition: false,
    journey: Journey.registration
  };

  beforeEach(() => {
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
  });

  describe("Create LimitedPartnership", () => {
    it("should create a new LimitedPartnership", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .build();

      const result = await appDevDependencies.limitedPartnershipService.createTransactionAndFirstSubmission(
        { access_token: "access_token", refresh_token: "refresh_token" },
        RegistrationPageType.name,
        journeyTypes,
        {
          partnership_name: limitedPartnership.data?.partnership_name,
          name_ending: limitedPartnership.data?.name_ending,
          partnership_type: limitedPartnership.data?.partnership_type
        }
      );

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(1);
      expect(result).toEqual({
        transactionId: appDevDependencies.transactionGateway.transactionId,
        submissionId: appDevDependencies.limitedPartnershipGateway.submissionId
      });
    });

    it("should return an error", async () => {
      const apiErrors: ApiErrors = {
        errors: {
          "data.partnershipName": "partnership_name must be less than 160",
          "data.nameEnding": `name_ending must be one of ${Object.values(NameEndingType).join(", ")}`
        }
      };

      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const result = await appDevDependencies.limitedPartnershipService.createTransactionAndFirstSubmission(
        { access_token: "access_token", refresh_token: "refresh_token" },
        RegistrationPageType.name,
        journeyTypes,
        {
          partnership_name: "Test Limited Partnership",
          name_ending: NameEndingType.LIMITED_PARTNERSHIP,
          partnership_type: "LP"
        }
      );

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(0);
      expect(result).toEqual({
        transactionId: "",
        submissionId: "",
        errors: appDevDependencies.limitedPartnershipGateway.uiErrors
      });
      expect(appDevDependencies.limitedPartnershipGateway.uiErrors.errors).toEqual({
        partnership_name: {
          text: "partnership_name must be less than 160"
        },
        name_ending: {
          text: "name_ending must be one of Limited Partnership, LP, L.P., Partneriaeth Cyfyngedig, PC, P.C."
        },
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

    it("should return an error if wrong page type - transaction", async () => {
      await expect(
        appDevDependencies.limitedPartnershipService.createTransactionAndFirstSubmission(
          { access_token: "access_token", refresh_token: "refresh_token" },
          RegistrationPageType.next,
          journeyTypes,
          {
            partnership_name: "Test Limited Partnership",
            name_ending: NameEndingType.LIMITED_PARTNERSHIP,
            partnership_type: "LP"
          }
        )
      ).rejects.toThrow("Wrong page type to create a new transaction");

      expect(appDevDependencies.limitedPartnershipGateway.limitedPartnerships.length).toEqual(0);
    });

    it("should return an error if wrong page type - incorporation", async () => {
      const transactionId = appDevDependencies.transactionGateway.transactionId;

      await expect(
        appDevDependencies.incorporationGateway.createIncorporation(
          { access_token: "access_token", refresh_token: "refresh_token" },
          RegistrationPageType.next,
          transactionId,
          IncorporationKind.REGISTRATION
        )
      ).rejects.toThrow("Wrong page type to create a new incorporation");
    });
  });
});
