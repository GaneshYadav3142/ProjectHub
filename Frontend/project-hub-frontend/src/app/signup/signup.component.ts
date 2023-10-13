import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  roleOptions: string[] = ['Admin', 'Project manager', 'Team member'];
  constructor(private fb: FormBuilder, private apiService: ApiService, private router:Router,private _snackBar: MatSnackBar) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      role: [this.roleOptions[0], []]
    });
  }
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top'; 
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
          this._snackBar.open("User Registered", "OK",{
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition
          });
          this.router.navigate(['/login'])
        },
        error: error => {
          // Handle signup error
          console.error('Signup failed:', error);
          this._snackBar.open("Sign Failed", "Retry",{
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition
          });
        }
      });
  }

  moveToLogin():void {
    this.router.navigate(["/login"])
  }
}
