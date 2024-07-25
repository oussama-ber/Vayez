import { Injectable } from '@angular/core';
import { Task } from './task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [
    { id: '1', title: 'Task 1', description: 'Description 1', status: 'todo' },
    { id: '2', title: 'Task 2', description: 'Description 2', status: 'in-progress' },
    { id: '3', title: 'Task 3', description: 'Description 3', status: 'finished' }
  ];

  getTasks(): Task[] {
    return this.tasks;
  }
  getTasksByStatus(status: 'todo' | 'in-progress' | 'finished'): Task[] {
    return this.tasks.filter(task => task.status === status);
  }
}
