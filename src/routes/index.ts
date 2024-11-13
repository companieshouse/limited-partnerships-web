import { Router } from "express";

import registrationEndpoints from "./registration";
import { IDependencies } from "../config";

const appRouter = (dependencies: IDependencies): Router => {
  const router = Router();

  registrationEndpoints(router, dependencies);

  return router;
};

export default appRouter;
