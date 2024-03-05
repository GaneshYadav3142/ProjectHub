import { Component, OnDestroy } from '@angular/core';
import { ApiService } from '../api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-otp',
  templateUrl: './otp-component.component.html',
  styleUrls: ['./otp-component.component.css']
})
export class OtpComponent implements OnDestroy {
  otpForm: FormGroup;
  private unsubscribe$ = new Subject<void>();
  email: string ="";

  constructor(
    private fb: FormBuilder, 
    public apiService: ApiService, 
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required]]
    });
  }
 
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top'; 
  durationInSeconds = 5;
  
  ngOnInit(): void {
    // Retrieve email from route parameters
    this.route.params.subscribe(params => {
      this.email = params['email'];
    });
  }
  
  onSubmit(): void {
    if (this.otpForm.invalid) {
      return;
    }

    const otp = this.otpForm.get('otp')?.value;
    
    verifyOTP(otp:number): void {
        this.apiService.verifyOTP(otp)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: response => {
          // Handle successful OTP verification response
          console.log('OTP verification successful!', response);
          // Proceed with necessary actions after OTP verification
          this._snackBar.open("OTP verified successfully!", "OK", {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: this.durationInSeconds * 1000,
          });
          this.router.navigate(['/dashboard'])
        },
        error: error => {
          // Handle OTP verification error
          console.error('OTP verification failed:', error);
          this._snackBar.open("OTP verification failed", "Retry", {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition
          });
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  moveToLogin(): void {
    this.router.navigate(['/login']);
  }
}
