export class User {
  id: string;
  type: string;
  name: string;
  password?: string;
  salt?: string;
  realName: string;
  avatar?: string;
  appTypes?: string[];
  category?: string;
  roles: string[];
  permissions?: number[];
  affiliations: {
    type?: string;
    organization?: string;
  }[] = [{}];
  mobiles: string[];
  emails?: string[];
  wechates?: string[];
  createTime?: string;
  timestamp?: string;
  status?: string;
  serialNo?: string;
  description?: string;
}
