import * as config from "../config/constants";
import { LocalesService } from "@companieshouse/ch-node-utils";

export const setLocalesEnabled = (bool: boolean) => {
  jest.spyOn(config, "isLocalesEnabled").mockReturnValue(bool);
  LocalesService.getInstance().enabled = bool;
};
