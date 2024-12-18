/* eslint-disable */

import ICacheRepository from "../../domain/ICacheRepository";

class CacheRepository implements ICacheRepository {

  async getData(): Promise<Record<string, any>> {
    throw new Error("Method not implemented.");
  }

  async addData(data: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }

}

export default CacheRepository;
