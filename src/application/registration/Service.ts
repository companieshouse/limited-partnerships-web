/* eslint-disable indent */
import {
  LimitedPartnership,
  NameEndingType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import CustomError from "../../domain/entities/CustomError";
import PageRegistrationType from "./PageRegistrationType";
import {
  PageRouting,
  pageRoutingDefault,
} from "../../domain/entities/PageRouting";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import registrationsRouting, { NEXT2_URL } from "./Routing";

class RegistrationService {
  registrationGateway: IRegistrationGateway;

  constructor(registrationGateway: IRegistrationGateway) {
    this.registrationGateway = registrationGateway;
  }

  async getSubmissionById(id: string): Promise<LimitedPartnership> {
    return await this.registrationGateway.getSubmissionById(id);
  }

  async createTransactionAndFirstSubmission(
    registrationType: PageRegistrationType,
    data: Record<string, any>
  ): Promise<PageRouting> {
    try {
      const transactionId = await this.registrationGateway.createTransaction(
        registrationType
      );

      const submissionId =
        await this.registrationGateway.createTransactionAndFirstSubmission(
          registrationType,
          transactionId,
          data
        );

      const limitedPartnerShip =
        await this.registrationGateway.getSubmissionById(submissionId);

      const registrationRouting = this.getRegistrationRouting(registrationType);

      if (
        limitedPartnerShip.data?.name_ending !==
        NameEndingType.LIMITED_PARTNERSHIP
      ) {
        return registrationRouting
          ? {
              ...registrationRouting,
              nextUrl: NEXT2_URL,
              data: { submissionId, transactionId },
            }
          : pageRoutingDefault;
      }

      return registrationRouting
        ? {
            ...registrationRouting,
            data: { submissionId, transactionId },
          }
        : pageRoutingDefault;
    } catch (errors: any) {
      const registrationRouting = this.getRegistrationRouting(registrationType);
      return CustomError.routingWithErrors(registrationRouting, errors);
    }
  }

  getRegistrationRouting(registrationType: PageRegistrationType) {
    const registrationRouting = registrationsRouting.get(registrationType);

    return registrationRouting
      ? { ...registrationRouting }
      : pageRoutingDefault;
  }
}

export default RegistrationService;
