import { getEnvironmentValueAsBoolean } from "./environment.value";

type FeatureFlags = {
    [key: string]: boolean
}

const flags: FeatureFlags = {
  "FLAG_1": getEnvironmentValueAsBoolean("FLAG_1"),
  "FLAG_2": getEnvironmentValueAsBoolean("FLAG_2")
};

export const hasFeature = (): FeatureFlags => flags;
