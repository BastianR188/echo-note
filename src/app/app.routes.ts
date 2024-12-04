import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainPageComponent } from './components/main-page/main-page.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'notes/:id', component: MainPageComponent },
    // { path: 'trash/:id', component: TrashComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
];
