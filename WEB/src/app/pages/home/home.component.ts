import { Component, ViewChild, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogStudentComponent } from './dialog-student/dialog-student.component';
import { GritResponse } from '../../models/grit.model';
import { StudentModel } from '../../models/student.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  myControl = new FormControl('');
  student_list: StudentModel[] = [];
  filteredOptions: Observable<StudentModel[]> | undefined;
  selected_student: StudentModel | undefined;
  gritResponse: GritResponse | null = null;
  disabled: boolean = true;

  displayedColumns: string[] = ['Image', 'Student ID', 'Name', 'Email', 'Year'];
  dataSource = new MatTableDataSource<StudentModel>(this.student_list);
  dataSource_bkup = new MatTableDataSource<StudentModel>(this.student_list);

  readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<StudentModel[]>(environment.API_URL+'/get_student')
      .subscribe({
        next: (data) => {
          this.student_list = data;
          this.dataSource = new MatTableDataSource<StudentModel>(
            this.student_list
          );
          this.dataSource_bkup = new MatTableDataSource<StudentModel>(
            this.student_list
          );
          this.ngAfterViewInit();
        },
        error: (err) => {
          console.error('Failed to fetch student list', err);
        },
      });
  }

  ngAfterViewInit(): void {
    // Initialize paginator after view is initialized
    if (this.paginator) {
      // this.paginator.pageSize = 10;
      this.dataSource.paginator = this.paginator;
    }
  }

  txt_filter(value: any) {
    const filteredList = this.student_list.filter(
      (student) =>
        student.student_ID
          .toString()
          .includes(value.target.value.toLowerCase()) ||
        student.first_name
          .toLowerCase()
          .includes(value.target.value.toLowerCase()) ||
        student.last_name
          .toLowerCase()
          .includes(value.target.value.toLowerCase())
    );
    this.dataSource = new MatTableDataSource<StudentModel>(filteredList);

    this.ngAfterViewInit();
  }

  selected(student: StudentModel) {
    this.disabled = false;
    this.selected_student = student;
    this.dialog.open(DialogStudentComponent, {
      data: student,
      maxWidth: '90vw',
      maxHeight: '90vh',
      height: '100%',
      width: '100%',
    });
  }

  upload() {
    console.log(this.selected_student);
    if (!this.selected_student) return;
    const payload = { student_ID: this.selected_student.student_ID };
    this.http
      .post<GritResponse>(environment.API_URL+'/grit_home', payload)
      .subscribe({
        next: (response) => {
          this.gritResponse = response;
          console.log('Grit data received:', response);
        },
        error: (err) => {
          console.error('Failed to fetch grit data', err);
        },
      });
  }
  calculate_gritscore(score: number) {
    if (score >= 3.5) {
      return 'High-gritty';
    } else {
      return 'Low-gritty';
    }
  }
}
