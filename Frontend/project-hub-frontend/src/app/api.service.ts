import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, credentials);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }

  getProjects(): Observable<any[]> {
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

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return { headers };
  }
}
