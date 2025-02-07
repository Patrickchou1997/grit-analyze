import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [
    HttpClientModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      user_name: ['', Validators.required],
      password: ['', Validators.required],
      user_role: ['user', Validators.required],
    });
  }

  register() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      this.http
        .post(environment.API_URL+'/register', registerData)
        .subscribe({
          next: (response) => {
            console.log('Registration successful', response);
            this.router.navigate(['/login']);
          },
          error: (error) => console.error('Registration failed', error),
        });
    }
  }
}
