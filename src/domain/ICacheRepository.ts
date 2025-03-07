import { Session } from "express-session";

interface ICacheRepository {
  getData(session: Session): Promise<Record<string, any>>;
  addData(session: Session, data: Record<string, any>): Promise<void>;
  deleteData(session: Session, key: string): Promise<void>;
}

export default ICacheRepository;
