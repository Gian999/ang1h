import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
  {
    path: '**',
    redirectTo: ''
  }
];

