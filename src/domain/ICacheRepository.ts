import { Session } from "@companieshouse/node-session-handler";

interface ICacheRepository {
  getData(session: Session): Promise<Record<string, any>>;
  addData(session: Session, data: Record<string, any>): Promise<void>;
}

export default ICacheRepository;
