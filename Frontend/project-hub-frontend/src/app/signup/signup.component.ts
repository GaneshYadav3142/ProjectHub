import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  roleOptions: string[] = ['Admin', 'Project manager', 'Team member'];
  constructor(private fb: FormBuilder, private apiService: ApiService, private router:Router) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      role: [this.roleOptions[0], []]
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }

    const { name, email, password, role } = this.signupForm.value;

    this.apiService.signup({ name, email, password, role })
      .subscribe({
        next: response => {
          // Handle successful signup response
          console.log('Signup successful!', response);
          
        },
        error: error => {
          // Handle signup error
          console.error('Signup failed:', error);
        }
      });
  }

  moveToLogin():void {
    this.router.navigate(["/login"])
  }
}
