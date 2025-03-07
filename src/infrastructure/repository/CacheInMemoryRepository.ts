/* eslint-disable */

import { APPLICATION_CACHE_KEY } from "../../config/constants";
import ICacheRepository from "../../domain/ICacheRepository";

class CacheInMemoryRepository implements ICacheRepository {
  cache: { [APPLICATION_CACHE_KEY]: Record<string, any> } | null = null;

  feedCache(value: Record<string, any> | null) {
    this.cache = value ? { [APPLICATION_CACHE_KEY]: value } : value;
  }

  getData(cookies: any): Record<string, any> {
    return this.cache?.[APPLICATION_CACHE_KEY] ?? {};
  }

  addData(cookies: Record<string, any>, data: Record<string, any>): string {
    if (this.cache?.[APPLICATION_CACHE_KEY]) {
      this.cache = {
        [APPLICATION_CACHE_KEY]: {
          ...this.cache?.[APPLICATION_CACHE_KEY],
          ...data
        }
      };

      return "";
    }

    this.cache = {
      [APPLICATION_CACHE_KEY]: {
        ...data
      }
    };

    return JSON.stringify(this.cache);
  }

  deleteData(cookies: Record<string, any>, key: string): string {
    const data = this.getData(cookies);

    delete data[key];

    this.cache = {
      [APPLICATION_CACHE_KEY]: {
        ...data
      }
    };

    return JSON.stringify(this.cache);
  }
}

export default CacheInMemoryRepository;
