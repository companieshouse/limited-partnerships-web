import { Session } from "express-session";

import ICacheRepository from "../../domain/ICacheRepository";
import { APPLICATION_CACHE_KEY } from "../../config/constants";

class CacheRepository implements ICacheRepository {
  async getData(session: Session): Promise<Record<string, any>> {
    // const sess = await session?.[APPLICATION_CACHE_KEY];
    // console.log(sess);

    return (await session?.[APPLICATION_CACHE_KEY]) ?? {};
  }

  async addData(session: Session, data: Record<string, any>): Promise<void> {
    const cache = await this.getData(session);

    const updatedCache = {
      ...cache,
      ...data
    };

    session[APPLICATION_CACHE_KEY] = updatedCache;
  }

  async deleteData(session: Session, key: string): Promise<void> {
    const cache = await this.getData(session);

    delete cache[key];

    session[APPLICATION_CACHE_KEY] = cache;
  }
}

export default CacheRepository;
