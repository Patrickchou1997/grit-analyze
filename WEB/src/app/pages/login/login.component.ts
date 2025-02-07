import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginResponse } from '../../models/login.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      user_name: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.http
        .post<LoginResponse>(environment.API_URL + '/login', loginData)
        .subscribe({
          next: (response) => {
            console.log('Login successful', response);
            localStorage.setItem('grit_token', response.token);
            localStorage.setItem('user_ID', response.result.user_ID);
            localStorage.setItem('user_role', response.result.user_role);
            localStorage.setItem('user_status', response.result.status);
            if (response.result.user_role == 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          },
          error: (error) => alert(`Login failed', ${error.error.error}`),
        });
    }
  }
}
