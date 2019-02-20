import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgentVideoComponent } from './agent/agent-video/agent-video.component';

const routes: Routes = [
  { path: '', redirectTo: '/agent', pathMatch: 'full' },
  { path: '**', component: AgentVideoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
