import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import CustomError from "../../domain/entities/CustomError";
import PageRegistrationType from "./PageRegistrationType";
import {
  PageRouting,
  pageRoutingDefault,
} from "../../domain/entities/PageRouting";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import RegistrationCoordinator from "./Coordinator";
import registrationsRouting from "./Routing";

class RegistrationService {
  registrationGateway: IRegistrationGateway;
  registrationCoordinator: RegistrationCoordinator;

  constructor(
    registrationGateway: IRegistrationGateway,
    registrationCoordinator: RegistrationCoordinator
  ) {
    this.registrationGateway = registrationGateway;
    this.registrationCoordinator = registrationCoordinator;
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

      const registrationRouting = this.registrationCoordinator.execute(
        registrationType,
        limitedPartnerShip
      );

      return registrationRouting
        ? { ...registrationRouting, data: { submissionId, transactionId } }
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
