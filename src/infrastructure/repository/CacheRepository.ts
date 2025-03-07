import ICacheRepository from "../../domain/ICacheRepository";
import { APPLICATION_CACHE_KEY } from "../../config/constants";

class CacheRepository implements ICacheRepository {
  getData(cookies: any): Record<string, any> {
    if (!cookies[APPLICATION_CACHE_KEY]) {
      return {};
    }

    const data = JSON.parse(cookies[APPLICATION_CACHE_KEY]);
    return data;
  }

  addData(cookies: Record<string, any>, data: Record<string, any>): string {
    const cache = this.getData(cookies);

    return JSON.stringify({
      ...cache,
      ...data
    });
  }

  deleteData(cookies: Record<string, any>, key: string): string {
    const cache = this.getData(cookies);

    delete cache[key];

    return JSON.stringify(cache);
  }
}

export default CacheRepository;
