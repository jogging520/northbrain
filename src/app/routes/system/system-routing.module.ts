import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SystemOperationComponent } from './operation/operation.component';
import { SystemUserComponent } from './user/user.component';
import { SystemPrivilegeComponent } from './privilege/privilege.component';
import {OperationResolver} from "@shared/resolvers/system/operation.resolver";
import {UserResolverService} from "@shared/resolvers/general/user-resolver.service";

const routes: Routes = [

  { path: 'operation',
    component: SystemOperationComponent,
    resolve: {operationParams: OperationResolver}
  },
  { path: 'user',
    component: SystemUserComponent,
    resolve: {userParams: UserResolverService}
  },
  { path: 'privilege', component: SystemPrivilegeComponent }
  ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule { }
