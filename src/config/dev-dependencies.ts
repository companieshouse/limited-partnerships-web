import { buildDependencies } from "./build-dependencies";

const devDependencies = buildDependencies(true);

export const appDevDependencies = {
  ...devDependencies
};
