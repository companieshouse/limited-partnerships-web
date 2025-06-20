import { Router } from "express";

import { IDependencies } from "../config";

import globalEndpoints from "./global";
import registrationEndpoints from "./registration";
import addressRegistrationEndpoints from "./addressRegistration";
import transitionEndpoints from "./transition";
import addressTransitionEndpoints from "./addressTransition";

const appRouter = (dependencies: IDependencies): Router => {
  const router = Router();

  globalEndpoints(router, dependencies);
  registrationEndpoints(router, dependencies);
  addressRegistrationEndpoints(router, dependencies);

  transitionEndpoints(router, dependencies);
  addressTransitionEndpoints(router, dependencies);

  return router;
};

export default appRouter;
