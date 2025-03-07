import ICacheRepository from "../../domain/ICacheRepository";

class CacheService {
  cacheRepository: ICacheRepository;

  constructor(cacheRepository: ICacheRepository) {
    this.cacheRepository = cacheRepository;
  }

  getDataFromCache(cookies: Record<string, any>): Record<string, any> {
    return this.cacheRepository.getData(cookies);
  }

  addDataToCache(cookies: Record<string, any>, data: Record<string, any>): string {
    return this.cacheRepository.addData(cookies, data);
  }

  removeDataFromCache(cookies: Record<string, any>, key: string): string {
    return this.cacheRepository.deleteData(cookies, key);
  }
}

export default CacheService;
