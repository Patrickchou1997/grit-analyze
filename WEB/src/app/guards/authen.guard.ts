import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authenGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('grit_token');

  if (!token || tokenExpired(token)) {
    router.navigateByUrl('/login');
    return false; // ป้องกันไม่ให้เข้าถึง route นั้น
  } else {
  }
  return true; // สามารถเข้าถึง route ได้
};

function tokenExpired(token: any) {
  const expiry = JSON.parse(atob(token.split('.')[1])).exp;
  return Math.floor(new Date().getTime() / 1000) >= expiry;
}
