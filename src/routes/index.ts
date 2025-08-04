import { Router } from "express";

import { IDependencies } from "../config";

import globalEndpoints from "./global";

import addressRegistrationEndpoints from "./addressRegistration";
import addressTransitionEndpoints from "./addressTransition";
import addressPostTransitionEndpoints from "./addressPostTransition";

import registrationEndpoints from "./registration";
import transitionEndpoints from "./transition";
import postTransitionEndpoints from "./postTransition";

const appRouter = (dependencies: IDependencies): Router => {
  const router = Router();

  globalEndpoints(router, dependencies);

  addressRegistrationEndpoints(router, dependencies);
  addressTransitionEndpoints(router, dependencies);
  addressPostTransitionEndpoints(router, dependencies);

  registrationEndpoints(router, dependencies);
  transitionEndpoints(router, dependencies);
  postTransitionEndpoints(router, dependencies);

  return router;
};

export default appRouter;
