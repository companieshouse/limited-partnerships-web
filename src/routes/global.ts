/* eslint-disable */

import { Router } from "express";

import * as config from "../config";
import * as controllers from "../controllers";

import { IDependencies } from "../config/IDependencies";

export const globalEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(config.HEALTHCHECK_URL, controllers.healthCheckController.get);
};

export default globalEndpoints;
