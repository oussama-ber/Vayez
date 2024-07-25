import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { ColumnComponent } from './components/column/column.component';
import { TaskComponent } from './components/task/task.component';

const routes: Routes = [
  { path: 'board', component: BoardComponent },
  { path: 'column', component: ColumnComponent },
  { path: 'task', component: TaskComponent },
  { path: '', redirectTo: '/board', pathMatch: 'full' }  // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
