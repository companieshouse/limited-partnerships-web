import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import CustomError from "../../domain/entities/CustomError";
import RegistrationPageType from "../../presentation/controller/registration/PageType";
import IRegistrationGateway from "../../domain/IRegistrationGateway";
import ICacheRepository from "../../domain/ICacheRepository";
import { logger } from "../../utils";

class RegistrationService {
  registrationGateway: IRegistrationGateway;
  cacheRepository: ICacheRepository;

  constructor(registrationGateway: IRegistrationGateway, cacheRepository: ICacheRepository) {
    this.registrationGateway = registrationGateway;
    this.cacheRepository = cacheRepository;
  }

  getSubmissionById(id: string): Promise<LimitedPartnership> {
    return this.registrationGateway.getSubmissionById(id);
  }

  async createTransactionAndFirstSubmission(
    opt: { access_token: string },
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<{
    submissionId: string;
    transactionId: string;
    errors?: CustomError[];
  }> {
    try {
      const transactionId = await this.registrationGateway.createTransaction(
        { access_token: opt.access_token },
        registrationType
      );

      const submissionId = await this.registrationGateway.createSubmission(
        { access_token: opt.access_token },
        registrationType,
        transactionId,
        data
      );

      return { submissionId, transactionId };
    } catch (error: any) {
      const errors = Array.isArray(error) ? error : [error];

      logger.error(
        `Error creating transaction or submission: ${JSON.stringify(errors)}`
      );

      return {
        submissionId: "",
        transactionId: "",
        errors,
      };
    }
  }

  async sendPageData(
    opt: { access_token: string },
    transactionId: string,
    submissionId: string,
    registrationType: RegistrationPageType,
    data: Record<string, any>
  ): Promise<void | {
    errors?: CustomError[];
  }> {
    try {
      await this.registrationGateway.sendPageData(
        opt,
        transactionId,
        submissionId,
        registrationType,
        data
      );
    } catch (error: any) {
      const errors = Array.isArray(error) ? error : [error];

      logger.error(`Error sending data: ${JSON.stringify(errors)}`);

      return {
        errors,
      };
    }
  }

  async getDataFromCache(): Promise<Record<string, any>> {
    return await this.cacheRepository.getData();
  }

  async addDataToCache(data: Record<string, any>): Promise<void> {
    await this.cacheRepository.addData(data);
  }
}

export default RegistrationService;
