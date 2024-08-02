import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { ColumnComponent } from './components/column/column.component';
import { TaskComponent } from './components/task/task.component';
import { TaskService } from './Services/task.service';  // Note the correct path
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AddTaskComponent } from './components/add-task/add-task.component';  // If you are using HttpClient

const routes: Routes = [
  { path: 'board', component: BoardComponent },
  { path: 'column', component: ColumnComponent },
  { path: 'task', component: TaskComponent },
  { path: 'add-task', component: AddTaskComponent },
  { path: '', redirectTo: '/board', pathMatch: 'full' } // Default route
];

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    ColumnComponent,
    TaskComponent,
    AddTaskComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule  // If you are using HttpClient
    
  ],
  providers: [TaskService],
  bootstrap: [AppComponent]
})
export class AppModule { }
