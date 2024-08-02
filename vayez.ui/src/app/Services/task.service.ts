import { Injectable } from '@angular/core';
import { Task } from './task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private currentId: number = 0;

  addTask(task: Task): void {
    task.id = this.currentId.toString(); 
    this.tasks.push(task);
    this.currentId++;  
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  getTasksByStatus(status: 'todo' | 'in-progress' | 'finished'): Task[] {
    return this.tasks.filter(task => task.status === status);
  }
}
