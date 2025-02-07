import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { EMP } from '../../../models/employment.model';
import { GRIT } from '../../../models/grit.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dialog-student',
  imports: [
    MatDialogClose,
    MatButtonModule,
    CommonModule,
    HttpClientModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-student.component.html',
  styleUrl: './dialog-student.component.css',
})
export class DialogStudentComponent {
  data = inject(MAT_DIALOG_DATA);
  isLoadingEMP = false;
  isLoadingGRIT = false;
  constructor(private http: HttpClient) { }

  calculate(i: any) {
    const num = +i;
    return num.toFixed(3);
  }
  calculateProp(i: any) {
    const num = +i * 100;
    return num.toFixed(2);
  }

  async analysisEMP(std_ID: any) {
    this.isLoadingEMP = true;
    const payload = { student_ID: std_ID };
    this.http
      .post<EMP>(environment.API_URL + '/get_emp', payload)
      .subscribe({
        next: (response) => {
          this.data.emp_opp = response.emp_opp;
          this.data.un_emp_opp = response.un_emp_opp;
        },
        error: (err) => {
          console.error('Failed to fetch student list', err);
        },
      });
  }

  async analysisGRIT(std_ID: any) {
    this.isLoadingGRIT = true;

    await this.analysisEMP(std_ID);
    const payload = { student_ID: std_ID };
    this.http
      .post<GRIT>(environment.API_URL + '/get_grit', payload)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.data.grit_all = response.grit_all;
          this.data.grit_passion = response.passion;
          this.data.grit_perseverance = response.perseverance;
          this.data.grit_analysis = response.message;
          this.isLoadingGRIT = false;
        },
        error: (err) => {
          console.error('Failed to fetch student list', err);
        },
      });
  }
}
