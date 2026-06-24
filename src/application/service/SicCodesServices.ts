import { logger } from "../../utils";
import { extractAPIErrors } from "./utils";

class SicCodesService {
  constructor(private readonly sicCodesGateway: any) {}

  getSicCodes(): Promise<{ sic_code: string; sic_description: string }[]> {
    try {
      return this.sicCodesGateway.getSicCodes();
    } catch (errors: any) {
      const { apiErrors } = extractAPIErrors(errors);

      logger.error(`Error getting transaction: ${JSON.stringify(apiErrors)}`);

      throw errors;
    }
  }
}

export default SicCodesService;
