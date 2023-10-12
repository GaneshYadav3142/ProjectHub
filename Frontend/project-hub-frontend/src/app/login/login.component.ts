import { Component, OnDestroy } from '@angular/core';
import { ApiService } from '../api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  private unsubscribe$ = new Subject<void>();

  constructor(private fb: FormBuilder, private apiService: ApiService, private router:Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.apiService.login({email, password})
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: response => {
          // Handle successful login response
          console.log('Login successful!', response);
          console.log(response.token)
          localStorage.setItem("token",response.token)
          alert("New user added successfully")
          this.router.navigate(['/dashboard'])
        },
        error: error => {
          // Handle login error
          console.error('Login failed:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  moveToRegister():void{
    this.router.navigate(["/register"])
  }
}
