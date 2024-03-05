import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import  jwtDecode from 'jwt-decode'
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
   
  private apiUrl = 'http://localhost:3000'

  constructor(private http: HttpClient) { }

  // login and signup funtions
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, credentials);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }


  // projects realted functions
  fetchProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects/`, this.getHeaders());
  }

  createProject(projectData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/projects/create`, projectData, this.getHeaders());
  }

  updateProject(projectId: number, projectData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/projects/${projectId}`, projectData, this.getHeaders());
  }

 getProjectsDetails(projectId: number):Observable<any>{
  return this.http.get<any>(`${this.apiUrl}/projects/${projectId}`,  this.getHeaders());
 }

  deleteProject(projectId: number): Observable<any> {
    
    return this.http.delete<any>(`${this.apiUrl}/projects/${projectId}`, this.getHeaders());
  }

  // dashboard functions

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/`, this.getHeaders());
  }

  getUsersData():Observable<any>{
    return this.http.get(`${this.apiUrl}/users/`,this.getHeaders())
  }

  createTask(taskData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tasks/create`, taskData,this.getHeaders());
  }

  

  createTeam(teamData:any):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/teams/create`,teamData,this.getHeaders())
  }

  // Task 
  fetchTasks():Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/tasks/`,this.getHeaders())
  }

  updateTask(taskID:number,taskData:number):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/tasks/${taskID}`,taskData,this.getHeaders())
  }

  editTask(taskID:number,taskData:number):Observable<any>{
    return this.http.patch<any>(`${this.apiUrl}/tasks/${taskID}`,taskData,this.getHeaders())
  }

  deleteTask(tasKID:number):Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/tasks/${tasKID}`,this.getHeaders())
  }

  //create teams

  fetchTeams():Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/teams/`,this.getHeaders())
  }


//otp form

verifyOTP(otp:number):Observable<any>{
  return this.http.post<any>(`${this.apiUrl}/users/:email`,this.getHeaders())
}

  
  
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }


  isManager(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role === 'Project manager';
    }
    return false;
  }

  

 
}
