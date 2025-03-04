import { Router } from "express";

import { IDependencies } from "../config";

import globalEndpoints from "./global";
import registrationEndpoints from "./registration";
import addressLookUpEndpoints from "./addressLookUp";
import { transitionEndpoints } from "./transition";

const appRouter = (dependencies: IDependencies): Router => {
  const router = Router();

  globalEndpoints(router, dependencies);
  registrationEndpoints(router, dependencies);
  addressLookUpEndpoints(router, dependencies);
  transitionEndpoints(router, dependencies);

  return router;
};

export default appRouter;
