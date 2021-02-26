import { SocketioService } from '../services/socketio/socketio.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-r';

import { CorporateRoutingModule } from './corporate-routing.module';
import { LiveTrackingComponent } from './pages/live-tracking/live-tracking.component';
import { CorporateComponent } from './corporate.component';
import { BookRideComponent } from './pages/book-ride/book-ride.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { QudosfaveComponent } from './pages/qudosfave/qudosfave.component';
import { TripsComponent } from './pages/trips/trips.component';
import { BankDetailsComponent } from './pages/bank-details/bank-details.component';
import { CardsComponent } from './pages/cards/cards.component';
import { DocumentsComponent } from './pages/documents/documents.component';
import { StaffComponent } from './pages/staff/staff.component';
import { ComboDatepickerModule } from 'ngx-combo-datepicker';
import { NotificationSettingsComponent } from './pages/notification-settings/notification-settings.component';
import { MyUsersComponent } from './pages/my-users/my-users.component';
import { AllUsersComponent } from './pages/all-users/all-users.component';
import { MyQudosFaveComponent } from './pages/my-qudos-fave/my-qudos-fave.component';
import { CompletedTripsComponent } from './pages/completed-trips/completed-trips.component';
import { RiderSignupComponent } from './pages/rider-signup/rider-signup.component';
import { CancelledTripsComponent } from './pages/cancelled-trips/cancelled-trips.component';

/*************** PrimeNg Modules *****************/
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

/**************** Material Modules ******************/
import { MatTabsModule } from '@angular/material/tabs';
import { SafePipeModule } from 'safe-pipe';
import { ListFilterPipe } from '../pipe/list-filter.pipe';


const pages = [
  LiveTrackingComponent,
  CorporateComponent,
  BookRideComponent,
  SettingsComponent,
  NotificationsComponent,
  QudosfaveComponent,
  TripsComponent,
  CardsComponent,
  DocumentsComponent,
  StaffComponent,
  BankDetailsComponent,
  RiderSignupComponent,
  NotificationSettingsComponent,
  MyUsersComponent,
  AllUsersComponent,
  MyQudosFaveComponent,
  CompletedTripsComponent,
  CancelledTripsComponent,
  RiderSignupComponent
]

const thirdParties = [
  NgxIntlTelInputModule,
  MatTabsModule,
  SafePipeModule
]

@NgModule({
  declarations: [...pages, ListFilterPipe],
  imports: [
    CommonModule,
    CorporateRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ComboDatepickerModule,
    CalendarModule,
    DropdownModule,
    ...thirdParties
  ],
  providers: [SocketioService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CorporateModule { }
