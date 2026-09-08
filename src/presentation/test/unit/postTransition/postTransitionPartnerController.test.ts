import { appDevDependencies } from "../../../../config/dev-dependencies";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { Ids, PartnerType, Tokens } from "../../../../domain/types";
import PostTransitionPartnerController from "../../../controller/postTransition/PostTransitionPartnerController";

describe("PostTransitionPartnerController", () => {
  const tokens: Tokens = { access_token: "token", refresh_token: "token" };

  const postTransitionPartnerController = new PostTransitionPartnerController(
    appDevDependencies.limitedPartnershipService,
    appDevDependencies.generalPartnerService,
    appDevDependencies.limitedPartnerService,
    appDevDependencies.companyService,
    appDevDependencies.transactionService
  );

  beforeEach(() => {
    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  it.each([
    { submissionId: "submission-1", transactionId: "transaction-1", shouldCallGetLimitedPartnership: true },
    { submissionId: "submission-1", transactionId: "", shouldCallGetLimitedPartnership: false },
    { submissionId: "", transactionId: "transaction-1", shouldCallGetLimitedPartnership: false },
    { submissionId: "", transactionId: "", shouldCallGetLimitedPartnership: false }
  ])(
    "should call getLimitedPartnership: $shouldCallGetLimitedPartnership when submissionId=$submissionId and transactionId=$transactionId",
    async ({ submissionId, transactionId, shouldCallGetLimitedPartnership }) => {
      const getLimitedPartnershipSpy = jest.spyOn(appDevDependencies.limitedPartnershipGateway, "getLimitedPartnership");

      const ids: Ids = {
        transactionId,
        submissionId,
        companyId: "LP123456",
        generalPartnerId: appDevDependencies.generalPartnerGateway.generalPartnerId,
        limitedPartnerId: "",
        personWithSignificantControlId: "",
        appointmentId: ""
      };

      await (postTransitionPartnerController as any).getPartnershipAndPartnerEntity(tokens, ids, PartnerType.generalPartner);

      if (shouldCallGetLimitedPartnership) {
        expect(getLimitedPartnershipSpy).toHaveBeenCalledWith(tokens, transactionId, submissionId);
      } else {
        expect(getLimitedPartnershipSpy).not.toHaveBeenCalled();
      }
    }
  );
});
