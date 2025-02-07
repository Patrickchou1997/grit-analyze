import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router, NavigationEnd, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-bar',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule, // สำหรับใช้ router
  ],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent {
  pageTitle = 'หน้าหลัก'; // ค่าเริ่มต้น

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // เปลี่ยนชื่อ Title ตาม URL
        switch (event.url) {
          case '/login': this.pageTitle = 'Login'; break;
          case '/register': this.pageTitle = 'Register'; break;
          case '/home': this.pageTitle = 'Student Analysis Dashboard'; break;
          case '/admin': this.pageTitle = 'Admin Dashboard'; break;
          default: this.pageTitle = 'Home';
        }
      }
    });
  }

  logout() {
    console.log('ออกจากระบบ');
    this.router.navigateByUrl('/login')
    // เพิ่มโค้ด Logout เช่น localStorage.clear(), this.authService.logout()
  }
}
