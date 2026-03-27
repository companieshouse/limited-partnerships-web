import IPersonWithSignificantControlGateway from "../../domain/IPersonWithSignificantControlGateway";
import { logger } from "../../utils";
import { extractAPIErrors } from "./utils";

class PersonWithSignificantControlService {
  i18n: any;

  constructor(private readonly personWithSignificantControlGateway: IPersonWithSignificantControlGateway) {}

  setI18n(i18n: any) {
    this.i18n = i18n;
  }

  async createPersonWithSignificantControl(
    opt: { access_token: string; refresh_token: string },
    transactionId: string,
    data: Record<string, any>
  ): Promise<{
    personWithSignificantControlId: string;
    errors?: any;
  }> {
    try {
      const personWithSignificantControlId =
        await this.personWithSignificantControlGateway.createPersonWithSignificantControl(opt, transactionId, data);

      return { personWithSignificantControlId };
    } catch (errors: any) {
      const { apiErrors, isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error creating general partner: ${JSON.stringify(apiErrors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        personWithSignificantControlId: "",
        errors
      };
    }
  }
}

export default PersonWithSignificantControlService;
