import { Session } from "@companieshouse/node-session-handler";
import ICacheRepository from "../../domain/ICacheRepository";
import { APPLICATION_CACHE_KEY } from "../../config/constants";

class CacheRepository implements ICacheRepository {
  async getData(session: Session): Promise<Record<string, any>> {
    return (await session?.getExtraData(APPLICATION_CACHE_KEY)) ?? {};
  }

  async addData(session: Session, data: Record<string, any>): Promise<void> {
    const cache = await this.getData(session);

    const updatedCache = {
      ...cache,
      ...data,
    };

    session?.setExtraData(APPLICATION_CACHE_KEY, updatedCache);
  }
}

export default CacheRepository;
