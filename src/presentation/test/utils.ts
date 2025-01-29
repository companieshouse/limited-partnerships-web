import { LocalesService } from "@companieshouse/ch-node-utils";

import * as config from "../../config/constants";
import { appDevDependencies } from "../../config/dev-dependencies";

export const setLocalesEnabled = (bool: boolean) => {
  jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
  LocalesService.getInstance().enabled = bool;
};

export const getUrl = (url: string) =>
  appDevDependencies.addressLookUpController.insertIdsInUrl(
    url,
    appDevDependencies.transactionGateway.transactionId,
    appDevDependencies.limitedPartnershipGateway.submissionId
  );
