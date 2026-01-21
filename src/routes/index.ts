import { Router } from "express";

import { GENERAL_PARTNER_WITH_ID_URL, IDependencies, LIMITED_PARTNER_WITH_ID_URL, POST_TRANSITION_WITH_ID_URL, POST_TRANSITION_WITH_IDS_AND_SUBMISSION_URL, POST_TRANSITION_WITH_IDS_URL } from "../config";

import globalEndpoints from "./global";

import addressRegistrationEndpoints from "./addressRegistration";
import addressTransitionEndpoints from "./addressTransition";
import addressPostTransitionEndpoints from "./addressPostTransition";

import registrationEndpoints from "./registration";
import transitionEndpoints from "./transition";
import postTransitionEndpoints from "./postTransition";
import { setServiceName } from "../middlewares/service-name.middleware";

const appRouter = (dependencies: IDependencies): Router => {
  const router = Router();

  // Run middleware to set serviceName for all post transition routes
  router.use(`${POST_TRANSITION_WITH_ID_URL}`, setServiceName(dependencies));
  router.use(`${POST_TRANSITION_WITH_IDS_AND_SUBMISSION_URL}`, setServiceName(dependencies));
  router.use(`${POST_TRANSITION_WITH_IDS_URL}${GENERAL_PARTNER_WITH_ID_URL}`, setServiceName(dependencies));
  router.use(`${POST_TRANSITION_WITH_IDS_URL}${LIMITED_PARTNER_WITH_ID_URL}`, setServiceName(dependencies));

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
