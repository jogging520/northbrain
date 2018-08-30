import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Organization} from "@shared/models/general/organization";
import {Option} from "@shared/models/general/option";
import {Region} from "@shared/models/general/region";
import {CacheService} from "@delon/cache";

@Component({
  selector: 'app-nb-region',
  templateUrl: './region.component.html',
  styles: []
})
export class RegionComponent implements OnInit {

  //输入的顶级区域编码
  @Input() topCode: string;
  //输入的默认的区域编码
  @Input() defaultCode: string;
  //输入的默认的中心经纬度
  @Input() defaultCenter: number[];
  //输出的选中的区域编码
  @Output() code: EventEmitter<string> = new EventEmitter();
  //输出的选中的中心经纬度
  @Output() center: EventEmitter<number[]> = new EventEmitter();

  //区域属性
  regionOptions: any[]  = [];
  //选择的区域
  selectedRegion: any[];
  //选择的经纬度
  selectedCenter: number[];

  constructor(
    private cacheService: CacheService
  ) { }

  ngOnInit() {
    this.cacheService
      .get<Region>('region')
      .subscribe(region => {
        let options = this.transform(this.locate(region, this.topCode));

        if (options)
          this.regionOptions.push(options);
      });
  }

  /**
   * 方法：级联列表清空时候的事件处理
   * @param event 事件
   */
  onClear(event: any): void {
    this.code.emit(this.defaultCode);
    this.center.emit(this.defaultCenter);
  }

  /**
   * 方法：级联列表改变时候的事件处理
   * @param event 事件
   */
  onChanges(event: any): void {
    if (event) {
      this.getLongitudeAndLatitude(this.selectedRegion[this.selectedRegion.length-1]);
      this.code.emit(this.selectedRegion[this.selectedRegion.length-1]);
      this.center.emit(this.selectedCenter);
    } else {
      this.code.emit(this.defaultCode);
      this.center.emit(this.defaultCenter);
    }
  }

  /**
   * 方法：根据编号递归查找具体的区域位置
   * @param {code} region 区域编码
   * @param {string} code 编码
   * @return {Organization} 定位到的区域
   */
  private locate(region: Region, code: string): Region {
    if(region.code === code || code === '0')
      return region;

    let reg: Region;

    if (region.children) {
      for (let child of region.children) {
        reg = this.locate(child, code);

        if (reg)
          return reg;
      }
    }

    return null;
  }

  /**
   * 方法：将region转换成option（级联选择器）
   * @param {Region} region 区域
   * @return {Option} 级联选择器的选项
   */
  private transform(region: Region): Option {

    if(!region)
      return null;

    let option: any = new Option();

    option.value = region.code;
    option.label = region.name;

    if (!region.children) {
      option.isLeaf = true;

      return option;
    } else {
      for (let child of region.children) {
        option.children.push(this.transform(child));
      }
    }

    return option;
  }

  /**
   * 方法：获取经纬度
   * @param {string} code 区域编码
   */
  private getLongitudeAndLatitude(code: string): void {
    this.cacheService
      .get<Region>('region')
      .subscribe((region: Region) => {
        let locatedRegion: Region = this.locate(region, code);

        if (locatedRegion)
          this.selectedCenter = [locatedRegion.longitude, locatedRegion.latitude];
        else
          this.selectedCenter = this.defaultCenter;
      })
  }
}
