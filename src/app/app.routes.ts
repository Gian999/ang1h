import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { driverGuard } from './core/guards/driver.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/pages/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/pages/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/pages/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'card',
    canActivate: [authGuard],
    children: [
      {
        path: 'my-card',
        loadComponent: () => import('./features/card/pages/my-card.component').then(m => m.MyCardComponent)
      },
      {
        path: 'recharge',
        loadComponent: () => import('./features/card/pages/recharge.component').then(m => m.RechargeComponent)
      },
      {
        path: 'scan-qr',
        loadComponent: () => import('./features/card/pages/scan-qr.component').then(m => m.ScanQRComponent)
      },
      {
        path: 'pay-fare',
        loadComponent: () => import('./features/card/pages/pay-fare.component').then(m => m.PayFareComponent)
      },
      {
        path: 'movements',
        loadComponent: () => import('./features/card/pages/movements.component').then(m => m.MovementsComponent)
      },
      {
        path: '',
        redirectTo: 'my-card',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'map',
    canActivate: [authGuard],
    loadComponent: () => import('./features/map/pages/map-view.component').then(m => m.MapViewComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/pages/profile.component').then(m => m.ProfileComponent)
  },
  // Driver routes
  {
    path: 'driver',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/driver/pages/driver-welcome.component').then(m => m.DriverWelcomeComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/driver/pages/driver-register/driver-register.component').then(m => m.DriverRegisterComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./features/driver/pages/driver-login/driver-login.component').then(m => m.DriverLoginComponent)
      },
      {
        path: 'map',
        canActivate: [driverGuard],
        loadComponent: () => import('./features/driver/pages/driver-map/driver-map.component').then(m => m.DriverMapComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
