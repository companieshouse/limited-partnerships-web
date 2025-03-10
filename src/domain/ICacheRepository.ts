interface ICacheRepository {
  getData(cookies: Record<string, any>): Record<string, any>;
  addData(cookies: Record<string, any>, data: Record<string, any>): string;
  deleteData(cookies: Record<string, any>, key: string): string;
}

export default ICacheRepository;
