import { Router } from "express";

import { IDependencies, POST_TRANSITION_WITH_ID_URL, POST_TRANSITION_WITH_IDS_URL, REGISTRATION_BASE_URL, TRANSITION_BASE_URL } from "../config";

import globalEndpoints from "./global";

import addressRegistrationEndpoints from "./addressRegistration";
import addressTransitionEndpoints from "./addressTransition";
import addressPostTransitionEndpoints from "./addressPostTransition";

import registrationEndpoints from "./registration";
import transitionEndpoints from "./transition";
import postTransitionEndpoints from "./postTransition";
import { setServiceName } from "../middlewares/service-name.middleware";
import { setCustomerFeedbackUrl } from "../middlewares/customer-feedback.middleware";

const appRouter = (dependencies: IDependencies): Router => {
  const router = Router();

  // Run middleware to set serviceName for all post transition routes
  router.use([
    POST_TRANSITION_WITH_IDS_URL,
    POST_TRANSITION_WITH_ID_URL
  ], setServiceName(dependencies));

  router.use([
    REGISTRATION_BASE_URL,
    TRANSITION_BASE_URL,
    POST_TRANSITION_WITH_IDS_URL,
    POST_TRANSITION_WITH_ID_URL
  ], setCustomerFeedbackUrl(dependencies));

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
