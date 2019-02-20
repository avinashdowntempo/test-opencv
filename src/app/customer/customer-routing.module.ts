import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerVideoComponent } from './customer-video/customer-video.component';

const routes: Routes = [
  { path: 'customer/:id', component: CustomerVideoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
