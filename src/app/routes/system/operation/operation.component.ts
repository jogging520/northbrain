import {Component, OnInit, ViewChild} from '@angular/core';
import { ModalHelper } from '@delon/theme';
import { SimpleTableColumn, SimpleTableComponent } from '@delon/abc';
import {OperationService} from "@shared/services/general/operation.service";
import {Operation} from "@shared/models/general/operation";
import {NzMessageService} from "ng-zorro-antd";
import {tap, map} from "rxjs/operators";
import {CommonService} from "@shared/services/general/common.service";
import {ActivatedRoute} from "@angular/router";
import {SystemOperationViewComponent} from "./view/view.component";

@Component({
  selector: 'app-system-operation',
  templateUrl: './operation.component.html',
})
export class SystemOperationComponent implements OnInit {

  //查询组合条件
  conditions: any = {};
  //渠道类型（应用类型）
  channelTypes = [];
  //业务类型
  businessTypes = [];
  //全量用户
  users = [];
  //操作记录数据
  operations: Operation[] = [];
  //加载中状态
  loading = false;

  @ViewChild('st') st: SimpleTableComponent;
  columns: SimpleTableColumn[] = [
    { title: '操作编号', index: 'id' },
    { title: '操作人员',
      index: 'user',
      format: (operation: Operation) => {  //format????

        let formattedUser = '';

        this.users
          .forEach((user, index, array) => {
            if (operation.user.toLocaleUpperCase() === user.value.toLocaleUpperCase())
              formattedUser = user.text;
          });

        return formattedUser;
      }
    },
    { title: '渠道类型',
      index: 'appType',
      format: (operation: Operation) => {
        let formattedAppType = '';

        this.channelTypes
          .forEach((channelType, index, array) => {
            if (operation.appType.toLocaleUpperCase() === channelType.value.toLocaleUpperCase())
              formattedAppType = channelType.text;
          });

        return formattedAppType;
      }
    },
    { title: '业务类型',
      index: 'businessType',
      format: (operation: Operation) => {
        let formattedBusinessType = '';

        this.businessTypes
          .forEach((businessType, index, array) => {
            if (operation.businessType.toLocaleUpperCase() === businessType.value.toLocaleUpperCase())
              formattedBusinessType = businessType.text;
          });

        return formattedBusinessType;
      }
    },
    { title: '操作时间',
      type: 'date',
      index: 'createTime',
      sorter: (a: any, b: any) => a.createTime - b.createTime,//??
    },
    {
      title: '操作',
      buttons: [
        { text: '详情', type: 'static', component: SystemOperationViewComponent, click: 'reload' }
        // { text: '查看', click: (item: any) => `/form/${item.id}` },
        // { text: '编辑', type: 'static', component: FormEditComponent, click: 'reload' },
      ]
    }
  ];

  constructor(private modal: ModalHelper,
              public messageService: NzMessageService,
              private activatedRoute: ActivatedRoute,
              private operationService: OperationService
  ) {
    this.activatedRoute
      .data
      .pipe(map(data => data.operationParams))
      .subscribe((data) => {
        this.channelTypes = data.channelTypes;
        this.businessTypes = data.businessTypes;
        this.users = data.users;
      });
  }

  ngOnInit() {
    this.queryDefaultOperations();
  }

  /**
   * 方法：默认初始化查询操作记录
   */
  private queryDefaultOperations(): void {
    this.conditions.fromCreateTime = CommonService.lastDate();
    this.conditions.toCreateTime = CommonService.currentDate();
    this.queryOperations();
  }

  /**
   * 方法：根据组合条件查询操作记录
   */
  private queryOperations(): void {
    let data = [];

    this.loading = true;

    this.operationService
      .queryOperations(this.conditions)
      .pipe(tap())
      .subscribe((operation: Operation) => {
          if (operation.status === 'ACTIVE') {
            data.push(operation);
          }},
        () => {
          this.messageService.warning('获取操作记录数据失败。');
          this.loading = false;
        },
        () => {
          this.operations = data;
          this.loading = false;
        }
      )
  }

  /**
   * 方法：createTime时间提取器点击确认后的事件
   * @param event 事件
   */
  private onCreateTimeOk(event: any): void {
    this.conditions.fromCreateTime = event[0];
    this.conditions.toCreateTime = event[1];
  }

  /**
   * 方法：createTime时间提取器时间变更后的事件
   * @param event 事件
   */
  private onCreateTimeChange(event: any): void {
    this.conditions.fromCreateTime = event[0];
    this.conditions.toCreateTime = event[1];
  }

  private onModelChange(event: any): void {
    console.log(event);
    console.log(this.conditions);
  }
}
