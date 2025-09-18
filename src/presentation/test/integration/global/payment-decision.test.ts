import request from "supertest";
import app from "../app";
import { PAYMENT_RESPONSE_URL } from "../../../controller/global/url";
import { getUrl } from "../../utils";
import { JOURNEY_TYPE_PARAM, POST_TRANSITION_BASE_URL, TRANSITION_BASE_URL } from "../../../../config";
import GlobalPageType from "presentation/controller/global/PageType";
import { appDevDependencies } from "config/dev-dependencies";
import { Journey } from "../../../../domain/entities/journey";
import TransactionBuilder from "../../../../presentation/test/builder/TransactionBuilder";

describe("Payment decision routing", () => {
  const TRANSITION_URL = getUrl(PAYMENT_RESPONSE_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition);
  const POST_TRANSITION_URL = getUrl(PAYMENT_RESPONSE_URL).replace(JOURNEY_TYPE_PARAM, Journey.postTransition);

  describe("GET payment decision page", () => {
    it("should redirect to the confirmation page when transition payment is successful", async () => {
      const transaction = new TransactionBuilder()
        .build();

      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(TRANSITION_URL + "?status=paid");
      expect(res.status).toEqual(302);

      const nextPage = `${TRANSITION_BASE_URL}/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/${GlobalPageType.confirmation}`;
      expect(res.header.location).toEqual(nextPage);
    });

    it("should redirect to the confirmation page when post-transition payment is successful", async () => {
      const companyNumber = "12345678";
      const transaction = new TransactionBuilder()
        .withCompanyNumber(companyNumber)
        .build();

      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app).get(POST_TRANSITION_URL + "?status=paid");
      expect(res.status).toEqual(302);

      const nextPage = `${POST_TRANSITION_BASE_URL}/company/${companyNumber}/transaction/${appDevDependencies.transactionGateway.transactionId}/${GlobalPageType.confirmation}`;
      expect(res.header.location).toEqual(nextPage);
    });

    it("should redirect to the payment failed page when transition payment is not successful", async () => {
      const res = await request(app).get(TRANSITION_URL + "?status=failed");
      expect(res.status).toEqual(302);

      const nextPage = `${TRANSITION_BASE_URL}/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/${GlobalPageType.paymentFailed}`;
      expect(res.header.location).toEqual(nextPage);
    });

    it("should redirect to the payment failed page when post transition payment is not successful", async () => {
      const res = await request(app).get(POST_TRANSITION_URL + "?status=failed");
      expect(res.status).toEqual(302);

      const nextPage = `${POST_TRANSITION_BASE_URL}/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/${GlobalPageType.paymentFailed}`;
      expect(res.header.location).toEqual(nextPage);
    });
  });
});
