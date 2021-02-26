import { BookRideComponent } from './pages/book-ride/book-ride.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { QudosfaveComponent } from './pages/qudosfave/qudosfave.component';
import { CorporateComponent } from './corporate.component';
import { LiveTrackingComponent } from './pages/live-tracking/live-tracking.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TripsComponent } from './pages/trips/trips.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { BankDetailsComponent } from './pages/bank-details/bank-details.component';
import { CardsComponent } from './pages/cards/cards.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { StaffComponent } from './pages/staff/staff.component';
import { NotificationSettingsComponent } from './pages/notification-settings/notification-settings.component';
import { MyUsersComponent } from './pages/my-users/my-users.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { MyQudosFaveComponent } from './pages/my-qudos-fave/my-qudos-fave.component';
import { CompletedTripsComponent } from './pages/completed-trips/completed-trips.component';
import { CancelledTripsComponent } from './pages/cancelled-trips/cancelled-trips.component';
import { RiderSignupComponent } from './pages/rider-signup/rider-signup.component';
import { UserGuard } from '../core/guards/user.guard';

const routes: Routes = [
  {
    path: '',
    component: CorporateComponent,
    children: [
      { path: '', redirectTo: 'live-tracking', pathMatch: 'full' },
      { path: 'live-tracking', component: LiveTrackingComponent, canActivate: [UserGuard] },
      { path: 'scheduled-trips', component: TripsComponent, canActivate: [UserGuard] },
      { path: 'completed-trips', component: CompletedTripsComponent, canActivate: [UserGuard] },
      { path: 'cancelled-trips', component: CancelledTripsComponent, canActivate: [UserGuard] },
      { path: 'qudos-fave', component: QudosfaveComponent, canActivate: [UserGuard] },
      { path: 'my-qudos-fave', component: MyQudosFaveComponent, canActivate: [UserGuard] },
      { path: 'notifications', component: NotificationsComponent, canActivate: [UserGuard] },
      { path: 'notification-settings', component: NotificationSettingsComponent, canActivate: [UserGuard] },
      { path: 'payment-settings', component: SettingsComponent, canActivate: [UserGuard] },
      { path: 'bookRide', component: BookRideComponent, canActivate: [UserGuard] },
      { path: "listCards", component: CardsComponent, canActivate: [UserGuard] },
      { path: "documents", component: DocumentsComponent, canActivate: [UserGuard] },
      { path: "staff", component: StaffComponent, canActivate: [UserGuard] },
      { path: "bank-details", component: BankDetailsComponent, canActivate: [UserGuard] },
      { path: "myUsers", component: MyUsersComponent, canActivate: [UserGuard] },
      { path: "allUsers", component: AllUsersComponent, canActivate: [UserGuard] },
      { path: 'riderSignup', component: RiderSignupComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateRoutingModule { }
