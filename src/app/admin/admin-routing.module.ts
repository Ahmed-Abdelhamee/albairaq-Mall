import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashComponent } from './dash/dash.component';
import { DiningDashComponent } from './dining-dash/dining-dash.component';
import { EntertainmentDashComponent } from './entertainment-dash/entertainment-dash.component';
import { ServicesDashComponent } from './services-dash/services-dash.component';
import { AboutDashComponent } from './about-dash/about-dash.component';
import { ContactusDashComponent } from './contactus-dash/contactus-dash.component';
import { StoreLocationDashComponent } from './store-location-dash/store-location-dash.component';
import { AccessoriesDashComponent } from './accessories-dash/accessories-dash.component';
import { PerfumesDashComponent } from './perfumes-dash/perfumes-dash.component';
import { ClothingDashComponent } from './clothing-dash/clothing-dash.component';
import { AdminGuard } from './services/admin.guard';
import { OpenningHoursComponent } from '../admin/openning-hours/openning-hours.component';
import { ErrorComponent } from '../components/error/error.component';

const routes: Routes = [
  {
    path:"admin",component:AdminComponent,children:[
      {path:"dash",component:DashComponent,canActivate:[AdminGuard]},
      {path:"dining",component:DiningDashComponent ,canActivate:[AdminGuard]},
      {path:"entertainment",component:EntertainmentDashComponent ,canActivate:[AdminGuard]},
      {path:"services",component:ServicesDashComponent ,canActivate:[AdminGuard]},
      {path:"about",component:AboutDashComponent ,canActivate:[AdminGuard]},
      {path:"contactus",component:ContactusDashComponent ,canActivate:[AdminGuard]},
      {path:"store-location",component:StoreLocationDashComponent ,canActivate:[AdminGuard]},
      {path:"clothing",component:ClothingDashComponent ,canActivate:[AdminGuard]},
      {path:"accessories",component:AccessoriesDashComponent ,canActivate:[AdminGuard]},
      {path:"perfumes",component:PerfumesDashComponent ,canActivate:[AdminGuard]},
      {path:"openning-hours",component:OpenningHoursComponent ,canActivate:[AdminGuard]},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
