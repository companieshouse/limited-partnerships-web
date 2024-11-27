import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../config/constants";

const logger = createLogger(APPLICATION_NAME);

export { logger };
