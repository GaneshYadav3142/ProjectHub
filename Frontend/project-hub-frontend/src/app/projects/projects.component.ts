import { Component, OnInit,Inject } from '@angular/core';
import { ApiService } from '../api.service';
import { MatDialog, MAT_DIALOG_DATA ,MatDialogRef} from '@angular/material/dialog';
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  proName: string = ''; // Property for project name
  description: string = ''; // Property for project description
  startDate?: Date; // Property for start date
  endDate?: Date; 
  showUpdateForm: boolean = false;
  selectedProjectId: number | null = null;
  dataSource: any[] = []
  displayedColumns: string[] = ['uniqueID','projectName','projectDescription', 'projectDetails','projectUpdate','projectDelete'];
 
  constructor(private apiService:ApiService,private dialog: MatDialog ) { }

  ngOnInit(): void {
    this.fetchProjects();
  }

 

  fetchProjects(): void {
    this.apiService.getProjects().subscribe({
     next: response => {
        this.dataSource = response;
      },
      error: error => {
        console.error(error);
      }
  });
  }

  getProjectsDetails(projectId: number): void {
    // Call the service function to get project details by ID
    this.apiService.getProjectsDetails(projectId).subscribe({
      next: response => {
        // Open a dialog displaying project details
        console.log(response)
        const dialogRef = this.dialog.open(ProjectDetailsDialogComponent, {
          width: '50%',
          data: response,
          
        
        });
        this.fetchProjects();
      },
      error: error => {
        console.error(error);
      }
    });
  }

  toggleUpdateFormVisibility(projectId: number): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.selectedProjectId = projectId;
  }

  closeUpdateForm(): void {
    this.showUpdateForm = false;
    // Additional logic to reset form fields if needed
  }

  createProject(projectData: any): void {
    this.apiService.createProject(projectData).subscribe({
      next:response => {
        // Project created successfully, update the projects list
        this.fetchProjects();
      },
      error:error => {
        console.error(error);
      }
  });
  }

  updateProject1( projectData: any): void {
    if( this.selectedProjectId !== null){
    this.apiService.updateProject(this.selectedProjectId, projectData).subscribe({
      next: response => {
        // Project updated successfully, update the projects list
        console.log(response)
        this.fetchProjects();
      },
      error: error => {
        console.error(error);
      }
  });
}
  }

  deleteProject1(projectId: number): void {
    this.apiService.deleteProject(projectId).subscribe({
      next:response => {
        // Project deleted successfully, update the projects list
        console.log(response)
        this.fetchProjects();
      },
      error:error => {
        console.error(error);
      }
  });
  }

}


@Component({
  selector: 'app-project-details-dialog',
  template: `
    <h1 mat-dialog-title [class.dialog-content]="true" style="margin:15px;color:white;text-align:center">Project Details</h1>
    <div mat-dialog-content style="margin:15px ;color:white">
    <div style="display:flex;justify-content:space-evenly">
    <div>
       <h1>Project Overview</h1>
      <h3>Name: {{ data.name }}</h3>
      <h3>Description: {{ data.description }}</h3>
      <h3>StartDate: {{ data.startDate }}</h3>
      <h3>EndDate: {{ data.endDate }}</h3>
      
      
      </div>
      <div>
      <h1>Project Manager</h1>
      <h3 > {{ data.manager.name }}</h3>
      <h1>Tasks:  {{ data.tasks.length }}</h1>
    </div>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button style="border:none;color:primary;background-color: tomato;margin-left:300px" (click)="closeDialog()">X</button>
    </div>
  `
})
export class ProjectDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProjectDetailsDialogComponent> // Inject MatDialogRef
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}