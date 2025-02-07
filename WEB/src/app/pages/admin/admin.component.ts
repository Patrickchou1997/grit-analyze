import { Component, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  imports: [
    HttpClientModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  registeredUsers: User[] = [];
  isLoadingUsers: boolean = false;
  isRetraining: boolean = false;
  userId: string = localStorage.getItem('user_ID') ?? '';
  user_status: string = localStorage.getItem('user_status') ?? '';

  displayedColumns: string[] = ['ID', 'Username', 'Name', 'Email', 'Role', 'Approve', 'Delete'];
  dataSource = new MatTableDataSource<User>(this.registeredUsers);
  dataSource_bkup = new MatTableDataSource<User>(this.registeredUsers);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.fetchUsers(this.userId);
  }

  showAlert(message: string) {
    this.snackBar.open(message, 'close', {
      duration: 4000,
      verticalPosition: 'top'
    });
  }

  // Fetch registered users from the API
  fetchUsers(user_ID: string): void {
    this.isLoadingUsers = true;
    const payload = { user_ID };
    this.http
      .post<User[]>(environment.API_URL + '/get_user', payload)
      .subscribe({
        next: (users) => {
          this.registeredUsers = users;
          this.isLoadingUsers = false;
          this.dataSource = new MatTableDataSource<User>(
            this.registeredUsers
          );
          this.dataSource_bkup = new MatTableDataSource<User>(
            this.registeredUsers
          );
          this.ngAfterViewInit();
        },
        error: (error) => {
          console.error('Error fetching users:', error);
          this.isLoadingUsers = false;
        },
      });
  }

  // Approve a registered user
  approveUser(user_ID: string, status: string): void {
    if (confirm(`You want to approve the user, ID: ${user_ID}`)) {
      let new_status: string;
      if (status != 'approved') {
        new_status = 'approved'
      } else {
        new_status = 'pending'
      }
      this.http
        .post(environment.API_URL + '/user_approved', { user_ID: user_ID, status: new_status })
        .subscribe({
          next: () => {
            (new_status == 'approved') ?
              this.showAlert(`Approved user,${user_ID}, successfully!`) : this.showAlert(`Cancel user,${user_ID}, successfully!`);
            this.fetchUsers(this.userId);
          },
          error: (err) => {
            this.showAlert(`Failed to approve user: ${err.error.error}`);
          },
        });
    }
  }

  // Delete a registered user
  deleteUser(user_ID: string): void {
    if (confirm(`You want to delete the user, ID: ${user_ID}`)) {
      this.http
        .post(environment.API_URL + '/user_deleted', { user_ID: user_ID })
        .subscribe({
          next: () => {
            this.showAlert('Deleted user successfully!');
            this.fetchUsers(this.userId);
          },
          error: (err) => {
            this.showAlert(`Failed to delete user: ${err.error.error}`);
          },
        });
    }
  }

  // Trigger model retraining
  retrainModel(): void {
    this.isRetraining = true;
    this.http.post(environment.API_URL + '/retrain_model', {}).subscribe({
      next: () => {
        this.showAlert('Model retraining started successfully!');
        this.isRetraining = false;
      },
      error: (err) => {
        this.showAlert(`Failed to retrain model: ${err.error.error}`);
        this.isRetraining = false;
      },
    });
  }
  txt_filter(value: any) {
    const filteredList = this.registeredUsers.filter(
      (user) =>
        user.user_ID
          .toString()
          .includes(value.target.value.toLowerCase()) ||
        user.first_name
          .toLowerCase()
          .includes(value.target.value.toLowerCase()) ||
        user.last_name
          .toLowerCase()
          .includes(value.target.value.toLowerCase()) ||
        user.email
          .toLowerCase()
          .includes(value.target.value.toLowerCase())
    );
    this.dataSource = new MatTableDataSource<User>(filteredList);

    this.ngAfterViewInit();
  }
  ngAfterViewInit(): void {
    // Initialize paginator after view is initialized
    if (this.paginator) {
      // this.paginator.pageSize = 10;
      this.dataSource.paginator = this.paginator;
    }
  }
}
