import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../Services/task.service';
import { Task } from '../../Services/task.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  tasks: { [key: string]: Task[] } = {
    'todo': [],
    'in-progress': [],
    'finished': []
  };

  constructor(private taskService: TaskService) {
    }  //fetch tasks based on their status.

  ngOnInit(): void {
    this.tasks['todo'] = this.taskService.getTasksByStatus('todo');
    this.tasks['in-progress'] = this.taskService.getTasksByStatus('in-progress');
    this.tasks['finished'] = this.taskService.getTasksByStatus('finished');
  }
}// ngOnInit is a lifecycle hook that Angular calls after the component has been initialized.
