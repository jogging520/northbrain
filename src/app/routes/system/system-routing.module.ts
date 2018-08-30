import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SystemOperationComponent } from './operation/operation.component';
import { SystemUserComponent } from './user/user.component';
import { SystemPrivilegeComponent } from './privilege/privilege.component';
import { SystemViewComponent } from './operation/view/OperationView.component';

const routes: Routes = [

  { path: 'operation', component: SystemOperationComponent },
  { path: 'user', component: SystemUserComponent },
  { path: 'privilege', component: SystemPrivilegeComponent },
  { path: 'view', component: SystemViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule { }
