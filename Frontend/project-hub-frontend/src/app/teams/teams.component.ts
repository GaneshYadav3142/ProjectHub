import { Component,OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Team } from '../model';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit{
  displayedColumns: string[] = ['teamID', 'teamName', 'projectName','taskTitle','dueDate','status', 'teamMembers','update', 'delete'];
  dataSource: any[] = []
  showUpdateForm:boolean=false
  selectedtaskId:number | null = null
  constructor(public apiService:ApiService,private dialog: MatDialog,private fb: FormBuilder ) {}

  ngOnInit(): void {
    this.fetchTeams();
  }


  toggleUpdateFormVisibility(projectId: number): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.selectedtaskId = projectId;
  }



  fetchTeams(): void {
    this.apiService.fetchTeams().subscribe({
     next:( response:Team[]) => {
      console.log(response)
     
      this.dataSource = response
      console.log(this.dataSource)
      },
      error: error => {
        console.error(error);
      }
  });
  }


  updateTeam():void{

  }

  deleteTeam():void{

  }
}
