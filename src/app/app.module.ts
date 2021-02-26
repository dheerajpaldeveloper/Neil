import { CoreModule } from './core/core.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-r';
import { ComboDatepickerModule } from 'ngx-combo-datepicker';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoginComponent } from './pages/login/login.component';
import { CorporateSignupComponent } from './pages/corporate-signup/corporate-signup.component';

import * as $ from 'jquery';

const thirdParties = [
  NgxIntlTelInputModule,
  ComboDatepickerModule,
  CalendarModule,
  DropdownModule
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CorporateSignupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      maxOpened: 1,
    }), // ToastrModule added
    CoreModule,
    ...thirdParties
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


