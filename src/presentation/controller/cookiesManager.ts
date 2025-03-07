import { APPLICATION_CACHE_KEY } from "../../config";

export const getData = (cookies: any): Record<string, any> => {
  if (!cookies[APPLICATION_CACHE_KEY]) {
    return {};
  }
  const data = JSON.parse(cookies[APPLICATION_CACHE_KEY]);
  return data;
};

export const addData = (cookies: Record<string, any>, data: Record<string, any>): string => {
  const cache = getData(cookies);

  return JSON.stringify({
    ...cache,
    ...data
  });
};

export const deleteData = (cookies: Record<string, any>, key: string): string => {
  const cache = getData(cookies);

  delete cache[key];

  return JSON.stringify(cache);
};
