import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  isManager: boolean = false;
  showForm: boolean = false;
  teamForm: FormGroup;
  projectForm: FormGroup;
  taskForm: FormGroup;
  users: any[] = []; //
  isTaskFormVisible: boolean = false;
  isTeamFormVisible = false;
  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.isManager = apiService.isManager();
    this.projectForm = this.fb.group({
      proName: ['', Validators.required],
      description: ['', Validators.required],
      srtDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      projectID: ['', Validators.required], // You may need to populate this dynamically based on user's selected project
      assignedTeamMembers: [[]] // Empty array to store assigned member IDs
    });

    this.teamForm = this.fb.group({
      name: ['', Validators.required], // Team name is required
      members: [[], Validators.required], // Array of selected members (use formControlName in your template)
      projectID: ['', Validators.required] // Project ID is required
    });
  }
  dashboardData: { tasks: any[], projects: any[], teams: any[] }[] = [];
  

  ngOnInit(): void {
    this.getDashboardData()
   this.getUsersData()
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  toggleTaskForm(): void {
    this.isTaskFormVisible = !this.isTaskFormVisible;
  }

  

  toggleTeamForm() {
    this.isTeamFormVisible = !this.isTeamFormVisible;
    // You can reset the form if needed: this.teamForm.reset();
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

  getDashboardData():void{
    this.apiService.getDashboardData().subscribe({
      next:data => {
        console.log(data)
        this.dashboardData = [data]
    },
    error:error=>{
             console.log(error)
    }});
  }

  getTitleColor(priority: string): string {
    switch (priority) {
      case 'High':
        return 'red';
      case 'Medium':
        return 'orange';
      case 'Low':
        return 'green';
      default:
        return 'black';
    }
  }

 
// submit from logic for Creating a Project New
  submitForm(): void {
    if (this.projectForm.valid) {
      const { proName, description, srtDate, endDate } = this.projectForm.value;
      const projectData = {
        proName: proName,
        description: description,
        srtDate: srtDate,
        endDate: endDate
      };
  
      this.apiService.createProject(projectData).subscribe({
        next: response => {
          // Handle success response
          console.log('Project created successfully:', response);
          this.getDashboardData();
          // You can also perform actions like updating the UI, showing a success message, etc.
        },
        error: error => {
          // Handle error response
          console.error('Error creating project:', error);
          // You can display an error message to the user or log the error for debugging.
        }
      });
      this.toggleForm
    }
  }
  
  // create task form function lofgic

  createTask(): void {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      taskData.assignedTeamMembers = taskData.assignedTeamMembers.map((id:string) => parseInt(id, 10));

      this.apiService.createTask(taskData).subscribe({
        next:response => {
        console.log('Task created successfully:', response);
        this.getDashboardData()
        // You can handle success, e.g., reset the form and update UI
        this.taskForm.reset();
      },
      error: error => {
        console.error('Error creating task:', error);
      }});

      this.toggleTaskForm()
    }
  }

  createTeam() {
    // Check if the form is valid before making the API request
    if (this.teamForm.valid) {
      const teamData = this.teamForm.value;
      teamData.members = teamData.members.map((id:string) => parseInt(id, 10));
      this.apiService.createTeam(teamData).subscribe({
        next:response => {
        console.log('Team created successfully:', response);
        this.getDashboardData()
        // You can handle success, e.g., reset the form and update UI
        this.teamForm.reset();
      },
      error: error => {
        console.error('Error creating task:', error);
      }});
      
      this.toggleTeamForm(); // Hide the form after team creation
    } 
  }
}
