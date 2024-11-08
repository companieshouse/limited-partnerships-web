import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../config";

const logger = createLogger(APPLICATION_NAME);

export {
  logger
};
