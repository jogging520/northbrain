import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import {ActivatedRoute} from "@angular/router";
import {tap, map} from "rxjs/operators";
import {Region} from "@shared/models/general/region";
import {CommonService} from "@shared/services/general/common.service";
import {OrganizationService} from "@shared/services/general/organization.service";

@Component({
  selector: 'app-system-privilege',
  templateUrl: './privilege.component.html',
  styleUrls: ['./privilege.component.less'],
})
export class SystemPrivilegeComponent implements OnInit {

  center: number[] = [103.719156, 36.115523];

  constructor(private http: _HttpClient,
              private modal: ModalHelper,
              private commonService: CommonService,
              private organizationService: OrganizationService) { }

  ngOnInit() { }


  private onRegionCode(event: any): void {
    console.log(event);
  }

  private onRegionCenter(event: any): void {
    console.log(event);
    this.center = event;
  }

  private onOrganizationCode(event: any): void {
    console.log(event);
  }
}
