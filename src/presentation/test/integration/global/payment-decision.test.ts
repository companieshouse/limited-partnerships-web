import request from "supertest";
import app from "../app";
import { PAYMENT_RESPONSE_URL } from "../../../controller/global/url";
import { getUrl } from "../../utils";
import { TRANSITION_BASE_URL } from "../../../../config";
import GlobalPageType from "presentation/controller/global/PageType";
import { appDevDependencies } from "config/dev-dependencies";

describe("Payment decision routing", () => {
  const URL = getUrl(PAYMENT_RESPONSE_URL);

  describe("GET payment decision page", () => {

    it("should redirect to the confirmation page when payment is successful", async () => {
      const res = await request(app).get(URL + "?status=paid");
      expect(res.status).toEqual(302);
      const nextPage = `${TRANSITION_BASE_URL}/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/${GlobalPageType.confirmation}`;
      expect(res.header.location).toEqual(nextPage);
    });

    it("should redirect to the payment failed page when payment is not successful", async () => {
      const res = await request(app).get(URL + "?status=failed");
      expect(res.status).toEqual(302);
      const nextPage = `${TRANSITION_BASE_URL}/transaction/${appDevDependencies.transactionGateway.transactionId}/submission/${appDevDependencies.limitedPartnershipGateway.submissionId}/${GlobalPageType.paymentFailed}`;
      expect(res.header.location).toEqual(nextPage);
    });
  });
});
