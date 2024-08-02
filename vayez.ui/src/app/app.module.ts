import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { ColumnComponent } from './components/column/column.component';
import { TaskComponent } from './components/task/task.component';
import { TaskService } from './Services/task.service';  // Note the correct path

import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';  // If you are using HttpClient

const routes: Routes = [
  { path: 'board', component: BoardComponent },
  { path: 'column', component: ColumnComponent },
  { path: 'task', component: TaskComponent },
  { path: '', redirectTo: '/board', pathMatch: 'full' } // Default route
];

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    ColumnComponent,
    TaskComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule  // If you are using HttpClient
  ],
  providers: [TaskService],
  bootstrap: [AppComponent]
})
export class AppModule { }
