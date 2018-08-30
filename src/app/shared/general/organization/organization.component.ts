import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Organization} from "@shared/models/general/organization";
import {Option} from "@shared/models/general/option";
import {CacheService} from "@delon/cache";

@Component({
  selector: 'app-nb-organization',
  templateUrl: './organization.component.html',
  styles: []
})
export class OrganizationComponent implements OnInit {

  //输入的顶级组织机构编码
  @Input() topCode: string;
  //输入的默认的组织机构编码
  @Input() defaultCode: string;
  //输出的选中的组织机构编码
  @Output() code: EventEmitter<string> = new EventEmitter();

  //组织机构属性
  organizationOptions: any[]  = [] ;
  //选择的组织机构
  selectedOrganization: any[];

  constructor(
    private cacheService: CacheService
  ) { }

  ngOnInit() {
    this.cacheService
      .get<Organization>('organization')
      .subscribe(organization => {
        let options = this.transform(this.locate(organization, this.topCode));

        if (options)
          this.organizationOptions.push(options);
      });

  }

  /**
   * 方法：级联列表清空时候的事件处理
   * @param event 事件
   */
  onClear(event: any): void {
    this.code.emit(this.defaultCode);
  }

  /**
   * 方法：级联列表改变时候的事件处理
   * @param event 事件
   */
  onChanges(event: any): void {
    this.code.emit(this.selectedOrganization[this.selectedOrganization.length-1]);//???
  }

  /**
   * 方法：根据编号递归查找具体的组织机构位置
   * @param {Organization} organization 组织机构
   * @param {string} code 编码
   * @return {Organization} 定位到的组织机构
   */
  private locate(organization: Organization, code: string): Organization {
    if (!organization || !code)
      return null;

    if (organization.code === code || code === '0')
      return organization;

    let org: Organization;

    if (organization.children) {
      for (let child of organization.children) {
        org = this.locate(child, code);

        if (org)
          return org;
      }
    }

    return null;
  }

  /**
   * 方法：将organization转换成option（级联选择器）
   * @param {Organization|Region} organization 组织机构
   * @return {Option} 级联选择器的选项
   */
  private transform(organization: Organization): Option {

    if(!organization)
      return null;

    let option: any = new Option();

    option.value = organization.code;
    option.label = organization.name;

    if (!organization.children) {
      option.isLeaf = true;

      return option;
    } else {
      for (let child of organization.children) {
        option.children.push(this.transform(child));
      }
    }

    return option;
  }
}
