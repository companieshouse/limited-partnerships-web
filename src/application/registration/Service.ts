import CustomError from "../../domain/entities/CustomError";
import TransactionRegistrationType from "./TransactionRegistrationType";
import {
  TransactionRouting,
  transactionRoutingDefault,
} from "../../domain/entities/TransactionRouting";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import RegistrationCoordinator from "./Coordinator";
import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
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

  async get(id: string): Promise<LimitedPartnership> {
    return await this.registrationGateway.get(id);
  }

  async create(
    registrationType: TransactionRegistrationType,
    registrationId: string,
    data: Record<string, any>
  ): Promise<TransactionRouting> {
    const registrationRouting = registrationsRouting.get(registrationType);

    try {
      const id = await this.registrationGateway.create(
        registrationType,
        registrationId,
        data
      );

      return registrationRouting
        ? { ...registrationRouting, data: { registrationId: id } }
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
