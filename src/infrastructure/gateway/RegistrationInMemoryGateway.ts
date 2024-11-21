/* eslint-disable */

import crypto from "crypto";
import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import PageRegistrationType from "../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import CustomError from "../../domain/entities/CustomError";
import TransactionLimitedPartnership from "../../domain/entities/TransactionLimitedPartnership";
import LimitedPartnershipGatewayBuilder from "./LimitedPartnershipGatewayBuilder";

class RegistrationInMemoryGateway implements IRegistrationGateway {
  transactionId = crypto.randomUUID().toString();
  submissionId = crypto.randomUUID().toString();

  limitedPartnerships: TransactionLimitedPartnership[] = [];
  errors: CustomError[] = [];

  feedLimitedPartnerships(
    limitedPartnerships: TransactionLimitedPartnership[]
  ) {
    this.limitedPartnerships = limitedPartnerships;
  }

  feedErrors(errors: CustomError[]) {
    this.errors = errors;
  }

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    const limitedPartnerShip = this.limitedPartnerships.find(
      (lp) => lp._id === id
    );

    if (!limitedPartnerShip) {
      throw new CustomError("Limited partnership", `Not found: ${id}`);
    }

    return new LimitedPartnershipGatewayBuilder(limitedPartnerShip).build();
  }

  async createTransaction(pageType: PageRegistrationType): Promise<string> {
    if (pageType === PageRegistrationType.name) {
      return this.transactionId;
    }

    return "";
  }

  async createSubmission(
    pageType: PageRegistrationType,
    transactionId: string,
    data: Record<string, any>
  ): Promise<string> {
    if (!data.partnership_name) {
      this.errors.push(
        new CustomError(
          "partnership_name",
          "partnership_name must be at least 3 characters"
        )
      );
    }

    if (!data.name_ending) {
      this.errors.push(
        new CustomError(
          "name_ending",
          `name_ending must be one of ${Object.keys(NameEndingType).join(", ")}`
        )
      );
    }

    if (this.errors.length > 0) {
      throw this.errors;
    }

    const limitedPartnership = this.buildLimitedPartnership(pageType, data);

    this.limitedPartnerships.push(limitedPartnership);

    if (transactionId === this.transactionId) {
      this.limitedPartnerships[0] = limitedPartnership;
    }

    return this.submissionId;
  }

  private buildLimitedPartnership(
    pageType: PageRegistrationType,
    data: Record<string, any>
  ): TransactionLimitedPartnership {
    const limitedPartnershipBuilder = new LimitedPartnershipGatewayBuilder({
      _id: this.submissionId,
    });

    limitedPartnershipBuilder.withData(pageType, data);
    const limitedPartnership = limitedPartnershipBuilder.build();

    return limitedPartnership;
  }
}

export default RegistrationInMemoryGateway;
