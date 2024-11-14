// import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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

  // async get(id: string): Promise<LimitedPartnership> {
  //   return await this.registrationGateway.get(id);
  // }

  async createTransaction(registrationType: TransactionRegistrationType) {
    const registrationRouting = registrationsRouting.get(registrationType);

    try {
      const transactionId = await this.registrationGateway.createTransaction(
        registrationType
      );

      return registrationRouting
        ? { ...registrationRouting, data: { transactionId } }
        : transactionRoutingDefault;
    } catch (errors: any) {
      const registrationRouting = this.getRegistrationRouting(registrationType);
      return CustomError.routingWithErrors(registrationRouting, errors);
    }
  }

  async createSubmissionFromTransaction(
    registrationType: TransactionRegistrationType,
    transactiontionId: string,
    data: Record<string, any>
  ): Promise<TransactionRouting> {
    const registrationRouting = registrationsRouting.get(registrationType);

    try {
      const registrationId =
        await this.registrationGateway.createSubmissionFromTransaction(
          registrationType,
          transactiontionId,
          data
        );

      return registrationRouting
        ? { ...registrationRouting, data: { registrationId } }
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
