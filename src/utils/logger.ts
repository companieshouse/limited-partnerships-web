import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../config";

export default createLogger(APPLICATION_NAME);
