import { buildDependencies } from "./build-dependencies";

const dependencies = buildDependencies();

export const appDependencies = {
  ...dependencies
};
