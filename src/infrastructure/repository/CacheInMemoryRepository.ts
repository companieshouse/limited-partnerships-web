/* eslint-disable */

import { Session } from "@companieshouse/node-session-handler";

import { APPLICATION_CACHE_KEY } from "../../config/constants";
import ICacheRepository from "../../domain/ICacheRepository";

class CacheInMemoryRepository implements ICacheRepository {
  cache: { [APPLICATION_CACHE_KEY]: Record<string, any> } | null = null;

  feedCache(value: Record<string, any> | null) {
    this.cache = value ? { [APPLICATION_CACHE_KEY]: value } : value;
  }

  async getData(session: Session): Promise<Record<string, any>> {
    return this.cache?.[APPLICATION_CACHE_KEY] ?? {};
  }

  async addData(session: Session, data: Record<string, any>): Promise<void> {
    if (this.cache?.[APPLICATION_CACHE_KEY]) {
      this.cache = {
        [APPLICATION_CACHE_KEY]: {
          ...this.cache?.[APPLICATION_CACHE_KEY],
          ...data,
        },
      };

      return;
    }

    this.cache = {
      [APPLICATION_CACHE_KEY]: {
        ...data,
      },
    };
  }

  async deleteData(session: Session, key: string): Promise<void> {
    const data = await this.getData(session);

    delete data[key];

    this.cache = {
      [APPLICATION_CACHE_KEY]: {
        ...data,
      },
    };
  }
}

export default CacheInMemoryRepository;
