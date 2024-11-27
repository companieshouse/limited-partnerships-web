import { Router } from "express";

import { IDependencies } from "../config";

import globalEndpoints from "./global";
import registrationEndpoints from "./registration";

const appRouter = (dependencies: IDependencies): Router => {
  const router = Router();

  globalEndpoints(router, dependencies);
  registrationEndpoints(router, dependencies);

  return router;
};

export default appRouter;
