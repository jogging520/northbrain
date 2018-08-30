export class Option {
  value: string;
  label: string;
  isLeaf?: boolean;
  children: Array<Option> = [];
}
