import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SystemRoutingModule } from './system-routing.module';
import { SystemOperationComponent } from './operation/operation.component';
import { SystemUserComponent } from './user/user.component';
import { SystemPrivilegeComponent } from './privilege/privilege.component';
import { SystemViewComponent } from './operation/view/OperationView.component';

const COMPONENTS = [
  SystemOperationComponent,
  SystemUserComponent,
  SystemPrivilegeComponent,
  SystemViewComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    SystemRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class SystemModule { }
