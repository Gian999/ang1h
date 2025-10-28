import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { DriverService } from '../services/driver.service';

export const driverGuard: CanActivateFn = () => {
  const driverService = inject(DriverService);
  const router = inject(Router);

  if (driverService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/driver/login']);
  return false;
};
