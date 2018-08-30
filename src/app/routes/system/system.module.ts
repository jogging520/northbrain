import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SystemRoutingModule } from './system-routing.module';
import { SystemOperationComponent } from './operation/operation.component';
import { SystemUserComponent } from './user/user.component';
import { SystemPrivilegeComponent } from './privilege/privilege.component';
import { SystemOperationViewComponent } from './operation/view/view.component';

const COMPONENTS = [
  SystemOperationComponent,
  SystemUserComponent,
  SystemPrivilegeComponent
];
const COMPONENTS_NOROUNT = [
  SystemOperationViewComponent];

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
