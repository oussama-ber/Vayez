import { Component, EventEmitter, Output } from '@angular/core';
import { TaskService } from '../../Services/task.service';
import { Task } from '../../Services/task.model';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent {
  @Output() closeEvent = new EventEmitter<void>();

  task: Task = { id: '', title: '', description: '', status: 'todo' };

  constructor(private taskService: TaskService) { }

  addTask(): void {
    this.taskService.addTask(this.task);
    this.task = { id: '', title: '', description: '', status: 'todo' }; // Reset the form
    this.onClose(); // Close the modal after adding the task
  }

  onClose() {
    this.closeEvent.emit();
  }
}
