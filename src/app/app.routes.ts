import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { PolicyComponent } from './pages/policy/policy.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent },
  { path: 'landing', component: LandingComponent }, // ✅ Default landing page
  { path: 'policy/:vehicleNumber', component: PolicyComponent }, // ✅ Policy route
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirect unknown routes
];
