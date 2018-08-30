export class Organization {
  id: string;
  code: string;
  name: string;
  type: string;
  category?: string;
  region: string;
  parent?: string;
  createTime?: string;
  timestamp?: string;
  status: string;
  serialNo: string;
  description: string;
  children?: Organization[];
}
