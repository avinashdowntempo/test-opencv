import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgentVideoComponent } from './agent-video/agent-video.component';

const routes: Routes = [
  { path: 'agent', component: AgentVideoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentRoutingModule { }
