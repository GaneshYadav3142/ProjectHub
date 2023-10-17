import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { MatDialog } from '@angular/material/dialog';
import { Task } from '../model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit{
  displayedColumns: string[] = ['taskID', 'title', 'priority','status', 'update', 'delete','progressSpinner'];
  dataSource: any[] = []
  showUpdateForm:boolean=false
  selectedtaskId:number | null = null
  taskForm: FormGroup;
  users:any[]=[]
  constructor(public apiService:ApiService,private dialog: MatDialog,private fb: FormBuilder ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      projectID: ['', Validators.required], // You may need to populate this dynamically based on user's selected project
      assignedTeamMembers: [[]] // Empty array to store assigned member IDs
    });
   }

  ngOnInit(): void {
    this.fetchTasks();
    this.getUsersData()
  }

  toggleUpdateFormVisibility(projectId: number): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.selectedtaskId = projectId;
  }


  fetchTasks(): void {
    this.apiService.fetchTasks().subscribe({
     next:( response:Task[]) => {
      console.log(response)
     
      this.dataSource = response
      console.log(this.dataSource)
      },
      error: error => {
        console.error(error);
      }
  });
  }

  getUsersData(): void {
    this.apiService.getUsersData().subscribe({
      next:(data: any[]) => {
        this.users = data; // Populate the users array with the response from the API
      },
      error:(error) => {
        console.error(error);
        // Handle error if necessary
      }}
    );
  }

  updateTask():void {
    if( this.selectedtaskId !== null){
      if (this.taskForm.valid) {
        const taskData = this.taskForm.value;
        taskData.assignedTeamMembers = taskData.assignedTeamMembers.map((id:string) => parseInt(id, 10));
  
        this.apiService.updateTask(this.selectedtaskId,taskData).subscribe({
          next:response => {
          console.log('Task updated successfully:', response);
          this.fetchTasks()
          // You can handle success, e.g., reset the form and update UI
          this.taskForm.reset();
        },
        error: error => {
          console.error('Error creating task:', error);
        }});
  
        
      }
  }
  }

  // Delete Task function
  deleteTask(taskID: number) {
    this.apiService.deleteTask(taskID).subscribe({
      next:response => {
        // Project deleted successfully, update the projects list
        console.log(response)
        this.fetchTasks();
      },
      error:error => {
        console.error(error);
      }
  });
  }


}
