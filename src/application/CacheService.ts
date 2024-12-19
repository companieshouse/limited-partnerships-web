import { Session } from "@companieshouse/node-session-handler";

import ICacheRepository from "../domain/ICacheRepository";

class CacheService {
  cacheRepository: ICacheRepository;

  constructor(cacheRepository: ICacheRepository) {
    this.cacheRepository = cacheRepository;
  }

  getDataFromCache(session: Session): Promise<Record<string, any>> {
    return this.cacheRepository.getData(session);
  }

  async addDataToCache(
    session: Session,
    data: Record<string, any>
  ): Promise<void> {
    await this.cacheRepository.addData(session, data);
  }

  async removeDataFromCache(session: Session, key: string): Promise<void> {
    await this.cacheRepository.deleteData(session, key);
  }
}

export default CacheService;
