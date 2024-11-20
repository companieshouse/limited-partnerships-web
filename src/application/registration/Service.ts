import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import CustomError from "../../domain/entities/CustomError";
import TransactionRegistrationType from "./TransactionRegistrationType";
import {
  TransactionRouting,
  transactionRoutingDefault,
} from "../../domain/entities/TransactionRouting";
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
    registrationType: TransactionRegistrationType,
    data: Record<string, any>
  ): Promise<TransactionRouting> {
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

      const transaction = await this.registrationGateway.getSubmissionById(
        submissionId
      );

      const registrationRouting = this.registrationCoordinator.execute(
        registrationType,
        transaction
      );

      return registrationRouting
        ? { ...registrationRouting, data: { submissionId, transactionId } }
        : transactionRoutingDefault;
    } catch (errors: any) {
      const registrationRouting = this.getRegistrationRouting(registrationType);
      return CustomError.routingWithErrors(registrationRouting, errors);
    }
  }

  getRegistrationRouting(registrationType: TransactionRegistrationType) {
    const registrationRouting = registrationsRouting.get(registrationType);

    return registrationRouting
      ? { ...registrationRouting }
      : transactionRoutingDefault;
  }
}

export default RegistrationService;
