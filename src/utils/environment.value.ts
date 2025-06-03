export const getEnvironmentValue = (key: string, defaultValue = ""): string => {
  const value: string = process.env[key] ?? defaultValue;

  if (!value) {
    throw new Error(`Please set the environment variable "${key}"`);
  }

  return value;
};

export const getEnvironmentValueAsBoolean = (
  key: string,
  defaultValue = ""
): boolean => {
  const str = getEnvironmentValue(key, defaultValue);
  if (str === null || str === undefined) {
    return false;
  }
  return str.toLowerCase() === "true";
};
