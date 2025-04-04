import ICacheRepository from "../../domain/ICacheRepository";
import { APPLICATION_CACHE_KEY } from "../../config/constants";

class CacheRepository implements ICacheRepository {
  getData(cookies: any): Record<string, any> {
    if (!cookies[APPLICATION_CACHE_KEY]) {
      return {};
    }

    const str = this.fromBase64(cookies[APPLICATION_CACHE_KEY]);
    return str ? JSON.parse(str) : {};
  }

  addData(cookies: Record<string, any>, data: Record<string, any>): string {
    const cache = this.getData(cookies);

    const json = JSON.stringify({
      ...cache,
      ...data
    });

    return this.toBase64(json);
  }

  deleteData(cookies: Record<string, any>, key: string): string {
    const cache = this.getData(cookies);

    delete cache[key];

    const cacheUpdated = JSON.stringify(cache);

    return this.toBase64(cacheUpdated);
  }

  private toBase64(value: string): string {
    return Buffer.from(value).toString("base64");
  }

  private fromBase64(value: string): string {
    return Buffer.from(value, "base64").toString("utf-8");
  }
}

export default CacheRepository;
