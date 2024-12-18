interface ICacheRepository {
  addData(data: Record<string, any>): Promise<void>;
  getData(): Promise<Record<string, any>>;
}

export default ICacheRepository;
