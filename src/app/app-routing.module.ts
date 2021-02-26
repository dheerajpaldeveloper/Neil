import { CorporateSignupComponent } from './pages/corporate-signup/corporate-signup.component';
import { LoginComponent } from './pages/login/login.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', redirectTo: 'corporate_login', pathMatch: 'full' },
  { path: 'corporate_login', component: LoginComponent },
  { path: 'corporate_signup', component: CorporateSignupComponent },
  { path: 'corporate', loadChildren: () => import('./corporate/corporate.module').then(m => m.CorporateModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
