import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Wordpress } from '../services/wordpress';

export const authGuard: CanActivateFn = (route, state) => {
  const wordpressService = inject(Wordpress);
  const router = inject(Router);

  // Check if the user is logged in using our service method
  if (wordpressService.isLoggedIn()) {
    return true; // If logged in, allow access to the page
  } else {
    // If not logged in, redirect to the login page
    router.navigate(['/login']);
    return false; // And block access to the requested page
  }
};
