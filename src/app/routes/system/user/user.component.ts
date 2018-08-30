import { Component, OnInit } from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {User} from "@shared/models/general/user";
import {UserService} from "@shared/services/general/user.service";
import {tap, map} from "rxjs/operators";
import {CommonService} from "@shared/services/general/common.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslatorService} from "@shared/services/general/translator.service";
import {Region} from "@shared/models/general/region";
// import { bounce } from 'ngx-animate';
import {transition, trigger, useAnimation} from "@angular/animations";
// import {flip, jackInTheBox, tada, zoomIn} from "ngx-animate/lib";
import {CacheService} from "@delon/cache";

@Component({
  selector: 'app-system-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.less'],
  // animations: [
  //   trigger('zoomIn', [transition('* => *', useAnimation(zoomIn,
  //     {params: { timing: 2, delay: 0 }
  //     }))])
  // ],
})
export class SystemUserComponent implements OnInit {
  q: any = {
    ps: 8,
    categories: [],
    owners: ['zxx'],
  };

  tabs: any[] = [];
  users: User[] = [];
  loading = false;
  queryCondition: string = '';

  constructor(public messageService: NzMessageService,
              private router: Router,
              private cacheService: CacheService,
              private activatedRoute: ActivatedRoute,
              private commonService: CommonService,
              private translatorService: TranslatorService,
              private userService: UserService) {
    this.activatedRoute
      .data
      .pipe(map(data => data.userParams))
      .subscribe((data) => {
        this.users = data;
      });
  }

  ngOnInit() {
    this.cacheService
      .get<Region>('region')
      .subscribe(region => {
        this.locateToSpecifiedLevel(region, 'PROVINCE');  //??????
        this.locateToSpecifiedLevel(region, 'CITY');
      });
  }

  private getUsers() {
    this.loading = true;

    this.userService
      .queryUsers()
      .pipe(tap())    //?????????
      .subscribe((users: User[]) => {
          users.forEach((user: User) => {
            if (user.status === 'ACTIVE') {
              user.realName = decodeURIComponent(escape(atob(this.commonService.decrypt(user.realName))));
              this.users.push(user);
            }
          })
        },
        () => {
          this.messageService.warning('获取操作记录数据失败。');
          this.loading = false;
        },
        () => {
          this.loading = false;
        }
      );

    this.loading = false;
  }

  public search(): void {
    this.messageService.warning(this.queryCondition);
    console.log(this.translatorService.getFirstChar(this.queryCondition));
    console.log(this.translatorService.getFullChars(this.queryCondition));
    console.log(this.translatorService.getCamelChars(this.queryCondition));
  }


  private locateToSpecifiedLevel(region: Region, level: string): Region {
    if(region.level === level) {
      this.tabs.push({key: region.code, tab: region.name});
    }

    let reg: Region;

    if (region.children) {
      for (let child of region.children) {
        reg = this.locateToSpecifiedLevel(child, level);

        if (reg)
          return reg;
      }
    }

    return null;
  }

  private createUser(): void {
    this.router.navigate(['/system/privilege']).catch();
  }
}
