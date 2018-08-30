export class Operation {
  id: string;
  type: string;
  appType?: string;
  category?: string;
  user?: string;
  session?: string;
  businessType: string;
  createTime?: string;
  timestamp?: string;
  status: string;
  description: string;
  children?: Operation[];
}
