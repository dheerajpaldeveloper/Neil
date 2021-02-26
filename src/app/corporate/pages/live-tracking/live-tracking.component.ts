import { UtilityService } from './../../../core/services/utility/utility.service';
import { HttpService } from './../../../services/http/http.service';
import { environment } from 'src/environments/environment';
import { SocketioService } from '../../../services/socketio/socketio.service';
import { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import * as moment from 'moment';
import * as _ from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input-r';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';



declare const jQuery: any;
declare const Stripe: any;
declare const google: any;
const $: any = jQuery;

var stop: any = 0;
var markers = [];
var ongoingDriverIds = [];
var haightAshbury = { lat: 37.769, lng: -122.446 };
var gettingDrivers;
var card;
var rotation = 0;
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();
var marker;
var map;
var bounds = new google.maps.LatLngBounds();
var zoomlevel;
@Component({
  selector: "app-live-tracking",
  templateUrl: "./live-tracking.component.html",
  styleUrls: ["./common.component.scss","./live-tracking.component.scss", "./live-tracking-dynamic.component.scss"],
})

export class LiveTrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  loadings: boolean;
  session_id: number;
  requestLoader: number;
  lastToastRef;

  active_trip_data = ''; // variable store the data of currently opened ride
  active_trip_tab: number = 0; // variable store the data of currently opened tab

  health_policy_checkbox: boolean = false;
  newRideMode: boolean = false;

  completedCurrentPage: number;
  completedPages: number;
  totalItemsCompleted: number;
  completedFrom: number;
  completedTo: number;
  hidePrevcompleted: number;
  hideNextcompleted: number;
  completedRides: Array<any> = [];

  scheduledCurrentPage: number;
  scheduledPages: number;
  totalItemsScheduled: number;
  scheduledFrom: number;
  scheduledTo: number;
  hidePrevscheduled: number;
  hideNextscheduled: number;
  scheduledrides: Array<any> = [];

  availableFrom: number = 0;
  availableTo: number = 0;
  countAvailableCars: number = 0;
  hidePrevsAV: any;
  availableCurrentPage: number;
  hideNextAV: any;
  availableCarsPages: number;

  regularFrom: number;
  regularTo: number;
  totalItemsRegular: number;
  hidePrev: number;
  hideNext: number;
  regularCurrentPage: number;
  regularPages: number;
  regular_rides: Array<any> = [];

  classExpandnumber: number;
  classExpand: any;
  tripDetailMode: boolean;
  returnRideMode: boolean;


  qudos_essential: any;
  DisableSRR: boolean;
  ride_essential: any;

  user_name: string;
  user_mobile: string;
  user_image: string;
  car_name: string;
  showStatus: string;
  pickup_location_address: string;
  manual_destination_address: string;
  rideMissed: string;
  driver_name: string;
  driver_mobile: string;
  driver_image: string;
  driverNames: any;
  payment_date: any;
  tzName: string;
  schedule_calender_accept_time: any;
  pickup_time_raw: any;

  driver1: string;
  driver2: string;
  driver3: string;
  driverrec2: number;
  driverrec3: number;

  MapShow: any = true;
  searchLocation: string;
  searchDriver: string;
  driverEnable: any = 0;

  CarShow: any = false;
  DirectionShow: any;
  force: any;

  UserShow: any = false;

  rideInFocus: any = {
    car_name: "",
    car_make: "",
    car_no: 0,
  };
  ride_status: any;
  rideText: string;
  is_schedule: any;
  bookingDate: Date = new Date();

  left: any = {};
  carsOptions: Array<any> = [
    { 'car_type': 1, 'car_name': 'Q3', 'car_select': 'QS Select', 'car_text': 'max 4 seats' },
    { 'car_type': 2, 'car_name': 'Q5', 'car_select': 'QLE Select', 'car_text': 'max 4 seats' },
    { 'car_type': 3, 'car_name': 'Q3 LUXE', 'car_select': 'GRANDE Select', 'car_text': 'max 4 seats' },
    { 'car_type': 4, 'car_name': 'Q5 LUXE', 'car_select': 'WAV Select', 'car_text': 'max 4 seats' },
    { 'car_type': 5, 'car_name': 'Q3 WAV', 'car_select': 'LUXE Select', 'car_text': 'max 4 seats' },
    { 'car_type': 6, 'car_name': 'Q3 Elite', 'car_select': 'QXL Select', 'car_text': 'max 4 seats' },
    { 'car_type': 7, 'car_name': 'Q8', 'car_select': 'ELITE Select', 'car_text': 'max 4 seats' },
  ];

  carDriverOptions: Array<any> = [
    { 'car_type': 1, 'car_name': 'Prefer Q3 Faves', 'car_select': 'QS Select', 'car_text': 'max 4 seats' },
    { 'car_type': 2, 'car_name': 'Prefer Q5 Faves', 'car_select': 'QLE Select', 'car_text': 'max 4 seats' },
    { 'car_type': 3, 'car_name': 'Prefer Q3 LUXE Faves', 'car_select': 'GRANDE Select', 'car_text': 'max 4 seats' },
    { 'car_type': 4, 'car_name': 'Prefer Q5 LUXE Faves', 'car_select': 'WAV Select', 'car_text': 'max 4 seats' },
    { 'car_type': 5, 'car_name': 'Prefer Q3 WAV Faves', 'car_select': 'LUXE Select', 'car_text': 'max 4 seats' },
    { 'car_type': 6, 'car_name': 'Prefer Q3 Elite Faves', 'car_select': 'QXL Select', 'car_text': 'max 4 seats' },
    { 'car_type': 7, 'car_name': 'Prefer Q8 Faves', 'car_select': 'ELITE Select', 'car_text': 'max 4 seats' },
  ];

  carType(index, item) {
    return item.car_type;
  }

  routeState: any = {
    id: null
  };

  myQudosMode: any;
  UserQudosMode: any;
  AllQudosMode: any;

  searchmyuser: string;
  searchlistuser: string;
  searchalluser: string;

  corporateFavDriver: Array<any> = [];
  userFavDriver: Array<any> = [];
  all_drivers: Array<any> = [];
  corporateFareInfo: Array<any> = [];
  Drivers: Array<any> = [];
  Users: Array<any> = [];
  Cards: Array<any> = [];
  RiderCards: Array<any> = [];

  triptoCancel: string;
  doc: any = {};
  rebooking: any = {};
  DisableOnReschd: boolean;
  driverselect: boolean;
  closeAutocomplete: any = 1;
  stepTimeSelector: number;
  DisableOnload: boolean;
  promo_applied: any = 0;
  corporateCards: number;
  stepPaymentSelector: number;
  checked: boolean;
  riderCards: number;
  paymentForNow: number;
  DisbleOnBRN: boolean;
  paymentForLater: number;
  DisbleOnPFL: boolean;
  disableCRA: boolean;
  cardAlert: any;
  paymentAlert: any;
  invalid_card: boolean;
  DisableResnd: boolean;
  onInvalidOtp: boolean;
  userMobileToAdd: string;
  otpToAdd: string;
  userToAdd: string;
  now: Date;
  payment_timezone: string;

  settings: any = {
    RiderCardEnabled: true,
    CorpCardEnabled: true
  };

  max_schedule_ride_days_count: any;
  buttonNowClicked = 0;
  buttonLaterClicked = 0;

  ridePage = 1;
  tabletScreen = 0;

  essential = 1;
  dash: string = 'enabled';

  defaultZoom = 13;
  driverZoom = 16;

  showLoader = 0;
  notFav = 0;

  booking: any = {
    user_mobile: localStorage.getItem('book-ride-for'),
    proceed: 0
  };

  phoneNumber: FormControl = new FormControl(undefined);
  searchForm: FormControl = new FormControl();

  searchFlag = 0;
  searchString = '';

  dsearchFlag = 0;
  dsearchString = '';

  requestPending = 0;

  skip = 0;
  currentPage = 1;

  promoCountryCode: any = '+1-';

  userDetails: any;
  driverDetails: any;

  completedTabActive: any;
  scheuleTabActive: any;
  regularTabActive: any;
  defaultTab: any;
  routeOffID: any;

  // $rootScope.showloader = false;TODO:
  expand = 1;
  showim = 0;
  select: any = {};
  expand1 = 1;

  ongoingCurrentPage: any;
  scheduled: any;
  blocked = 1;

  driverModel: any;

  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  countryToSet: string = 'US';
  separateDialCode = false;
  countries = {
    '+1': 'US', '+7': "RU", '+20': "EG", '+27': "ZA", '+30': "GR", '+31': "NL", '+32': "BE", '+33': "FR", '+34': "ES", '+36': "HU", '+39': "IT", '+40': "RO", '+41': "CH", '+43': "AT", '+44': "GB", '+45': "DK", '+46': "SE", '+47': "SJ", '+48': "PL", '+49': "DE", '+51': "PE", '+52': "MX", '+53': "CU", '+54': "AR", '+55': "BR", '+56': "CL", '+57': "CO", '+58': "VE", '+60': "MY", '+61': "CC", '+62': "ID", '+63': "PH", '+64': "NZ", '+65': "SG", '+66': "TH", '+81': "JP", '+82': "KR", '+84': "VN", '+86': "CN", '+90': "TR", '+91': "IN", '+92': "PK", '+93': "AF", '+94': "LK", '+95': "MM", '+98': "IR", '+212': "MA", '+213': "DZ", '+216': "TN", '+218': "LY", '+220': "GM", '+221': "SN", '+222': "MR", '+223': "ML", '+224': "GN", '+225': "CI", '+226': "BF", '+227': "NE", '+228': "TG", '+229': "BJ", '+230': "MU", '+231': "LR", '+232': "SL", '+233': "GH", '+234': "NG", '+235': "TD", '+236': "CF", '+237': "CM", '+238': "CV", '+239': "ST", '+240': "GQ", '+241': "GA", '+242': "CG", '+243': "CD", '+244': "AO", '+245': "GW", '+246': "IO", '+248': "SC", '+249': "SD", '+250': "RW", '+251': "ET", '+252': "SO", '+253': "DJ", '+254': "KE", '+255': "TZ", '+256': "UG", '+257': "BI", '+258': "MZ", '+260': "ZM", '+261': "MG", '+262': "RE", '+263': "ZW", '+264': "NA", '+265': "MW", '+266': "LS", '+267': "BW", '+268': "SZ", '+269': "KM", '+290': "SH", '+291': "ER", '+297': "AW", '+298': "FO", '+299': "GL", '+350': "GI", '+351': "PT", '+352': "LU", '+353': "IE", '+354': "IS", '+355': "AL", '+356': "MT", '+357': "CY", '+358': "AX", '+359': "BG", '+370': "LT", '+371': "LV", '+372': "EE", '+373': "MD", '+374': "AM", '+375': "BY", '+376': "AD", '+377': "MC", '+378': "SM", '+379': "VA", '+380': "UA", '+381': "RS", '+382': "ME", '+385': "HR", '+386': "SI", '+387': "BA", '+389': "MK", '+420': "CZ", '+421': "SK", '+423': "LI", '+500': "GS", '+501': "BZ", '+502': "GT", '+503': "SV", '+504': "HN", '+505': "NI", '+506': "CR", '+507': "PA", '+508': "PM", '+509': "HT", '+590': "MF", '+591': "BO", '+593': "EC", '+594': "GF", '+595': "PY", '+596': "MQ", '+597': "SR", '+598': "UY", '+599': "AN", '+670': "TL", '+672': "NF", '+673': "BN", '+674': "NR", '+675': "PG", '+676': "TO", '+677': "SB", '+678': "VU", '+679': "FJ", '+680': "PW", '+681': "WF", '+682': "CK", '+683': "NU", '+685': "WS", '+686': "KI", '+687': "NC", '+688': "TV", '+689': "PF", '+690': "TK", '+691': "FM", '+692': "MH", '+850': "KP", '+852': "HK", '+853': "MO", '+855': "KH", '+856': "LA", '+872': "PN", '+880': "BD", '+886': "TW", '+960': "MV", '+961': "LB", '+962': "JO", '+963': "SY", '+964': "IQ", '+965': "KW", '+966': "SA", '+967': "YE", '+968': "OM", '+970': "PS", '+971': "AE", '+972': "IL", '+973': "BH", '+974': "QA", '+975': "BT", '+976': "MN", '+977': "NP", '+992': "TJ", '+993': "TM", '+994': "AZ", '+995': "GE", '+996': "KG", '+998': "UZ", '+1268': "AG", '+1664': "MS",
  };

 @ViewChild('rideCancelButton')    rideCancelButtonRef: ElementRef;

  constructor(
    private router: Router,
    private socketService: SocketioService,
    private httpService: HttpService,
    private utilityService: UtilityService,
    private cookieService: CookieService
  ) { }


  ngOnInit(): void {
    if ((this.settings.RiderCardEnabled == true) && (this.settings.CorpCardEnabled == true)) {
      this.settings.bothEnabled = true;
    } else {
      this.settings.bothEnabled = false;
    }

    this.getPaymentMode();
    this.getHour();
    this.getDate();
    this.newRideModeSelect();

    this.getNewUsers();
    this.getCards();

    this.initCard();


    setTimeout(() => this.loadPickup(), 500);

    if (!this.cookieService.get('web_access_token')) {
      this.router.navigate(["/", "corporate_login"]);
    }

    this.driverModel = JSON.parse(localStorage.getItem('corporateModel'));
    var newdriverModel: any = JSON.parse(localStorage.getItem('driverdata'));

    this.routeOffID = false;
    if (localStorage.getItem('routeOff')) {
      this.routeOffID = localStorage.getItem('routeOff');
    }
    this.defaultTab = localStorage.getItem('defaultTab');
    localStorage.removeItem('defaultTab');

    if (this.defaultTab == 'reg') {
      this.left.selectedIndex = 2;
      this.completedTabActive = 0;
      this.scheuleTabActive = 0
      this.regularTabActive = 1;
      this.active_trip_data = 'regular-ride-0';

      this.showTripDetail();
    } else if (this.defaultTab == 'sch') {
      this.left.selectedIndex = 1;
      this.completedTabActive = 0;
      this.scheuleTabActive = 1;
      this.regularTabActive = 0;
      this.active_trip_data = 'scheduled-ride-0';

      this.showTripDetail();
    } else {
      this.left.selectedIndex = 0;
      this.completedTabActive = 1;
      this.scheuleTabActive = 0;
      this.regularTabActive = 0;
    }


    this.userDetails = [];
    this.driverDetails = [];


    if (this.driverModel) {
      this.userDetails.userName = this.driverModel.driver_name;
      this.userDetails.userImage = this.driverModel.driver_image;
      this.driverDetails.driver_image = this.driverModel.driver_image;
      this.driverDetails.driver_mobile = this.driverModel.driver_mobile;;
      this.driverDetails.driver_location = ' New York';
      this.driverDetails.referral_code = this.driverModel.referral_code;
      this.driverDetails.corporate_id = this.driverModel.corporate_id;
      this.driverDetails.lat = this.driverModel.lat;
      this.driverDetails.lng = this.driverModel.lng;
      this.driverDetails.state = this.driverModel.state;
      this.driverDetails.city = this.driverModel.city;
      this.driverDetails.address = this.driverModel.address;
    } else {
      this.cookieService.delete('web_access_token');
      this.router.navigate(["/", "corporate_login"]);
    }

    this.scheduledCurrentPage = 1;
    this.regularCurrentPage = 1;
    this.ongoingCurrentPage = 1;
    this.completedCurrentPage = 1;
    this.scheduled = 1;
    this.regularFrom = 1;
    this.scheduledFrom = 1;
    this.completedFrom = 1;

    this.select.selectedIndex = 3;

    this.monitorLiveData();
    if (localStorage.getItem('book-ride-for')) {
      this.booking = this.booking || {};
      this.booking.user_mobile = localStorage.getItem('book-ride-for');
      this.booking.user_name = localStorage.getItem('book-ride-user-name');
      let number = localStorage.getItem('book-ride-for').split("-")
      this.countryToSet = this.countries[number[0]] || this.countries;
      this.phoneNumber.setValue(JSON.parse(number[1]));
    }
    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(() => this.searchL(this.searchString, this.left.selectedIndex));
    this.phoneNumber.valueChanges.subscribe(value => {
      if (typeof value == 'object' && value) {
        this.promoCountryCode = `${value.dialCode}-`
      }
    })

    this.utilityService.newRideButtonChanges.subscribe((value) => {
      if (!value)
        this.newRideModeSelect();
    })
  }

  findDistance(event){
    console.log(event)
   console.log( $('#prefer_fav_dropdown').offset().top - $('.btn_cs').offset().top)
   let diff =  $('#prefer_fav_dropdown').offset().top - $('.btn_cs').offset().top
   if(diff > -185){
      let ele = document.getElementById('prefer_ride_menu')
      console.log(ele)
      setTimeout(() => {
        ele.style.top= -207+'px';
        console.log(ele.style.top)
        
      }, 20);
    
   }
  }
  ngAfterViewInit(): void {

    $("#extPopTwo").val("+1");
    // $("#phone").intlTelInput({
    //   initialCountry: "us",
    //   autoPlaceholder: "off",
    // });
    // $(document).on("countrychange", "#phone", function (e, countryData) {
    //   $("#extPopTwo").val("+" + countryData.dialCode); // do something with countryData
    //   localStorage.setItem("countryCode", countryData.dialCode); // do something with countryData
    //   //angular.element($('#request_ride_later')).scope().showDirection(1);
    // });

    // $.noConflict();
    // $('#date').datepicker({
    //   //format: 'DD, mm MM yyyy',
    //   format: 'yyyy-mm-dd, DD',
    //   startDate: '0d',
    //   autoclose: true
    // });

    // $.noConflict();
    // jQuery(document).ready(($) => {
    //   $('#date').datepicker({
    //     //format: 'DD, mm MM yyyy',
    //     format: 'yyyy-mm-dd, DD',
    //     startDate: '0d',
    //     autoclose: true
    //   });
    // });


    // $("#example1").datepicker({
    //   format: "dd/mm/yyyy",
    //   autoclose: true,
    // });
    // $("#bookdate").datepicker({
    //   //format: 'DD, mm MM yyyy',
    //   format: "yyyy-mm-dd, DD",
    //   startDate: "0d",
    //   autoclose: true,
    // });
    $(window).resize(() => {
      //console.log($('.page.page-h').height(),$('.page.page-h').height()-190);
      $(".table-full").css({
        "max-height": $(".page.page-h").height() - 190 + "px",
        "min-height": $(".page.page-h").height() - 190 + "px",
      });
    });
    /*This function was used to hide/show the name of the Drivers*/

    $(".slider").on("click", () => {
      $("#toggleSwitch").prop("checked", !$("#toggleSwitch").prop("checked"));
      if ($("#toggleSwitch").prop("checked") != true) {
        // $('#map div.gm-style-iw-a').hide();
      } else {
        //  $('#map div.gm-style-iw-a').show();
      }
    });

    $('.terms').click(() => {
      if ($(this).is(":checked")) {
        this.essential = 0
        this.dash = 'disabled';

      }
      else {
        this.essential = 1
        this.dash = 'enabled';
      }
    });
    $('.terms1').click(() => {
      if ($(this).is(":checked")) {
        this.essential = 0
        this.dash = 'disabled';
      }
      else {
        this.essential = 1
        this.dash = 'enabled';
      }
    });

    $('html, body').animate({ scrollTop: 0 }, 'slow');

    setTimeout(() => {
      this.socketListener();
    }, 0);
    this.mapInit();
  }

  setSelectedTab($event): void {
    this.left.selectedIndex = $event;
    this.searchString = "";
  }
  // setupSocketConnection() {
  //   this.socketService.connect();
  //   // this.socketService.emit('');
  // }

  public logout() {
    $('.modal').modal('hide');
    this.cookieService.delete('web_access_token');
    this.router.navigate(["/", "corporate_login"]);
  };
  public newRideModeSelect() {
    this.active_trip_data = '';
    globalThis.qudos_essential = 1;
    globalThis.dash = 'enabled'

    if (this.tabletScreen) {
      this.classExpand = 1;
    }
    this.booking.user_name = '';
    this.booking.user_mobile = '';
    this.booking.current_latitude = '';
    this.booking.manual_destination_latitude = '';
    this.booking.started = 1;
    this.booking.car_type = 1;
    this.booking.returnRide = 0;
    this.booking.select_car_type = this.booking.car_type;
    this.booking.select_car_type = '1';


    this.tripDetailMode = false;
    this.newRideMode = true;
    this.returnRideMode = false;
  }

  public searchL(data, id) {
    this.searchFlag = 0;
    if (data != '') {
      this.searchFlag = 1;
    }
    this.searchString = data;

    if (id == 0) {
      this.socketService.emit('corporateCompletedRequests', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.completedSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 2 });
    } else if (id == 1) {
      this.socketService.emit('corporateScheduledRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.scheduleSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });
    } else if (id == 2) {
      this.socketService.emit('corporateRegularRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.regularSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });
    }
  }

  public collapseDisc() {
    this.classExpand = 0;
  }
  public onDateChange(date) {
    this.booking.date = moment(date).format('YYYY-MM-DD, dddd')
  }

  public pageChanged(number, status) { }

  public showTripDetail() {
    this.tripDetailMode = true;
    this.newRideMode = false;
    this.returnRideMode = false;
    this.utilityService.showNewRideButton(true);
  }

  public findIndex_from_objectArray(key: string, value: any, data: Array<Object[]>) {
    for (let i in data) {
      if (data[i][key] == value)
        return i;
    }
  }



  public check(daa) {
    this.search_session_id = undefined;
    setTimeout(() => {
      if (this.tripDetailMode) {
        if (this.hasDriver == 'YES') {
          if (this.driverEnable) {
          } else {
            this.search_session_id = daa.session_id;
            this.cleanDrivers(daa.driver_id);
          }

          this.socketService.emit('corporateDriverAvailablity', { session_id: this.search_session_id, limit: this.driverLimit, offset: this.driverSkip, searchFlag: this.dsearchFlag, searchString: this.dsearchString });
        } else {
          if (!this.driverEnable) {
            this.disableDrivers();
          }
        }
      }
    }, 10);
  }

  // public getButtonClass(rideStatus, reqStatus, status) { }
  // public getButtonText(rideStatus, reqStatus, status) { }

  public getButtonText(index, req, is_active) {
    switch (index) {
      case 0:
        if (req == 1) {
          return "Accepted";
        } else if (req == 10) {
          //return "Lapsed";
          return "Missed";
        } else if (req == null && is_active == 0) {
          return "Missed";
        } else {
          return "Assigning";
        }
      case 1:
        return "Picking Up";
      case 2:
        return "Arrived";
      case 3:
        return "En Route";
      case 4:
        return "Completed";
      case 5:
        //return "Cancelled By Driver";
        return "Cancelled";
      case 6:
        //return "Cancelled By Rider";
        return "Cancelled";
      case 7:
        //return "Cancelled By Rider";
        return "Cancelled";
      case 8:
        //return "Unsuccessful Payment";
        return "Unsuccessful";
      case 9:
        //return "Cancelled by Admin";
        return "Cancelled";
      case 11:
        //return "Cancelled By Corporate";
        return "Cancelled";
      default:
        return index + ' ' + req;

    }
  }

  public getButtonClass(index, req, is_active) {
    switch (index) {
      case 0:
        if (req == 1) {
          return "green";
        } else if (req == 10) {
          //return "Lapsed";
          return "black";
        } else if (req == null && is_active == 0) {
          return "black";
        } else {
          return "blue";
        }
      case 1:
        return "blue";
      case 2:
        return "blue";
      case 3:
        return "blue";
      case 4:
        return "blue";
      case 5:
        //return "Cancelled By Driver";
        return "black";
      case 6:
        //return "Cancelled By Rider";
        return "black";
      case 7:
        //return "Cancelled By Rider";
        return "black";
      case 8:
        //return "Unsuccessful Payment";
        return "black";
      case 9:
        //return "Cancelled by Admin";
        return "black";
      case 11:
        //return "Cancelled By Corporate";
        return "black";
      default:
        return index + ' ' + req;

    }
  }

  driverLimit = 200;
  public showDirection(force) {
    this.DirectionShow = 1
    this.MapShow = 1
    this.CarShow = 0
    this.UserShow = 0

    if (force == 1) {
      this.force = 1;
    } else {
      this.force = 0;
    }
  }


  public checkName() {
    this.booking.proceed = 0;
    if (this.booking.user_mobile.length > 9) {
      if (this.Users) {
        this.Users.forEach((user) => {
          if (user.user_mobile.indexOf(this.booking.user_mobile) >= 0) {

            this.booking.user_name = user.user_name;
            return false;
          } else {

          }
        });
      } else {
        setTimeout(() => {
          this.checkName();
        }, 400);
      }

    }
  }

  public swapLocation() {

    var pickup_address, pickup_text, pickup_lat, pickup_long, drop_address, drop_text, drop_lat, drop_long;


    pickup_address = this.booking.pickup_location_address;
    pickup_text = this.booking.pickup_text;

    drop_address = this.booking.manual_destination_address;
    drop_text = this.booking.drop_text;

    pickup_lat = this.booking.latitude;
    pickup_long = this.booking.longitude;

    drop_lat = this.booking.manual_destination_latitude;
    drop_long = this.booking.manual_destination_longitude;



    this.booking.pickup_location_address = drop_address;
    this.booking.manual_destination_address = pickup_address;


    $('#pickup').val(drop_address);
    $('#drop').val(pickup_address);

    this.booking.manual_destination_latitude = pickup_lat;
    this.booking.manual_destination_longitude = pickup_long;


    this.booking.latitude = drop_lat;
    this.booking.longitude = drop_long;

    this.booking.current_latitude = drop_lat;
    this.booking.current_longitude = drop_long;


    this.getDirectionsForBooking();
  }

  public getDirectionsForBooking() {
    if (this.booking.manual_destination_latitude && this.booking.current_latitude) {

      directionsDisplay.setMap(null);
      directionsDisplay.setMap(map);
      directionsDisplay.setPanel(document.getElementById('panel'));

      var request = {
        origin: this.booking.pickup_location_address,
        destination: this.booking.manual_destination_address,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      };
      this.booking.polylines = 'NOT FOUND YET';
      directionsService.route(request, (response, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);

          this.booking.polylines = response.routes[0].overview_polyline
        }
      });

    }
  }

  public driver_refresh() {
    this.booking.driver_id = '';
    this.getDriversDatas();
  }

  public selectCarType() {
    this.booking.select_car_type = this.booking.car_type;

    this.booking.estimated_fare = this.carsOptions[this.booking.car_type - 1].value_regular;
    this.booking.estimated_fare_later = this.carsOptions[this.booking.car_type - 1].value_scheduled;

    this.booking.car_selected = 1;

    if (this.booking.autoHitApi === 0) {

      if (this.carsOptions[this.booking.car_type - 1].value_regular) {
        this.selectCarClassNext();
      }
    }
  }

  public carSelectorMode() {
    if (this.checkInputValid()) {

      this.booking.autoHitApi = 0;
      this.booking.carSelected = 1;

      this.hitCheckMobile(1);
      this.forceShowDriver = 0;
      /*this.getFareEstimate();
  	
      this.MapShow = false;
      this.CarShow = true;
      this.UserShow = false;*/
    }
  }

  public DriverSelectorMode() {
    if (this.checkInputValid()) {

      this.booking.autoHitApi = 0;
      this.booking.carSelected = 0;

      this.hitCheckMobile(2);


      /*this.getFareEstimate();
      $('#loading').modal('show');
    	
      this.MapShow = false;
      this.CarShow = false;
      this.UserShow = true;*/
    }
  }
  public getDataAndshowPopup() {
    this.DisableSRR = true;

    this.checkPhoneCountry();

    if (this.checkInputValid()) {

      this.hitCheckMobile(0);
      this.booking.autoHitApi = 1

      setTimeout(() => {
        this.DisableSRR = false;
      }, 1000)
      /*$('#loading').modal('show');
      this.getFareEstimate();*/
    }
  }

  public getNewUsers(searchflag?: any) {
    let params: any = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: 0
    }

    if ((searchflag == 1) && this.booking.user_name) {
      params.searchFlag = 1;
      params.searchString = this.booking.user_name;
      this.closeAutocomplete = 0;
    }

    this.httpService.post(environment.urlC + 'associated_user_list', params)
      .subscribe((data) => {

        if (typeof (data) == 'string')
          data = JSON.parse(data);
        if (data.flag == 101) {
          this.router.navigate(['/', "corporate_login"]);
          console.log('Not logged in');
        }
        if (data.flag == 502) {

        } else {

          this.Users = data.users;
          $('.modal-backdrop.show').fadeOut();
        }
      });
  }

  public swapLocationforReturn() {


    var pickup_address, pickup_text, pickup_lat, pickup_long, drop_address, drop_text, drop_lat, drop_long;


    pickup_address = this.booking.pickup_location_address;
    pickup_text = this.booking.pickup_text_return;

    drop_address = this.booking.manual_destination_address;
    drop_text = this.booking.drop_text_return;

    pickup_lat = this.booking.latitude;
    pickup_long = this.booking.longitude;

    drop_lat = this.booking.manual_destination_latitude;
    drop_long = this.booking.manual_destination_longitude;



    this.booking.pickup_location_address = drop_address;
    this.booking.manual_destination_address = pickup_address;

    //this.booking.pickup_text_return =  drop_text;
    //this.booking.drop_text_return  = pickup_text;


    $('#return-pickup').val(drop_address);
    $('#return-drop').val(pickup_address);

    this.booking.manual_destination_latitude = pickup_lat;
    this.booking.manual_destination_longitude = pickup_long;


    this.booking.latitude = drop_lat;
    this.booking.longitude = drop_long;

    this.booking.current_latitude = drop_lat;
    this.booking.current_longitude = drop_long;



    this.getDirectionsForBooking();

  }

  public cancelReturn() {
    this.tripDetailMode = true;
    this.newRideMode = false;
    this.returnRideMode = false;
  }

  public returnscheduleRide(CurrentRide) {

    var datedata = this.booking.date.split(', ');

    this.booking.time = datedata[0] + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes + ':00';

    if (CurrentRide.user_mobile.includes('-')) {
      this.promoCountryCode = CurrentRide.user_mobile.split('-')[0] + '-';
    }

    this.booking.started = 1;
    this.booking.returnRide = 1;
    this.booking.user_id = CurrentRide.user_id;
    this.booking.user_mobile = CurrentRide.user_mobile;
    this.booking.user_name = CurrentRide.user_name;
    this.booking.offset = CurrentRide.offset;
    this.booking.car_type = CurrentRide.car_type;

    //this.booking.driver_id = CurrentRide.driver_id;
    this.booking.toll = '';
    this.booking.promo_code = '';
    this.booking.promo_value = '';
    this.booking.ride_estimate_distance = '';
    this.booking.ride_estimate_time = '';


    this.booking.manual_destination_latitude = CurrentRide.pickup_latitude;
    this.booking.manual_destination_longitude = CurrentRide.pickup_longitude;


    this.booking.drop_text_return = CurrentRide.pickup_location_address;
    this.booking.pickup_text_return = CurrentRide.manual_destination_address;

    this.booking.pickup_location_address = CurrentRide.manual_destination_address;
    this.booking.manual_destination_address = CurrentRide.pickup_location_address;
    this.booking.latitude = CurrentRide.manual_destination_latitude;
    this.booking.longitude = CurrentRide.manual_destination_longitude;
    this.booking.current_latitude = CurrentRide.manual_destination_latitude;
    this.booking.current_longitude = CurrentRide.manual_destination_longitude;

    this.notFav = 1;
    this.booking.driver_id = '';
    this.booking.select_car_type = 1;
    this.booking.driver_selected = 1;
    this.getDirectionsForBooking();
  }

  sendInvoice(currentRide) {
    let data = {
      web_access_token: this.cookieService.get("web_access_token"),
      session_id: currentRide.session_id
    };

    this.httpService.post(environment.urlC + 'send_invoice', data).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.error) {
        this.utilityService.toast('warning', 'Something went wrong', '');
      }
      else {
        this.utilityService.toast('success', 'Invoice sent successfully to your email', '');
      }
    })
  }

  public showReturn() {
    this.tripDetailMode = false;
    this.newRideMode = false;
    this.returnRideMode = true;
    setTimeout(() => {
      this.loadPickup();
    }, 500);
  }

  public checkPhoneCountry() {
    if ($('#phone').length) {
      if ($('#phone').val().split('-').length > 1) {
        var phone_parts = $('#phone').val().split('-');
        $('#phone').val(phone_parts[1]);
        var countryToSet = (this.countries[phone_parts[0]]) ? this.countries[phone_parts[0]] : 'US';
        // $("#phone").intlTelInput("setCountry", countryToSet);
        this.DisableSRR = false;
        setTimeout(() => {
          this.checkName();
        }, 500);

      }

    }

  }

  public loadPickup() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    this.booking.is_fav = 1;
    this.booking.offset = '330';
    this.booking.offset = new Date().getTimezoneOffset() * -1;

    this.checkPhoneCountry();

    /*this.map = new google.maps.Map(document.getElementById('map'), {
      zoom:12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: {lat: 40.715818, lng: -73.963976},
     });*/

    var autocomplete = {};
    var autocompletesWraps = ['pickup', 'drop', 'return-pickup', 'return-drop'];

    var test_form = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };
    var test2_form = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };


    $.each(autocompletesWraps, (index, name) => {

      if ($('#' + name).length == 0) {

        return;
      }
      autocomplete[name] = new google.maps.places.Autocomplete($('#' + name + '.autocomplete')[0],
      );

      google.maps.event.addListener(autocomplete[name], 'place_changed', () => {

        var place = autocomplete[name].getPlace();
        if (!place.geometry) {
          this.utilityService.alert('error', 'Address incomplete or invalid, Please select from the suggested locations!!');
          return;
        }
        if (name == 'pickup' || name == 'return-pickup') {

          var latitude = place.geometry.location.lat();
          var longitude = place.geometry.location.lng();
          this.booking.current_latitude = latitude;
          this.booking.current_longitude = longitude;


          this.booking.pickup_location_address = place.formatted_address;

          this.booking.latitude = latitude;
          this.booking.longitude = longitude;

        }

        if (name == 'drop' || name == 'return-drop') {

          var latitude = place.geometry.location.lat();
          var longitude = place.geometry.location.lng();


          this.booking.manual_destination_latitude = latitude;
          this.booking.manual_destination_longitude = longitude;

          this.booking.manual_destination_address = place.formatted_address;

        }
        this.getDirectionsForBooking();
      });
    });


  }

  public reTryRide(CurrentRide) {
    this.qudos_essential = 1;
    this.dash = 'enabled';

    if (this.left.selectedIndex == 2) {
      this.qudos_essential = 0;
    }

    var datedata = this.booking.date.split(', ');

    this.booking.time = datedata[0] + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes + ':00';

    if (CurrentRide.user_mobile.includes('-')) {
      this.promoCountryCode = CurrentRide.user_mobile.split('-')[0] + '-';
    }


    this.booking.started = 1;
    this.booking.returnRide = 1;
    this.booking.retryRide = 1;
    this.booking.user_id = CurrentRide.user_id;
    this.booking.user_mobile = CurrentRide.user_mobile;
    this.booking.user_name = CurrentRide.user_name;
    this.booking.offset = CurrentRide.offset;
    this.booking.car_type = CurrentRide.car_type;

    //this.booking.driver_id = CurrentRide.driver_id;
    this.booking.toll = '';

    if (!this.booking.promo_code) {
      this.booking.promo_code = '';
      this.booking.promo_value = '';
    }

    this.booking.ride_estimate_distance = '';
    this.booking.ride_estimate_time = '';


    this.booking.manual_destination_latitude = CurrentRide.manual_destination_latitude;
    this.booking.manual_destination_longitude = CurrentRide.manual_destination_longitude;


    this.booking.drop_text_return = CurrentRide.manual_destination_address;
    this.booking.pickup_text_return = CurrentRide.pickup_location_address;

    this.booking.pickup_location_address = CurrentRide.pickup_location_address;
    this.booking.manual_destination_address = CurrentRide.manual_destination_address;

    this.booking.latitude = CurrentRide.pickup_latitude;
    this.booking.longitude = CurrentRide.pickup_longitude;

    this.booking.current_latitude = CurrentRide.pickup_latitude;
    this.booking.current_longitude = CurrentRide.pickup_longitude;

    this.notFav = 1;
    this.booking.driver_id = '';
    this.booking.select_car_type = CurrentRide.car_type;
    this.booking.driver_selected = 1;

    this.getDirectionsForBooking();
  }

  public hitCheckMobile(clicked) {
    this.booking.promo_code = undefined;
    this.sortPhoneNumber();
    $('#loading').modal('show');
    // $('#loading').show();
    if (this.booking.proceed == 1) {
      this.getFareEstimate();
      if (clicked == 1) {
        this.MapShow = false;
        this.CarShow = true;
        this.UserShow = false;
      } else if (clicked == 2) {
        this.MapShow = false;
        this.CarShow = false;
        this.UserShow = true;
      }
      return false;
    }

    this.httpService.post(environment.urlC + 'check_mobile', {
      user_mobile: this.promoCountryCode + this.booking.user_mobile,
      user_name: this.booking.user_name,
      web_access_token: this.cookieService.get('web_access_token'),
    })
      .subscribe((data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);
        if (data.flag == 1316) {
          //$rootScope.openToast('warning', data.error, '');
          if (!this.booking.user_name) {
            this.utilityService.alert("error", "Please enter User Name.");
            return 0;
          }

          this.UserNotFoundScreen();
        } else if (data.flag == 1317) {

          //$rootScope.openToast('warning', data.error, '');
          this.booking.user_id = data.user_id;
          this.shoUserAddScreen();

          this.addtoAccount();
          localStorage.removeItem('book-ride-for')
          localStorage.removeItem('book-ride-user-name')
        } else if (data.error) {
          this.utilityService.toast('error', data.error, '')
          return 0;
        } else {

          this.getFareEstimate();
          $('#loading').hide();
        }
        setTimeout(() => {
          if (clicked == 1) {
            this.MapShow = false;
            this.CarShow = true;
            this.UserShow = false;
          } else if (clicked == 2) {
            this.MapShow = false;
            this.CarShow = false;
            this.UserShow = true;
          }
        }, 500);
        // });
      });
  }

  otpMode: any;
  public addtoAccount() {
    this.otpMode = 1;
    this.userToAdd = this.booking.user_id;
    this.userMobileToAdd = this.promoCountryCode + this.booking.user_mobile;
    this.otpToAdd = '';

    this.httpService.post(environment.urlC + 'associatedUser_send_otp', {
      web_access_token: this.cookieService.get('web_access_token'),
      mobile: this.promoCountryCode + this.booking.user_mobile,
      email: this.booking.user_id,
    }).subscribe((data) => {
      $('#loading').hide();

      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.error || data.flag == 0) {

        this.utilityService.toast('error', data.error || data.message, '');
        // $('#add_myUser').modal('hide');
        return;
      } else if (data.flag == 7) {

        this.utilityService.toast('success', data.message, '');

        //alert("This user is not yet added to your list, an OTP is sent to ("+this.userMobileToAdd+") and need to be entered below for the new ride request to proceed");
      }
    })

  }

  public shoUserAddScreen() {
    $('#add_myUser').modal('show');
  }

  public showCardAlert() {
    $('#request_right_now').modal('hide');
    $('#request_right_now_1').modal('hide');
    $('#show_cardError').modal('show');

    this.cardAlert = 1;
  }

  public NoUserScreen() {
    $('#no_User').modal('show');
  }

  public UserNotFoundScreen() {
    $('#no_User').modal('show');
  }

  public checkInputValid() {

    if (!this.booking.user_mobile) {
      this.utilityService.alert("info", "Please enter Mobile number");
      this.DisableSRR = false;
      return 0;
    } else if (!/^[1-9]{1}[0-9]{9}$/.test(this.booking.user_mobile.split('-')[1] || this.booking.user_mobile)) {
      this.utilityService.alert("info", 'Please enter valid Mobile Number');
      this.DisableSRR = false;
      return 0;
    } else if (($('#pickup').val() != '') && !this.booking.current_latitude) {
      $('#pickup').val('');
      this.utilityService.alert("info", "We couldn't locate your Pickup Location, Please select another.");
      this.DisableSRR = false;
      return 0;
    } else if (!this.booking.current_latitude) {
      this.utilityService.alert("info", "Please enter Pickup Location.");
      this.DisableSRR = false;
      return 0;
    } else if (($('#drop').val() != '') && !this.booking.manual_destination_latitude) {
      $('#drop').val('');
      this.utilityService.alert("info", "We couldn't locate your Drop off Location, Please select another.");
      this.DisableSRR = false;
      return 0;
    } else if (!this.booking.manual_destination_latitude) {
      this.utilityService.alert("info", "Please enter Destination.");
      this.DisableSRR = false;
      return 0;
    } else {
      return 1;
      this.DisableSRR = false;
    }
  }

  carTypes = {
    'NaN': { 'className': 'Standard Class', 'similar': 'Honda Accord, Cadillac MKS and BMW 3 series or similar', 'max': 4, 'luggage': 2 },
    'QS 4max': { 'className': 'Standard Class', 'similar': 'Honda Accord, Cadillac MKS and BMW 3 series or similar', 'max': 4, 'luggage': 2 },
    'QLE 6max': { 'className': 'Standard Class', 'similar': 'Toyota Highlander, Toyota Seina, Chevrolet Suburban or similiar', 'max': 6, 'luggage': 2 },
    'WAV 4max': { 'className': 'Standard Class', 'similar': 'Toyota Highlander, Toyota Seina, Chevrolet Suburban or similiar', 'max': 6, 'luggage': 2 },
    'LUXE 4max': { 'className': 'VIP Class', 'similar': 'Mercedes-Benz S-Class, BMW 7 Series, Audi A8 or similar', 'max': 4, 'luggage': 2 },
    'GRANDE 7max': { 'className': 'VIP Class', 'similar': 'Mercedes-Benz V-Class, Chevrolet Suburban, Cadillac Escalade or similar', 'max': 6, 'luggage': 2 },
    'ELITE 3max': { 'className': 'Elite Class', 'similar': 'Mercedes-Benz V-Class, Chevrolet Suburban, Cadillac Escalade or similar', 'max': 4, 'luggage': 2 },
    'QXL 8max': { 'className': 'QXL Class', 'similar': 'Mercedes-Benz V-Class, Chevrolet Suburban, Cadillac Escalade or similar', 'max': 6, 'luggage': 10 },
  }

  public sortPhoneNumber() {
    this.booking.countrycode = this.promoCountryCode;
    if (this.booking.user_mobile.indexOf('+') >= 0) {
      this.booking.user_mobile = this.booking.user_mobile.replace(this.promoCountryCode, '');
      this.booking.user_mobile = this.booking.user_mobile.replace(this.promoCountryCode, '');
    }
  }

  onCountryChange($event) {
    this.promoCountryCode = `+${$event.dialCode}-`;
  }

  routeMode: any;
  public searchD() {

    this.dsearchString = this.searchDriver;
    this.availableCurrentPage = 1;
    if (!this.searchDriver || this.searchDriver == '') {

      var newlatlng = new google.maps.LatLng(this.driverDetails.latitude, this.driverDetails.longitude);

      map.setCenter(newlatlng);
      map.setZoom(this.defaultZoom);
      this.dsearchFlag = 0;

    } else {
      this.cleanDrivers();

      this.dsearchFlag = 1;
      this.routeMode = 0;

      /*this.driverSearchAPI*/
    }


    this.socketService.emit('corporateDriverAvailablity', { limit: this.driverLimit, offset: this.driverSkip, searchFlag: this.dsearchFlag, searchString: this.dsearchString });
  }

  public enableDrivers() {
    this.search_session_id = undefined;
    this.driverEnable = !this.driverEnable;


    if (this.driverEnable == 1) {
      this.socketService.emit('corporateDriverAvailablity', { session_id: this.search_session_id, limit: this.driverLimit, offset: this.driverSkip, searchFlag: this.dsearchFlag, searchString: this.dsearchString });
      gettingDrivers = setInterval(() => {
        this.socketService.emit('corporateDriverAvailablity', { session_id: this.search_session_id, limit: this.driverLimit, offset: this.driverSkip, searchFlag: this.dsearchFlag, searchString: this.dsearchString });
      }, 8000);
    } else {
      clearInterval(gettingDrivers);
      gettingDrivers = 0;
      this.cleanDrivers();
    }

  }

  public showCar() {
    this.MapShow = 0
    this.CarShow = 1
    this.UserShow = 0
  }

  public donothing() { }

  public showUser() {
    this.force = 0;
    this.DirectionShow = 0
    this.MapShow = 0
    this.CarShow = 0
    this.UserShow = 1
  }

  public showCredentialsAlert() { }

  cars_option: Array<any> = [];
  min_ride_request_distance: any;
  max_schedule_ride_request_distance: any;
  max_ride_request_distance: any;
  ride_estimate_distance: any;

  public getFareEstimate() {
    localStorage.removeItem('book-ride-for');

    this.showLoader = 1;

    this.sortPhoneNumber();

    this.httpService.post(environment.urlC + 'fare_estimate', {
      is_scheduled: 0,
      pickup_latitude: this.booking.current_latitude,
      pickup_longitude: this.booking.current_longitude,
      destination_latitude: this.booking.manual_destination_latitude,
      destination_longitude: this.booking.manual_destination_longitude,
      promo_code: this.booking.promo_code,
      web_access_token: this.cookieService.get('web_access_token'),
      car_type: this.booking.car,
      user_mobile: this.promoCountryCode + this.booking.user_mobile
    }).subscribe((data) => {

      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.flag == 101) {
        this.showCredentialsAlert();

        setTimeout(() => {
          $('#loading').modal('hide');
        }, 1000);
      } else if (data.flag == 1316) {
        this.utilityService.toast('warning', data.error, '');
        //this.NoUserScreen();	
        this.booking.user_id = data.user_id;
        $('#loading').modal('hide');

      } else if (data.flag == 1317) {

        this.utilityService.toast('warning', data.error, '');
        this.shoUserAddScreen();
        this.addtoAccount();

        this.booking.user_id = data.user_id;
        $('#loading').modal('hide');
      } else if (data.error || data.flag == 0) {
        // $('#loading').modal('hide');
        if (this.lastToastRef?.toastId) {
          this.utilityService.removeToast(this.lastToastRef?.toastId);
        }
        this.lastToastRef = this.utilityService.toast('error', data.error || data.message, '');
        $('#loading').modal('hide');
        // setTimeout(() => {
        //   $('#loading').modal('hide');
        // }, 500);
        return;

      } else {


        this.min_ride_request_distance = data.min_ride_request_distance;
        this.max_schedule_ride_days_count = data.max_schedule_ride_days_count;
        this.max_schedule_ride_request_distance = data.max_schedule_ride_request_distance * 1609.344;
        this.max_ride_request_distance = data.max_ride_request_distance * 1609.344;
        this.ride_estimate_distance = data.ride_estimate_distance;


        if (this.ride_estimate_distance < this.min_ride_request_distance) {
          $('#drop').val('');
          this.utilityService.toast('error', "Ride Distance too short, Please choose another Destination", '');
          setTimeout(() => {
            $('#loading').modal('hide');
          }, 0);
          return false;

        } else if (this.ride_estimate_distance > this.max_ride_request_distance) {
          $('#drop').val('');
          this.utilityService.toast('error', "Destination too far, Please choose another Destination", '');
          setTimeout(() => {
            $('#loading').modal('hide');
          }, 0);

          return false;

        }

        this.cars_option = [];

        var carsData = data.estimated_fare;

        carsData.forEach((carInfo) => {

          var d = carInfo;
          var c: any = {};

          if (this.carTypes[carInfo.car_name]) {
            c = this.carTypes[carInfo.car_name];
            d.carClass = c.className;
            d.similar = c.similar;
            d.max = c.max;
            d.luggage = c.luggage;
            d.value_regular = parseFloat(d.value_regular);
            d.value_scheduled = parseFloat(d.value_scheduled);
          }
          this.cars_option.push(d);
        });

        this.carsOptions = this.cars_option;
        this.booking.user_id = data.user_id;
        this.booking.user_name = data.user_name;
        this.booking.ride_estimate_time = data.ride_estimate_time;
        this.booking.ride_estimate_distance = data.ride_estimate_distance;
        this.booking.toll = data.toll;
        this.booking.route = data.route;

        this.booking.route_image = 'https://maps.googleapis.com/maps/api/staticmap?&path=' + this.booking.pickup_location_address + '|' + this.booking.manual_destination_address + '&size=600x600&style=feature:landscape|visibility:on&style=feature:poi|visibility:on&style=feature:transit|visibility:on&style=feature:road.highway|element:geometry|lightness:39&style=feature:road.local|element:geometry|gamma:1.45&style=feature:road|element:labels|gamma:1.22&style=feature:administrative|visibility:on&style=feature:administrative.locality|visibility:on&style=feature:landscape.natural|visibility:on&scale=2&markers=shadow:false|scale:2|icon:https://s3.ap-south-1.amazonaws.com/qudosemail/pickup1.png|' + this.booking.current_latitude + ',' + this.booking.current_longitude + '&markers=shadow:false|scale:2|icon:https://s3.ap-south-1.amazonaws.com/qudosemail/drop_off1.png|' + this.booking.manual_destination_latitude + ',' + this.booking.manual_destination_longitude + '&path=geodesic:true|weight:3|color:0x2dbae4ff|enc:kn{wFf`abMCECCCCCCACCECCCCCECCCCCCAA?A?????????@@@@@@@@@@BBB@@TA@NFJHJHJHJJHHLFLb@z@GICCEG@BBB@@@@??????????????@@@@@@@@@BBDDDDDDDBDBBBB@BAPCBCDEFGJGJGJKPILILGHEFAPBDDFHHJLJLJNLPLPNRLPLNJLHJFHDFBDBBBBBBBBDFBBNRJNLNNRLNJLHJFHDFBDBB@@@@@@BB@BBBDDFHHJLNLNLNLPNPLNLPLNLNLNLNJLJLJLJLHJHJHJFHFHFHFHFHHHHJHJHJHJFHDFDFDFBD@B@@?@???????@??????????????????????????@@???????????????????@@@@@@@??BDBOFKBGBEBEBEDEBEDGDIDGBE@A&key=AIzaSyADXfBi40lkKpklejdGIWNxdkqQCKz8aKI';

        this.booking.route_directions = 'https://maps.googleapis.com/maps/api/staticmap?size=600x600&path=color:0x00000cd0|weight:5|enc:' + this.booking.polylines + '&markers=shadow:false|scale:2|color:green|label:A|' + this.booking.current_latitude + ',' + this.booking.current_longitude + '&markers=color:red|label:B|shadow:false|scale:2|' + this.booking.manual_destination_latitude + ',' + this.booking.manual_destination_longitude + '&key=AIzaSyADXfBi40lkKpklejdGIWNxdkqQCKz8aKI'

        if (this.booking.autoHitApi) {

          var fare = this.cars_option[this.booking.car_type - 1].value_regular;
          var sche_fare = this.cars_option[this.booking.car_type - 1].value_scheduled;

          this.booking.estimated_fare = fare;
          this.booking.estimated_fare_later = sche_fare;

          var fare_old = this.cars_option[this.booking.car_type - 1].regular_ride_without_discount;
          var sche_fare_old = this.cars_option[this.booking.car_type - 1].schedule_ride_without_discount;
          this.booking.estimated_fare_old = fare_old;
          this.booking.estimated_fare_later_old = sche_fare_old;

          if (this.booking.driver_id) {
            this.notFav = 0;
            this.booking.select_car_type = '';

          } else {
            this.booking.driver_selected = 1;
            this.notFav = 1;
            this.booking.driver_id = '';
            this.booking.car_selected = 1;
            this.booking.select_car_type = this.booking.car_type;
          }

          if (this.booking.car_type) {
            this.getDriversData();
          }

        } else {

          var fare = this.cars_option[this.booking.car_type - 1].value_regular;
          var sche_fare = this.cars_option[this.booking.car_type - 1].value_scheduled;

          this.booking.estimated_fare = fare;
          this.booking.estimated_fare_later = sche_fare;
          //this.booking.car_selected = 1;

          var fare_old = this.cars_option[this.booking.car_type - 1].regular_ride_without_discount;
          var sche_fare_old = this.cars_option[this.booking.car_type - 1].schedule_ride_without_discount;
          this.booking.estimated_fare_old = fare_old;
          this.booking.estimated_fare_later_old = sche_fare_old;

          if (!this.booking.driver_id || (this.booking.driver_id == '')) {
            this.booking.select_car_type = this.booking.car_type;
          }

          this.getDriversData();
        }
        this.myQudosMode = 1;

        setTimeout(() => {
          $('#loading').modal('hide');
          // this.$apply();
        }, 1000);
        if (!this.booking.promo_code) {
          this.booking.promo_code = '';
        }
        if (data.promo_data.code) {
          this.booking.promo_code = data.promo_data.code;
        }
        this.booking.promo_value = data.promo_data.value;
      }

    }, (error) => {
      this.utilityService.alert('error', 'Something went Wrong!');
      $('#loading').modal('hide');
    })

  }


  public getDriversData() {
    var datedata = this.booking.date.split(', ');

    this.booking.time = datedata[0] + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes + ':00';

    this.myQudosMode = 1;
    this.UserQudosMode = 0;
    this.AllQudosMode = 0;

    this.booking.selectedTime = new Date();

    var timeInThatArea = new Date().toLocaleString("en-US", { timeZone: this.booking.timezone });
    this.booking.timeInThatArea = new Date(timeInThatArea);
    this.booking.timeInThatAreaLocale = new Date(timeInThatArea).toLocaleString();



    if (this.booking.user_id) {

      this.httpService.post(environment.urlC + 'get_ride_data', {
        web_access_token: this.cookieService.get('web_access_token'),
        user_id: this.booking.user_id,
        region_id: 24,
        car_type: this.booking.car_type,
        is_essential: this.essential

      }).subscribe((data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);

        if (data.flag == 1317) {
          this.utilityService.toast('warning', data.error, '');
          this.shoUserAddScreen();
          this.addtoAccount();
          $('#loading').modal('hide');
        } else if (data.error || data.flag == 0) {
          this.utilityService.toast('error', data.error || data.message, '');
          return;
        } else {
          this.corporateFavDriver = data.corporateFavDriver;
          this.userFavDriver = data.userFavDriver;
          this.all_drivers = data.all_drivers;

          if (this.booking.autoHitApi) {
            $('#loading').modal('hide');
            $('#add_to_account').modal('show');
          } else {
            $('#loading').modal('hide');
            if ((this.booking.carSelected == 0) || (this.forceShowDriver)) {
              this.showUser();
            }
          }
          if (this.userFavDriver.length == 0) {

          }
        }
      });

    } else {

    }
  }


  forceShowDriver: any;
  public selectCarClassNext() {
    if (this.booking.car_type) {
      this.forceShowDriver = 1;
      this.getDriversData();
    } else {
      this.utilityService.alert("info", "Please select a car first.");
    }
  }

  public slectNext() {
    if (this.booking.driver_id || (this.notFav == 1)) {
      $('#add_to_account').modal('show');
    } else {
      this.utilityService.alert("info", "Please select a Driver.");
    }
  }

  public selectCarClass(type, fare, sche_fare) {
    this.booking.car_type = type;

    this.booking.estimated_fare = fare;
    //this.booking.estimated_fare_later = this.later_car_options[type-1].value;
    this.booking.estimated_fare_later = sche_fare;
    this.booking.car_selected = 1;
    this.selectCarClassNext();
  }

  public switchMode(mode) {
    if (mode == "m") {
      this.myQudosMode = 1;
      this.UserQudosMode = 0;
      this.AllQudosMode = 0;
    } else if (mode == "u") {
      this.myQudosMode = 0;
      this.UserQudosMode = 1;
      this.AllQudosMode = 0;
    } else {
      this.myQudosMode = 0;
      this.UserQudosMode = 0;
      this.AllQudosMode = 1;
    }
  }

  public slect(driver, notfav) {
    this.booking.driver_id = driver;
    this.booking.driver_selected = 1;

    if (driver == '') {
      return false;
    }

    if (notfav) {
      this.notFav = 1;
      this.booking.driver_id = '';
      this.booking.select_car_type = driver;
    } else {
      this.notFav = 0;
      this.booking.select_car_type = '';
    }

    if (!this.booking.autoHitApi) {
      this.slectNext();
    }
  }


  public showLast() { }
  public showTime() { }
  public selectThisUser(id, num, name) {
    this.booking.user_id = id;
    this.booking.user_name = name;
    this.booking.user_mobile = num;
    this.phoneNumber.setValue(num);

    setTimeout(() => {
      this.checkPhoneCountry();
    }, 200);
    this.closeAutocomplete = 1;
  }

  public openAddUser() {
    setTimeout(() => {
      window.open('/#/corporate/riderSignup', '_blank');
    }, 0);
  }

  public closeAC() {
    setTimeout(() => {
      this.closeAutocomplete = 1;
    }, 250);
  }

  public closePayment() {
    $('#loading').modal('hide');
    $('#show_PaymentError').modal('hide');
    $('#request_right_now').modal('hide');
    $('#request_right_now_1').modal('hide');
  }

  public showPaymentAlert() {
    $('#request_right_now').modal('hide');
    $('#request_right_now_1').modal('hide');
    $('#show_PaymentError').modal('show');
    if (this.Cards.length > 0) {
      this.invalid_card = true;
    }
    else {
      this.invalid_card = false;
    }

    this.paymentAlert = 1;
  }


  totalCards: any;
  public getCards() {
    this.DisableOnload = true;

    this.httpService.post(environment.urlC + 'list_payment_cards', {
      web_access_token: this.cookieService.get("web_access_token"),
      user_id: this.booking.user_id
    })
      .subscribe((data) => {
        if (typeof (data) == 'string') {
          data = JSON.parse(data);
        } else {
          data = data;
        }

        if (data.flag == 101) {
          this.showCredentialsAlert();
          setTimeout(() => { this.DisableOnload = false; }, 1200);
        }

        if (data.flag == 807) {
          setTimeout(() => { this.DisableOnload = false; }, 1200);
        } else {

          setTimeout(() => { this.DisableOnload = false; }, 1200);

          this.booking['cardSelected'] = 'corporate';
          this.showCardList();

          this.totalCards = data.count;
          this.Cards = [];

          data.corporateCards.forEach((cardInfo) => {
            if (cardInfo.default_card == 1) {
              this.booking.cardIdCorporate = cardInfo.id;
            }

            if (Date.parse(cardInfo.card_added_on)) {
              const dt = new Date(cardInfo.card_added_on);
              dt.setMinutes(dt.getMinutes() - cardInfo.offset);
              cardInfo.card_added_on = dt.toISOString();
            }
            this.Cards.push(cardInfo);
          });

          this.RiderCards = [];
          data.userCards.forEach((card) => {
            if (card.default_card == 1) {
              this.booking.cardIdUser = card.id;
            }

            if (Date.parse(card.card_added_on) && (card.offset)) {
              const dt = new Date(card.card_added_on);
              dt.setMinutes(dt.getMinutes() - card.offset);
              card.card_added_on = dt.toISOString();
            }
            this.RiderCards.push(card);
          });
        }
      });
  }

  public paymentProcess() {

    this.httpService.post(environment.urlC + 'ride_payment_process', {
      web_access_token: this.cookieService.get("web_access_token"),
      card_user_type: this.booking.card_user_type,
      mobile: this.promoCountryCode + this.booking.user_mobile,
      user_id: this.booking.user_id
    })
      .subscribe((data) => {

        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;

        if (data.flag == 101) {
          this.showCredentialsAlert();
        }
        if (data.error || data.flag == 0) {
          this.utilityService.toast('error', data.error || data.message, '');
          return;
        } else {
          // this.$apply();
        }
      });
  }

  private showPaymentStep() {
    $('#payment_step').modal('show');
  }


  public timeSelected(when?) {
    $('#request_ride_later').hide();

    this.Cards = [];
    this.RiderCards = [];
    this.getCards();

    this.stepTimeSelector = 1;
    this.stepPaymentSelector = 1;
    this.corporateCards = 1;
    this.riderCards = 0;

    if (this.booking.card_user_type === 1) {
      this.booking.cardSelected == 'corporate';
      this.booking.card_user_type = 1;
      this.corporateCards = 1;
      this.riderCards = 0;
    } else if (this.booking.card_user_type === 0) {
      this.booking.cardSelected == 'rider';
      this.booking.card_user_type = 0;
      this.corporateCards = 0;
      this.riderCards = 1;
    } else {
      this.booking.cardSelected == 'corporate';
      this.booking.card_user_type = 1;
      this.corporateCards = 1;
      this.riderCards = 0;
    }
    //this.booking.cardOTP = '9999';

    if (when == 'now') {
      this.paymentForNow = 1;
      this.paymentForLater = 0;

      /*** Check if both Rider and Corporate Cards are enabled?, If Yes, then only we will show payment step ****/
      if (this.settings.bothEnabled == true) {
        if (!this.booking.returnRide) {
          this.showPaymentStep();
        } else {
          // this.booking.card_user_type = 1;
          $('#loading').modal('show');
          setTimeout(() => {
            //$('#request_right_now_1').modal('show');	
            this.BookRideRightNow()
            $('#loading').modal('hide');
          }, 1000);
        }
      } else {
        this.booking.card_user_type = (this.settings.CorpCardEnabled == true) ? 1 : 0;
        $('#loading').modal('show');
        setTimeout(() => {
          //$('#request_right_now_1').modal('show');
          this.BookRideRightNow();
          $('#loading').modal('hide');
        }, 1000);
      }
    } else {
      this.paymentForNow = 0;
      this.paymentForLater = 1;
      if (!this.validateBookingData()) {
        return false;
      } else {
        /*** Check if both Rider and Corporate Cards are enabled?, If Yes, then only we will show payment step ****/
        if (this.settings.bothEnabled == true) {
          if (!this.booking.returnRide) {
            this.showPaymentStep();
          } else {
            this.booking.card_user_type = 1;
            $('#loading').modal('show');
            setTimeout(() => {
              this.BookRideLater();
              $('#loading').modal('hide');
            }, 1000);

          }
        } else {
          this.booking.card_user_type = (this.settings.CorpCardEnabled == true) ? 1 : 0;

          $('#loading').modal('show');
          setTimeout(() => {
            this.BookRideLater();
            $('#loading').modal('hide');
          }, 1000);
        }
      }
    }
  }

  private sorterFunc(car) {
    return parseFloat(car.value_regular);
  };


  private addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }


  private validateDateTime() {
    var datedata = this.booking.date.split(', ');

    let today = new Date();
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd
    }

    if (mm < 10) {
      mm = '0' + mm
    }

    let dateToday = yyyy + '-' + mm + '-' + dd;


    if (datedata[0] === dateToday) {
      var d = new Date();
      var h = d.getHours();
      var m = d.getMinutes();

      let sm, sh = h;
      if (m <= 5) {
        sm = 5; //TODO: 05
      } else if (m <= 10) {
        sm = 10;
      } else if (m <= 15) {
        sm = 15;
      } else if (m <= 20) {
        sm = 20;
      } else if (m <= 25) {
        sm = 25;
      } else if (m <= 30) {
        sm = 30;
      } else if (m <= 35) {
        sm = 35;
      } else if (m <= 40) {
        sm = 40;
      } else if (m <= 45) {
        sm = 45;
      } else if (m <= 50) {
        sm = 50;
      } else if (m <= 55) {
        sm = 55;
      } else if (m <= 59) {
        sm = 0; //TODO: 00
        if (h != 23) {
          sh = sh + 1;
        } else if (h == 23) {
          sh = 0;
        }
      }

      if (h != 23) {
        sh = sh + 1;
      } else if (h == 23) {
        sh = 0;
      }


      sm = this.addZero(sm);
      sh = this.addZero(sh);



      var hour_difference = sh - parseInt(this.booking.time_hour);
      var min_difference = sm - parseInt(this.booking.time_minutes);

      if (hour_difference == 0) {

        if (min_difference <= 0) {

        } else {

          return 0;
        }

      } else if (hour_difference >= 1) {

        return 0;
      } else if (hour_difference <= 1) {

      }

    } else {


      var date1 = new Date(datedata[0]);
      var date2 = new Date(dateToday);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (this.max_schedule_ride_days_count < diffDays) {
        return 8;
      }

      return 1;
    }
    return 1;
  }

  public validateBookingData() {
    if (!this.booking.date) {
      this.utilityService.alert("error", "Please enter Date of travel");
      return 0;
    } else if (!this.booking.time_hour || (this.booking.time_hour == '')) {
      this.utilityService.alert("error", "Please select Time.");
      return 0;
    } else if (!this.booking.time_minutes) {
      this.utilityService.alert("error", "Please select Time minutes.");
      return 0;
    } else if (this.validateDateTime() == 0) {
      this.utilityService.alert("error", "Please select minimum one hour from now.");
      return 0;
    } else if (this.validateDateTime() == 8) {
      this.utilityService.alert("error", "You are allowed to book a scheduled ride for upto next 6 days only");
      return 0;
    } else {
      return 1;
    }

  }

  CorpCard: any;
  RiderCard: any;
  public getPaymentMode() {

    this.httpService.post(environment.urlC + 'list_card_payment_option', {
      web_access_token: this.cookieService.get("web_access_token"),
    }).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;

      if (data.flag == 101) {
        // this.showCredentialsAlert(); TODO:
      }

      if (data.payment_type[0].card_used == true) {
        this.settings.CorpCardEnabled = true;
        this.settings.RiderCardEnabled = true;
        this.settings.bothEnabled = true;
      } else if (data.payment_type[0].card_used == 2) {
        this.settings.CorpCardEnabled = true;
        this.settings.RiderCardEnabled = false;
        this.settings.bothEnabled = false;
      } else if (data.payment_type[0].card_used == 3) {
        this.settings.CorpCardEnabled = false;
        this.settings.RiderCardEnabled = true;
        this.settings.bothEnabled = false;
      }
      if ((this.settings.RiderCardEnabled == true) && (this.settings.CorpCardEnabled == true)) {
        this.settings.bothEnabled = true;
      } else {
        this.settings.bothEnabled = false;
      }

      this.CorpCard = this.settings.CorpCardEnabled;
      this.RiderCard = this.settings.RiderCardEnabled;

    });

  }

  public getDate(newday?) {

    var today: any = new Date();
    var dd: any = today.getDate();
    var mm: any = today.getMonth() + 1; //January is 0!
    var yyyy: any = today.getFullYear();

    if (newday) {
      if ((dd == 31) && ((mm == 1) || (mm == 3) || (mm == 5) || (mm == 7) || (mm == 8) || (mm == 10) || (mm == 12))) {
        dd = 1;
        if (mm == 12) {
          mm = 1;
          yyyy = yyyy + 1;
        } else {
          mm = mm + 1;
        }
      } else if ((dd == 30) && ((mm == 4) || (mm == 6) || (mm == 9) || (mm == 11))) {
        dd = 1;
        mm = mm + 1;
      } else if ((dd == 29) && (mm == 2) && (yyyy % 4 == 0)) {
        dd = 1;
        mm = mm + 1;
      } else if ((dd == 28) && (mm == 2) && (yyyy % 4 != 0)) {
        dd = 1;
        mm = mm + 1;
      } else {
        dd = dd + 1;
      }
    }


    if (dd < 10) {
      dd = '0' + dd
    }

    if (mm < 10) {
      mm = '0' + mm
    }

    let dateToday = yyyy + '-' + mm + '-' + dd;

    this.booking.date = dateToday;


    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var n = weekday[today.getDay()];

    this.booking.date = this.booking.date + ', ' + n;

  }
  public getHour() {
    var d: any = new Date();
    var h: any = d.getHours();
    var m: any = d.getMinutes();


    if (m <= 5) {
      m = 5;
    } else if (m <= 10) {
      m = 10;
    } else if (m <= 15) {
      m = 15;
    } else if (m <= 20) {
      m = 20;
    } else if (m <= 25) {
      m = 25;
    } else if (m <= 30) {
      m = 30;
    } else if (m <= 35) {
      m = 35;
    } else if (m <= 40) {
      m = 40;
    } else if (m <= 45) {
      m = 45;
    } else if (m <= 50) {
      m = 50;
    } else if (m <= 55) {
      m = 55;
    } else if (m <= 59) {
      m = 0;

      if (h != 23) {
        h = h + 1;
      } else if (h == 23) {
        h = 0;
        this.getDate('add');
      }
    }

    if (h != 23) {
      h = h + 1;
    } else if (h == 23) {
      h = 0;
      this.getDate('add');
    }

    m = this.addZero(m);
    h = this.addZero(h);

    h = '' + h;
    m = '' + m;
    this.booking.time_hour = h;
    this.booking.time_minutes = m;
  }

  public promoPopupShow() {
    $('#request_right_now').modal('hide');
    $('#request_right_now_1').modal('hide');
    $('#show_PaymentError').modal('hide');
    $('#showRiderCardError').modal('hide');
    $('#promoCodeEnter').modal('show');
  }

  public timeScheduler() {
    this.stepTimeSelector = 1;
    this.stepPaymentSelector = 1;
  }

  public cancelAndUnselect() {
    if (!this.booking.autoHitApi) {
      /*this.booking.driver_id  = ''
      this.booking.car_type  = 1
      this.booking.select_car_type  = 1
    	
      this.booking.driver_selected = 0;
      this.booking.car_selected = 0;*/
      this.showCar();
    }
    this.promo_applied = 0;
    this.booking.promo_code = undefined;
  }

  public showConfirm() {
    $('#show_confirmation').modal('show', { backdrop: 'static', keyboard: false });
    this.booking.confirmNow = 1;
  }

  public showCardList() {
    if (this.booking.cardSelected == 'corporate') {
      this.booking.card_user_type = 1;
      this.corporateCards = 1;
      this.riderCards = 0;
      console.log(this.booking.cardSelected)
    } else if (this.booking.cardSelected == 'rider') {
      this.corporateCards = 0;
      this.riderCards = 1;
      this.booking.card_user_type = 0;
      console.log(this.booking.cardSelected)
      if (this.RiderCards.length == 0) {
        this.showRiderCardError();
      }
    }
  }

  public showRiderCardError() {
    $('#request_right_now').modal('hide');
    $('#request_right_now_1').modal('hide');
    $('#show_PaymentError').modal('hide');
    $('#promoCodeEnter').modal('hide');
    $('#showRiderCardError').modal('show');

  }

  public getDriversDatas() {
    var datedata = this.booking.date.split(', ');

    this.booking.time = datedata[0] + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes + ':00';

    this.myQudosMode = 1;

    this.UserQudosMode = 0;
    this.AllQudosMode = 0;

    this.booking.selectedTime = new Date();

    var timeInThatArea = new Date().toLocaleString("en-US", { timeZone: this.booking.timezone });
    this.booking.timeInThatArea = new Date(timeInThatArea);
    this.booking.timeInThatAreaLocale = new Date(timeInThatArea).toLocaleString();

    if (this.booking.user_id) {

      this.httpService.post(environment.urlC + 'get_ride_data', {
        web_access_token: this.cookieService.get('web_access_token'),
        user_id: this.booking.user_id,
        region_id: 24,
        car_type: this.booking.car_type,
        is_essential: this.essential

      }).subscribe((data) => {

        if (typeof (data) == 'string') data = JSON.parse(data);

        if (data.flag == 1317) {
          this.utilityService.toast('warning', data.error, '');
          this.shoUserAddScreen();
          this.addtoAccount();
          $('#loading').modal('hide');
          // this.$apply();
        } else if (data.error || data.flag == 0) {
          this.utilityService.toast('error', data.error || data.message, '');
          return;
        } else {
          this.corporateFavDriver = data.corporateFavDriver;
          this.userFavDriver = data.userFavDriver;
          this.all_drivers = data.all_drivers;

          if (this.booking.autoHitApi) {
            $('#loading').modal('hide');
            // $('#add_to_account').modal('show');
          } else {
            $('#loading').modal('hide');
            if ((this.booking.carSelected == 0) || (this.forceShowDriver)) {
              this.showUser();
            }
          }

          if (this.userFavDriver.length == 0) {

          }

        }
      });

    } else {

    }
  }


  public setDefaultCard() { }
  public doNothing() { }

  public BookRideRightNow() {
    this.DisbleOnBRN = true;

    // this.booking.cardId = '';
    if (this.booking.card_user_type == 1) {
      this.booking.cardId = this.booking.cardIdCorporate;
    } else {
      this.booking.cardId = this.booking.cardIdUser;
    }

    if (!this.booking.cardId) {
      if (this.settings.bothEnabled == true) {
        this.showPaymentAlert();
        setTimeout(() => {
          this.DisbleOnBRN = false;
        }, 2500)
        return false;
      }

      else {
        // $('#show_PaymentError').modal('hide');
        this.utilityService.alert('info', 'Please Add a new card.');

        // $('#loading').modal('hide');
        // setTimeout(function(){$('#request_right_now').modal('hide');},300);
        setTimeout(() => {
          this.DisbleOnBRN = false;
        }, 2500)
        return false;
      }
    } else {
      setTimeout(() => {
        this.DisbleOnBRN = false;
      }, 2500)
    }

    // if (this.buttonNowClicked === 1) {           
    // 	alert('Please Wait while we complete the request for you!');
    // 	setTimeout(function(){
    // 		this.DisableOnload = false;
    // 	},1500)
    // 	return false;
    // }


    // $('#request_right_now').modal('show');


    // this.buttonNowClicked = 0;
    setTimeout(() => {
      this.DisbleOnBRN = false;
    }, 2500)
    this.requestRideAPI();

    /*$.post(MY_CONSTANT.urlC + 'ride_payment_process', {
        web_access_token: $cookieStore.get("web_access_token"),			
        card_user_type: this.booking.card_user_type,
        mobile: this.promoCountryCode +this.booking.user_mobile,
        user_id: this.booking.user_id			
      })
    .then(function successCallback(data, status) {
    	
      if (typeof(data) == 'string')
        data = JSON.parse(data);
      else data = data;
  	
      if (data.flag == 101) {
        this.buttonNowClicked = 0;
        $('#request_right_now').modal('hide');
        this.showCredentialsAlert();
      }
      if(data.error || data.flag==0){
        $('#request_right_now').modal('hide');
        $('#request_right_now_1').modal('hide');				
              	
        $('#show_confirmation').modal('hide');
        $('#show_cardError').modal('hide');
        $('#loading').modal('hide');	
        this.buttonNowClicked = 0;
        this.$apply();
        alert(data.error || data.message);
          return;
      } else {
        this.buttonNowClicked = 0;
          this.requestRideAPI();
        	
      }
    })*/

  }

  public resetForBookingOnError() {
    this.requestPending = 0;
    this.buttonLaterClicked = 0;
    this.buttonNowClicked = 0;
    $('#loading').modal('hide');
    $('#request_right_now').modal('hide');
    //$('#request_ride_later').modal('hide');
  }

  public requestRideAPI() {

    this.DisableOnload = true;
    this.DisbleOnBRN = true;
    // this.booking.cardId = '';
    if (this.booking.card_user_type == 1) {
      this.booking.cardId = this.booking.cardIdCorporate;
    } else {
      this.booking.cardId = this.booking.cardIdUser;
    }

    var datedata = this.booking.date.split(', ');
    this.booking.time = datedata[0] + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes;

    if (this.notFav) {

      var params: any = {
        web_access_token: this.cookieService.get('web_access_token'),
        current_latitude: this.booking.current_latitude,
        current_longitude: this.booking.current_longitude,
        estimated_fare: this.booking.estimated_fare,
        ride_estimate_distance: this.booking.ride_estimate_distance,
        ride_estimate_time: this.booking.ride_estimate_time,
        pickup_location_address: this.booking.pickup_location_address,
        latitude: this.booking.latitude,
        longitude: this.booking.longitude,
        car_type: this.booking.car_type,
        is_favt: 0,
        select_car_type: this.booking.select_car_type,
        manual_destination_latitude: this.booking.manual_destination_latitude,
        manual_destination_longitude: this.booking.manual_destination_longitude,
        manual_destination_address: this.booking.manual_destination_address,
        toll: this.booking.toll,
        route: '',
        promo_code: this.booking.promo_code,
        user_id: this.booking.user_id,
        offset: this.booking.offset,
        card_user_type: this.booking.card_user_type,
        card_id: this.booking.cardId,
        is_essential: 0 //this.essential

        //promo_value:this.booking.promo_value,
      };

    } else {

      var params: any = {
        web_access_token: this.cookieService.get('web_access_token'),
        current_latitude: this.booking.current_latitude,
        current_longitude: this.booking.current_longitude,
        estimated_fare: this.booking.estimated_fare,
        ride_estimate_distance: this.booking.ride_estimate_distance,
        ride_estimate_time: this.booking.ride_estimate_time,
        pickup_location_address: this.booking.pickup_location_address,
        latitude: this.booking.latitude,
        longitude: this.booking.longitude,

        car_type: this.booking.car_type,
        is_favt: this.booking.driver_id,
        manual_destination_latitude: this.booking.manual_destination_latitude,
        manual_destination_longitude: this.booking.manual_destination_longitude,
        manual_destination_address: this.booking.manual_destination_address,
        toll: this.booking.toll,
        route: '',
        promo_code: this.booking.promo_code,
        user_id: this.booking.user_id,
        offset: this.booking.offset,
        card_user_type: this.booking.card_user_type,
        card_id: this.booking.cardId,
        is_essential: 0 //this.essential
        //promo_value:this.booking.promo_value,
      };

    }

    if (!this.booking.card_user_type) {
      /*if(!this.booking.cardOTP){				
        $('#rider_payment_otp').modal('show');
        return false;
      }*/
      params.otp = this.booking.cardOTP;
    }

    if (!this.booking.cardId) {
      this.requestPending = 0;
      this.resetForBookingOnError();
      this.utilityService.alert('info', 'Please select a valid card.');
      $('#request_right_now').modal('hide');
      setTimeout(() => {
        this.DisableOnload = false;
        this.DisbleOnBRN = false;
      }, 2000)
      return false;
    } else {
      setTimeout(() => {
        this.DisableOnload = false;
        this.DisbleOnBRN = false;
      }, 2000)

    }

    if (this.booking.card_user_type == 1) {
      this.booking.cardId = this.booking.cardIdCorporate;
    } else {
      this.booking.cardId = this.booking.cardIdUser;
    }
    params.card_id = this.booking.cardId;

    this.buttonNowClicked = 1;
    this.httpService.post(environment.urlC + 'request_ride', params).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.flag == 101) {
        this.resetForBookingOnError();
        this.showCredentialsAlert();
        $('#loading').modal('hide');
        setTimeout(() => {
          this.DisableOnload = false;
          this.DisbleOnBRN = false;
        }, 2000)
      } else if (data.flag == 303) {
        $('#request_right_now').modal('hide');
        this.resetForBookingOnError();

        this.showCardAlert();
        $('#loading').modal('hide');
        setTimeout(() => {
          this.DisableOnload = false;
          this.DisbleOnBRN = false;
        }, 2000)
      } else if (data.error && data.flag == 213) {

        $('#request_right_now').modal('hide');
        this.resetForBookingOnError();
        $('#request_right_now').modal('hide');
        $('#request_right_now_1').modal('hide');
        $('#rider_payment_otp').modal('hide');

        $('#show_confirmation').modal('hide');
        $('#show_cardError').modal('hide');
        $('#loading').modal('hide');
        setTimeout(() => {
          this.DisableOnload = false;
          this.DisbleOnBRN = false;
        }, 2000)
        this.utilityService.toast('error', data.error || data.message, '');
        return;
      } else if (data.error && data.flag == 906) {
        this.resetForBookingOnError();
        $('#loading').modal('hide');
        this.showPaymentAlert();
        // this.$apply();
        // alert(data.error );
        setTimeout(() => {
          this.DisableOnload = false;
          this.DisbleOnBRN = false;
        }, 2000)
        // this.openToast('error', data.error || data.message, '');

      } else if (data.error && data.flag == 921) {
        this.resetForBookingOnError();

        $('#request_right_now').modal('hide');
        $('#loading').modal('hide');
        // alert(data.error);
        setTimeout(() => {
          this.DisableOnload = false;
          this.DisbleOnBRN = false;
        }, 2000)
        this.utilityService.alert('error', data.error, '');
        //this.showPaymentAlert();
        return;
      } else if (data.error || data.flag == 0) {

        this.resetForBookingOnError();
        $('#request_right_now').modal('hide');
        $('#request_right_now_1').modal('hide');
        $('#request_right_now').modal('hide');
        $('#loading').modal('hide');
        // this.$apply();
        /*
          if(data.error == 'Incorrect verification code'){
            $('#rider_payment_otp').modal('show');	
          }
        */
        setTimeout(() => {
          this.DisableOnload = false;
          this.DisbleOnBRN = false;
        }, 2000)
        setTimeout(() => {
          this.utilityService.toast('error', data.error || data.message, '');
        }, 0);

      } else if (data.flag == 202) {
        $('#loading').modal('hide');
        localStorage.setItem('defaultTab', 'reg');

        $('#add_to_account').modal('hide');

        $('#request_right_now_1').modal('hide');
        $('#request_ride_later').modal('hide');
        $('#payment_step').modal('hide');
        $('#showRiderCardError').modal('hide');
        $('#show_PaymentError').modal('hide');
        $('#show_confirmation').modal('hide');
        $('#show_cardError').modal('hide');
        $('#rider_payment_otp').modal('hide');
        $('#loading').modal('hide');
        this.buttonNowClicked = 0;
        $('#request_right_now').modal('show')
        setTimeout(() => {
          $('#request_right_now').modal('hide');
          this.utilityService.toast('success', 'Ride Booked Successfully', '');
        }, 0);
        setTimeout(() => {
          this.DisableOnload = false;
          this.DisbleOnBRN = false;
        }, 2000)
        localStorage.setItem('routeOff', data.session_id);
        // $('.modal-backdrop.show').fadeOut();
        setTimeout(() => {
          clearInterval(stop);
          stop = undefined;
          location.reload();
          $('#request_right_now').modal('hide');
        }, 2100);

        // this.$apply();
      }
    }, () => {
      $('#request_right_now').modal('hide');
      this.buttonNowClicked = 0;
      this.utilityService.alert('error', 'Something went Wrong, Please check your Internet!');
      $('#loading').modal('hide');
      setTimeout(() => {
        this.DisableOnload = false;
        this.DisbleOnBRN = false;
      }, 2000);
    })
  }

  public resetForBookingOnSuccess() {
    $('#loading').modal('hide');
    $('#add_to_account').modal('hide');
    $('#request_ride_later').modal('hide');
    $('#payment_step').modal('hide');
    $('#showRiderCardError').modal('hide');
    $('#rider_payment_otp').modal('hide');
    $('#show_PaymentError').modal('hide');
    this.buttonLaterClicked = 0;
    this.buttonNowClicked = 0;
  }

  public BookRideLater() {
    if (!this.validateBookingData()) {
      return false;
    }

    this.showLoader = 1;
    // this.booking.cardId = '';

    if (this.booking.card_user_type == 1) {
      this.booking.cardId = this.booking.cardIdCorporate;
    } else {
      this.booking.cardId = this.booking.cardIdUser;
    }

    /*if(this.RiderCards.length == 0){
      this.showRiderCardError();
    }*/

    // if(!this.booking.cardId && !this.booking.returnRide){
    // 	$('#request_right_now').modal('hide');

    // 	alert('Please select a valid card.');
    // 	$('#loading').modal('hide');
    // 	return false;
    // }
    if (!this.booking.cardId) {
      if (this.settings.bothEnabled == true) {
        this.showPaymentAlert();
        return false;
      } else {
        this.utilityService.alert('info', 'Please Add a new card.');
        return false;
      }
    } else {

    }
    // if (this.buttonLaterClicked === 1) {           
    // 	// $rootScope.openToast('error', 'Please Wait while we complete the request for you!', '');
    // 	return false;
    // }

    // this.buttonLaterClicked = 1;

    this.httpService.post(environment.urlC + 'ride_payment_process', {
      web_access_token: this.cookieService.get("web_access_token"),
      card_user_type: this.booking.card_user_type,
      mobile: this.promoCountryCode + this.booking.user_mobile,
      user_id: this.booking.user_id
    }).subscribe((data) => {

      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;

      if (data.flag == 101) {
        this.buttonLaterClicked = 0;
        this.showCredentialsAlert();
      }
      if (data.error || data.flag == 0) {
        this.buttonLaterClicked = 0;
        this.utilityService.alert('error', data.error || data.message);
        return;
      } else {

        this.buttonLaterClicked = 0;
        this.scheduleRequestAPI();
      }
    })
  }

  public scheduleRequestAPI() {

    this.DisbleOnPFL = true
    if (!this.validateBookingData()) {
      this.requestPending = 0;
      this.resetForBookingOnError();
      setTimeout(() => {
        this.DisbleOnPFL = false
      }, 1500)
      return false;
    }

    this.showLoader = 1;

    /*if(!this.checkRiderAuthorization()){
      return false;
    }*/

    var datedata = this.booking.date.split(', ');
    this.booking.time = datedata[0] + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes + ':00';
    this.booking.selectedTime = new Date(this.booking.time);

    var timeInThatArea = new Date(this.booking.time).toLocaleString("en-US", { timeZone: this.booking.timezone });
    this.booking.timeInThatArea = new Date(timeInThatArea);
    this.booking.timeInThatAreaLocale = new Date(timeInThatArea).toLocaleString();

    // this.booking.cardId = '';

    if (this.booking.card_user_type == 1) {
      this.booking.cardId = this.booking.cardIdCorporate;
    } else {
      this.booking.cardId = this.booking.cardIdUser;
    }

    if (this.notFav) {
      var params: any = {
        web_access_token: this.cookieService.get('web_access_token'),
        current_latitude: this.booking.current_latitude,
        current_longitude: this.booking.current_longitude,
        estimated_fare: this.booking.estimated_fare_later,
        ride_estimate_distance: this.booking.ride_estimate_distance,
        ride_estimate_time: this.booking.ride_estimate_time,
        pickup_location_address: this.booking.pickup_location_address,
        latitude: this.booking.latitude,
        longitude: this.booking.longitude,
        pickup_time: this.booking.time,
        car_type: this.booking.car_type,
        driver_id: this.booking.driver_id,
        is_fav: 0,
        manual_destination_latitude: this.booking.manual_destination_latitude,
        manual_destination_longitude: this.booking.manual_destination_longitude,
        manual_destination_address: this.booking.manual_destination_address,
        toll: this.booking.toll,
        route: '',
        promo_code: this.booking.promo_code,
        user_id: this.booking.user_id,
        offset: this.booking.offset,
        promo_value: this.booking.promo_value,
        select_car_type: this.booking.select_car_type,
        favdriver: 0,
        card_user_type: this.booking.card_user_type,
        card_id: this.booking.cardId,
        is_essential: 0//this.essential

      };
    } else {
      var params: any = {
        web_access_token: this.cookieService.get('web_access_token'),
        current_latitude: this.booking.current_latitude,
        current_longitude: this.booking.current_longitude,
        estimated_fare: this.booking.estimated_fare_later,
        ride_estimate_distance: this.booking.ride_estimate_distance,
        ride_estimate_time: this.booking.ride_estimate_time,
        pickup_location_address: this.booking.pickup_location_address,
        latitude: this.booking.latitude,
        longitude: this.booking.longitude,
        pickup_time: this.booking.time,
        car_type: this.booking.car_type,
        driver_id: this.booking.driver_id,
        is_fav: this.booking.is_fav,
        manual_destination_latitude: this.booking.manual_destination_latitude,
        manual_destination_longitude: this.booking.manual_destination_longitude,
        manual_destination_address: this.booking.manual_destination_address,
        toll: this.booking.toll,
        route: '',
        promo_code: this.booking.promo_code,
        user_id: this.booking.user_id,
        offset: this.booking.offset,
        promo_value: this.booking.promo_value,
        card_user_type: this.booking.card_user_type,
        card_id: this.booking.cardId,
        is_essential: 0  //this.essential 

      };
    }

    if (!this.booking.card_user_type) {
      /*if(!this.booking.cardOTP){				
        $('#rider_payment_otp').modal('show');
        return false;
      }*/
      this.booking.cardOTP = '1234';

      params.otp = this.booking.cardOTP;
    }


    if (!this.booking.cardId && !this.booking.returnRide) {
      $('#request_right_now').modal('hide');
      this.resetForBookingOnError();
      alert('Please select a valid card.');
      $('#loading').modal('hide');
      return false;
    }

    if (this.booking.card_user_type == 1) {
      this.booking.cardId = this.booking.cardIdCorporate;
    } else {
      this.booking.cardId = this.booking.cardIdUser;
    }

    if (this.booking.returnRide) {
      params.card_id = this.booking.cardId;
    }

    // if (this.buttonLaterClicked === 1) {           
    // 	$rootScope.openToast('error', 'Please Wait while we complete the request for you!', '');
    // 	setTimeout(function(){
    // 		this.DisbleOnPFL = false
    // 	},1500)
    // 	return false;
    // }

    this.buttonLaterClicked = 1;

    this.httpService.post(environment.urlC + 'schedule_request', params).subscribe((data) => {

      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.flag == 101) {
        this.showCredentialsAlert();
        this.resetForBookingOnError();
        $('#loading').modal('hide');
        setTimeout(() => {
          this.DisbleOnPFL = false
        }, 1500)
      } else if (data.flag == 303) {
        this.showCardAlert();
        this.resetForBookingOnError();
        $('#loading').modal('hide');
        setTimeout(() => {
          this.DisbleOnPFL = false
        }, 1500)
      } else if (data.error && data.flag == 213) {
        this.resetForBookingOnError();
        $('#request_right_now').modal('hide');
        $('#request_right_now_1').modal('hide');
        $('#rider_payment_otp').modal('hide');

        $('#show_confirmation').modal('hide');
        $('#show_cardError').modal('hide');
        $('#loading').modal('hide');
        setTimeout(() => {
          this.DisbleOnPFL = false
        }, 1500)

        this.utilityService.toast('error', 'Ride has been already booked for this User, Please choose another Rider.', '');
        return;
      } else if (data.error || data.flag == 0) {
        this.resetForBookingOnError();
        $('#loading').modal('hide');
        $('#request_ride_later').modal('hide');

        if (data.error == 'Incorrect verification code') {
          //$('#rider_payment_otp').modal('show');	
        }
        this.utilityService.toast('error', data.error || data.message, '');
        setTimeout(() => {
          this.DisbleOnPFL = false
        }, 1500)
        return;
      } else if (data.flag == 906) {
        $('#loading').modal('hide');
        this.resetForBookingOnError();
        this.showPaymentAlert();
        this.utilityService.toast('error', data.error || data.message, '');
        setTimeout(() => {
          this.DisbleOnPFL = false
        }, 1500)
      } else if (data.error && data.flag == 921) {
        $('#loading').modal('hide');
        this.resetForBookingOnError();
        setTimeout(() => {
          this.DisbleOnPFL = false
        }, 1500)
        this.utilityService.toast('error', 'Your sub merchant account not added yet.', '');
        return;
      } else if (data.flag == 900) {
        localStorage.setItem('defaultTab', 'sch');
        localStorage.setItem('routeOff', data.session_id);
        $('#loading').modal('hide');
        $('#add_to_account').modal('hide');
        $('#request_ride_later').modal('hide');
        $('#payment_step').modal('hide');
        $('#showRiderCardError').modal('hide');
        $('#rider_payment_otp').modal('hide');
        this.buttonLaterClicked = 0;
        $('#show_PaymentError').modal('hide');

        this.showConfirm();
        setTimeout(() => {
          this.DisbleOnPFL = false
        }, 1500)
        this.utilityService.toast('success', 'Booking Scheduled Successfully', '');
      }
    }, () => {
      this.utilityService.alert('error', 'Something went Wrong!');
      this.buttonLaterClicked = 0;
      $('#loading').modal('hide');
      setTimeout(() => {
        this.DisbleOnPFL = false
      }, 1500)
    })
  }

  public checkRiderAuthorization() {
    if (!this.booking.returnRide) {
      if (this.booking.card_user_type == 0) {
        this.booking.cardId = this.booking.cardIdUser;
      } else {
        this.booking.cardId = this.booking.cardIdCorporate;
        return true;
      }
      $('#showRiderAuthorization').modal('show');
      return false;
    }
    return true;
  }

  public cancelRightNow() { }

  public closeConfirm() {
    $('#show_confirmation').modal('hide');
    $('#add_to_account').modal('hide');
    $('#show_cardError').modal('hide');
    $('#request_right_now_1').modal('hide');
    $('#request_right_now').modal('hide');
    $('#request_ride_later').modal('hide');
    $('#loading').modal('hide');
    //this.booking.confirmNow = 0;
    setTimeout(() => {
      //window.location.reload();
      clearInterval(stop);
      stop = undefined;
      location.reload();
    }, 0);
  }
  public closeCard(redirect?) {
    $('#loading').modal('hide');
    //this.booking.confirmNow = 0;	
    $('#show_cardError').modal('hide');
    //this.cardAlert = 0;		
    if (redirect) {
      $('.modal-backdrop.show').remove();
      setTimeout(() => {
        // $state.go('corporate.listCards');TODO:
      }, 1000);
    }
  }

  public closeandCard() {
    $('#add_to_account').modal('hide');
    $('#show_cardError').modal('hide');
    this.closeCard();
    $('#loading').modal('hide');
    $('#show_PaymentError').modal('hide');
    $('.modal-backdrop.show').fadeOut();
    $('#request_right_now').modal('hide');
    $('#request_right_now_1').modal('hide');
    setTimeout(() => {
      // $state.go('corporate.listCards'); //TODO:
    }, 1000);
  }


  public sendRiderCardAuthorization(when) {
    //$('#loading').modal('hide');
    $('#showRiderAuthorization').modal('hide');
    $('#request_ride_later').modal('hide');
    $('#payment_step').modal('hide');

    this.requestPending = 1;

    if (when == 'Now') {
      this.requestRideAPI();
    } else if (when == 'Later') {
      this.scheduleRequestAPI();
    }
  }

  public reSendRiderOTP() { }

  public closeandCancel() {
    $('#promoCodeEnter').modal('hide');
    this.booking.promo_code = undefined;
  }

  public closeandApply() {
    if (!this.booking.promo_code) {
      this.utilityService.alert('info', 'Please add Promo Code')
    }
    else {
      this.applyPromoCode();
    }
  }

  public applyPromoCode() {

    $('#loading').modal('show');
    this.httpService.post(environment.urlC + 'redeem_promotion', {
      web_access_token: this.cookieService.get("web_access_token"),
      promo_code: this.booking.promo_code,
      is_schedule: ''
    })
      .subscribe((data) => {

        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;

        if (data.flag == 101) {

          this.showCredentialsAlert();

        } else if (data.flag == 1401) {
          //this.booking.promo_code = undefined;
          $('#loading').modal('hide');
          this.booking.promo_code = ''
          this.promo_applied = 0;
          this.getFareEstimate();
          $('#promoCodeEnter').modal('show');
          // this.$apply();
          this.utilityService.toast('error', data.error || data.message, '');

        } else if (data.error || data.flag == 0) {
          this.booking.promo_code = ''
          $('#promoCodeEnter').modal('show');

          this.utilityService.toast('error', data.error || data.message, '');

          $('#loading').modal('hide');
          return;
        } else {
          this.promo_applied = 1;
          this.getFareEstimate();
          $('#promoCodeEnter').modal('hide');

          // this.$apply();
          this.utilityService.toast('success', data.log, '');
        }
        $('#loading').modal('hide');
      });

  }

  public closeNoUser(redirect?) {
    $('#loading').modal('hide');
    $('#no_User').modal('hide');
    setTimeout(() => {
      window.open('/#/corporate/riderSignup', '_blank'); //TODO:
    }, 1000);
  }
  public closeandReBook(redirect?) {
    $('#loading').modal('hide');
    $('#no_User').modal('hide');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  public createUser() {
    if (this.booking.proceed == 1) {

      this.getFareEstimate();
      return false;
    } else {

    }

    this.httpService.post(environment.urlC + 'new_user_register', {
      user_mobile: this.promoCountryCode + this.booking.user_mobile,
      user_name: this.booking.user_name,
      web_access_token: this.cookieService.get('web_access_token'),
    })
      .subscribe((data) => {
        // $rootScope.$apply(function () {
        if (typeof (data) == 'string') data = JSON.parse(data);
        if (data.error) {

          this.utilityService.toast('error', data.error, '');
          $('#no_User').modal('hide');
          return 0;
        } else {
          $('#no_User').modal('hide');

          this.booking.user_id = data.user_id;
          this.shoUserAddScreen();
          this.addtoAccount();
        }

        // });
      });
  }

  public createUserandProceed() {

    if (this.booking.proceed == 1) {

      this.getFareEstimate();
      return false;
    }
    this.httpService.post(environment.urlC + 'new_user_register', {
      user_mobile: this.promoCountryCode + this.booking.user_mobile,
      user_name: this.booking.user_name,
      web_access_token: this.cookieService.get('web_access_token'),
    })
      .subscribe((data) => {
        // $rootScope.$apply(function () {
        if (typeof (data) == 'string') data = JSON.parse(data);
        if (data.error) {
          this.utilityService.toast('error', data.error, '');
          $('#no_User').modal('hide');
          return 0;
        } else {
          $('#no_User').modal('hide');

          this.booking.proceed = 1;

          this.booking.user_id = data.user_id;
          this.getFareEstimate();
        }

        // });
      });


  }

  public reAddUser() {
    this.otpMode = 1;
    this.userToAdd = this.booking.user_id;
    // this.otpToAdd = '';
    this.DisableResnd = true;
    this.httpService.post(environment.urlC + 'associatedUser_resend_otp', {
      web_access_token: this.cookieService.get('web_access_token'),
      mobile: this.promoCountryCode + this.booking.user_mobile,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.error || data.flag == 0) {
        setTimeout(() => {
          this.DisableResnd = false;
        }, 1500)
        this.utilityService.toast('error', data.error || data.message, '');
        return;
      } else if (data.flag == 7) {
        this.utilityService.toast('success', 'OTP sent again!', '');
        setTimeout(() => {
          this.DisableResnd = false;
        }, 1500)
      }

    })
  }

  public completeUserAdd() {

    this.onInvalidOtp = true;

    if (this.otpToAdd === '' || !this.otpToAdd) {
      // alert('Select Expiry Date');
      this.utilityService.alert('info', 'Please Enter OTP ');
      setTimeout(() => {
        this.onInvalidOtp = false;
      }, 1000);
      return false;
    } else if (!this.booking.user_id) {
      this.utilityService.alert('info', 'Unknown User');
      setTimeout(() => {
        this.onInvalidOtp = false;
      }, 1000);
      return false;
    } else {
      this.httpService.post(environment.urlC + 'corporate_add_user', {
        web_access_token: this.cookieService.get('web_access_token'),
        user_id: this.booking.user_id,
        role: 0,
        otp: this.otpToAdd,
        mobile: this.userMobileToAdd
      }).subscribe((data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);

        if (data.error || data.flag == 0) {

          setTimeout(() => {
            this.onInvalidOtp = false;
          }, 1000);
          this.otpToAdd = "";
          this.utilityService.toast('error', data.error || data.message, '');
          // 
          return;
        } else {
          // this.onInvalidOTp = false;
          this.utilityService.toast('success', data.log || data.message, '');
          $('#add_myUser').modal('hide');
          //this.getDriversData(this.booking.user_id);
          this.getFareEstimate();
        }
      });
    }
  }



  public initCard() {

    var stripe = Stripe(environment.stripeKey);
    var elements = stripe.elements();

    var style = {
      base: {
        fontSize: '16px',
        color: "#32325d",
      }
    };

    card = elements.create('card', { style: style });
    card.mount('#card-element');
    card.addEventListener('change', (event) => {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', (event) => {

      event.preventDefault();

      stripe.createToken(card).then((result) => {

        if (result.error) {
          this.buttonClicked = 0;
          // Inform the customer that there was an error.

          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;

        } else {
          this.stripeTokenHandler(result.token);
        }
      });
    });
  }

  buttonClicked: any;

  public stripeTokenHandler(token) {

    if (this.buttonClicked === 1) {
      // $rootScope.openToast('error', 'Please Wait while we complete the request for you!', '');
      return false;
    }
    else {
      this.buttonClicked = 1;

      this.httpService.post(environment.urlC + 'add_credit_card', {
        web_access_token: this.cookieService.get("web_access_token"),
        nounce: token.id,
        card_type: 52,
        offset: new Date().getTimezoneOffset() * -1,

      }).subscribe((data) => {
        // $rootScope.$apply(function () { 
        setTimeout(() => {
          this.buttonClicked = 0;
        }, 3000);

        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;

        if (data.error) {
          $('#loading').modal('hide');
          this.utilityService.toast('error', data.error, '');
          return;
        } else {
          card.clear();
          this.utilityService.toast('success', data.log, '');

          this.Cards = [];
          this.RiderCards = [];
          this.getCards();

          $('#add_card').modal('hide');
          setTimeout(() => {
            $('#loading').modal('hide');
          }, 1100);

        }
        // })

      });
    }
  }


  public findPlace(type) {
    setTimeout(() => {
      this.findPlaceNow(type);
      //this.apply();				
    }, 500);
  };
  public findPlaceNow(type) {
    //return;
    var existing = '';
    var address = '';
    if (type == "pickup") {
      address = $('#pickup').val();

      if ((!address) || (address == '')) {

        this.booking.current_latitude = '';
        this.booking.current_longitude = '';
        this.booking.pickup_location_address = '';
        this.booking.latitude = '';
        this.booking.longitude = '';
        this.getDirectionsForBooking();
      } else {
        existing = this.booking.latitude;
      }
    } else if (type == 'drop') {
      address = $('#drop').val();

      if ((!address) || (address == '')) {

        this.booking.manual_destination_latitude = '';
        this.booking.manual_destination_longitude = '';
        this.booking.manual_destination_address = '';
        this.getDirectionsForBooking();
      } else {

        existing = this.booking.manual_destination_latitude;
      }
    } else if (type == "return-pickup") {
      address = $('#return-pickup').val();

      if ((!address) || (address == '')) {

        this.booking.current_latitude = '';
        this.booking.current_longitude = '';
        this.booking.pickup_location_address = '';
        this.booking.latitude = '';
        this.booking.longitude = '';
        this.getDirectionsForBooking();
      } else {
        existing = this.booking.latitude;
      }
    } else if (type == 'return-drop') {
      address = $('#return-drop').val();

      if ((!address) || (address == '')) {

        this.booking.manual_destination_latitude = '';
        this.booking.manual_destination_longitude = '';
        this.booking.manual_destination_address = '';
        this.getDirectionsForBooking();
      } else {

        existing = this.booking.manual_destination_latitude;
      }
    }

    if (address != '') {
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': address }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {

          var formatted_address = results[0].formatted_address;
          var latitude = results[0].geometry.location.lat();
          var longitude = results[0].geometry.location.lng();

          if (type == 'pickup') {
            this.booking.current_latitude = latitude;
            this.booking.current_longitude = longitude;
            //this.booking.pickup_location_address = formatted_address;						
            this.booking.pickup_location_address = $('#pickup').val();
            this.booking.latitude = latitude;
            this.booking.longitude = longitude;

            directionsDisplay.setMap(null);
          } else if (type == 'drop') {
            this.booking.manual_destination_latitude = latitude;
            this.booking.manual_destination_longitude = longitude;
            //this.booking.manual_destination_address = formatted_address;
            this.booking.manual_destination_address = $('#drop').val();

            directionsDisplay.setMap(null);
          } else if (type == 'return-pickup') {
            this.booking.current_latitude = latitude;
            this.booking.current_longitude = longitude;
            //this.booking.pickup_location_address = formatted_address;						
            this.booking.pickup_location_address = $('#return-pickup').val();
            this.booking.latitude = latitude;
            this.booking.longitude = longitude;

            directionsDisplay.setMap(null);
          } else if (type == 'return-drop') {
            this.booking.manual_destination_latitude = latitude;
            this.booking.manual_destination_longitude = longitude;
            //this.booking.manual_destination_address = formatted_address;
            this.booking.manual_destination_address = $('#return-drop').val();

            directionsDisplay.setMap(null);
          }
          this.getDirectionsForBooking();
        } else {

        }
      });
    } else if (address == '') {
      directionsDisplay.setMap(null);
    } else {

    }

  }

  public addMarker(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    markers.push(marker);
    // markers.setMap(null);
  }


  ride_new: any;
  ride_old: any;
  stopCompleted: number;
  pickup_time_formatted: any;
  pickup_time_used: any;
  fare_calculated: any;
  tripnumber: any;
  user_id: any;
  user_rating: any;
  user_email: any;
  driver_email: any;
  search_session_id: any;
  start_time_trip: any;
  start_time_formatted: any;
  accept_time: any;
  pickup_id: any;
  rideshistory: any;
  faretotal: any;
  driverLimit = 200;
  driverSkip = 0;
  dsearchFlag = 0;
  dsearchString = '';

  public expandDisc(daa): void {
    this.driverNames = '';
    if (this.tripDetailMode) {
      this.socketService.emit('corporateRequestedDriverList', { session_id: daa.session_id });

      this.classExpand = 1;
      this.ride_new = { 'status': daa.ride_status, 'session_id': daa.session_id, 'scheduled': daa.is_schedule };

      if (this.ride_old) {
        if (this.ride_old.session_id == this.ride_new.session_id) {
          if (this.ride_old.status != this.ride_new.status) {

            if (this.ride_new.status == 4) {
              var rts;
              if (this.ride_new.scheduled == 1) {

                if (this.scheduledrides[0].session_id != this.ride_old.session_id) {
                  rts = this.scheduledrides[0];
                } else {
                  rts = this.scheduledrides[1];
                }
              } else if (this.ride_new.scheduled == 0) {

                if (this.regular_rides[0].session_id != this.ride_old.session_id) {
                  rts = this.regular_rides[0];
                } else {
                  rts = this.regular_rides[1];
                }
              }
              this.expandDisc(rts);

              setTimeout(() => {
                this.expandDisc(rts);
                setTimeout(() => {
                  this.expandDisc(rts);
                }, 1000);
              }, 500);
              this.stopCompleted = 1;
            }
          }
        }
      }

      this.ride_old = { 'status': daa.ride_status, 'session_id': daa.session_id, 'scheduled': daa.is_schedule };

    }


    this.rideInFocus = daa;
    this.is_schedule = daa.is_schedule;
    this.ride_status = daa.ride_status;

    this.getRideText(daa.ride_status, daa.request_status, daa.is_active);

    this.pickup_time_raw = '';
    if (daa.is_schedule == '0') {
      this.pickup_time_formatted = moment(new Date(daa.start_time)).format('MM/dd/yyyy HH:mm a');
      this.pickup_time_used = daa.start_time;
      this.pickup_time_raw = daa.start_time;
    } else {
      this.pickup_time_formatted = moment(new Date(daa.pickup_time)).format('MM/dd/yyyy HH:mm a');
      this.pickup_time_used = daa.pickup_time;
      this.pickup_time_raw = daa.pickup_time_processed;
    }

    if (daa.ride_status == 3) {

    }

    if (daa.pickup_location_address) {
      this.pickup_location_address = daa.pickup_location_address;
    } else if (daa.address) {
      this.pickup_location_address = daa.address;
    }
    this.manual_destination_address = daa.manual_destination_address;

    this.driver_name = daa.driver_name;

    this.car_name = daa.car_name;
    this.driver_mobile = daa.driver_mobile;
    if (daa.total_with_tax) {
      daa.total_with_tax = parseFloat(daa.total_with_tax)

      daa.total_with_tax = daa.total_with_tax.toFixed(2);
      daa.total_with_tax = parseFloat(daa.total_with_tax)

      this.fare_calculated = "$" + daa.total_with_tax;
    } else {
      this.fare_calculated = "Unavailable";
    }

    let status = this.getTripStatus(this.rideInFocus.ride_status, this.rideInFocus.request_status, this.rideInFocus.is_active, this.rideInFocus.is_schedule);
    // let parts = status.split('<br>')
    // if (parts.length) {
    //   if (parts[0] == 'Completed') {
    //     status = parts[0] + "<br>" + parts[1]
    //   }
    // }
    this.showStatus = status
    // this.showStatus = $sce.trustAsHtml(this.showStatus); //TODO:

    if (daa.hasOwnProperty("session_id")) {
      // this.tripnumber = "Trip Number: #" + daa.session_id;
      this.tripnumber = "Trip #" + daa.session_id;
    }
    if (daa.hasOwnProperty("session_id") == false) {
      // this.tripnumber = "Trip Number:Unavailable";
      this.tripnumber = "Unavailable";
    }

    //Customer
    this.user_name = daa.user_name;
    this.user_id = daa.user_id;
    this.user_rating = daa.user_rating;
    this.user_mobile = daa.user_mobile;
    this.driver_mobile = daa.driver_mobile;
    this.user_email = daa.user_email;
    this.driver_email = daa.driver_email;
    this.user_image = daa.user_image;
    this.ride_essential = daa.ride_essential;
    this.session_id = daa.session_id;

    if (daa.user_image == null) {
      this.user_image = 'http://qudos-s3.s3.amazonaws.com/user_profile/user.png';
    }

    this.search_session_id = undefined;
    if (this.tripDetailMode) {
      if (this.hasDriver == 'YES') {
        if (this.driverEnable) {
        } else {
          this.search_session_id = daa.session_id;
        }
        this.socketService.emit('corporateDriverAvailablity', { session_id: this.search_session_id, limit: this.driverLimit, offset: this.driverSkip, searchFlag: this.dsearchFlag, searchString: this.dsearchString });
      } else {
        if (!this.driverEnable) {
          this.disableDrivers();
          this.cleanDrivers();
        }
      }
    }
    this.driver_image = daa.driver_image;

    if (daa.driver_image == null) {
      this.driver_image = 'http://qudos-s3.s3.amazonaws.com/user_profile/user.png';
    }

    this.start_time_trip = daa.start_time;
    this.start_time_formatted = '';
    if (daa.start_time != null) {
      this.start_time_formatted = moment(new Date(daa.start_time)).format('MM/dd/yyyy HH:mm a');
    } else if (daa.pickup_time != null) {
      this.start_time_formatted = moment(new Date(daa.pickup_time)).format('MM/dd/yyyy HH:mm a');
    }
    //History
    this.tzName = daa.tzName;
    this.accept_time = daa.accept_time;

    if (daa.is_schedule == '0') {
      this.schedule_calender_accept_time = daa.accept_time;
    } else {
      this.schedule_calender_accept_time = daa.schedule_calender_accept_time;
    }

    this.pickup_id = daa.pickup_id;
    this.session_id = daa.session_id;
    if (daa.pickup_id) {
      var scheduledrides_history = this.scheduledrides;
      if (scheduledrides_history) {
        var schhistory = [];
        for (let ride_history of scheduledrides_history) {
          if (daa.user_id == ride_history.user_id) {
            ride_history = { ...ride_history }
            schhistory.push(ride_history);
          } else {
            continue;
          }
        }
        this.rideshistory = schhistory;
      }
    } else if (daa.session_id) {
      var completedrides_history = this.completedRides;
      let total: any = 0;
      let comhistory = [];
      for (let ride_history of completedrides_history) {
        if (daa.driver_id == ride_history.driver_id) {
          ride_history = { ...ride_history }
          comhistory.push(ride_history);

          total = total + ride_history.fare_calculated;
          total = parseFloat(total)

          total = total.toFixed(2);
          total = parseFloat(total)
        } else {
          continue;
        }
      }
      this.rideshistory = comhistory;
      this.faretotal = total;
    }

  }

  hasDriver: string;
  public getRideText(ride_status, request_status, is_active) {
    this.hasDriver = 'NO';
    this.rideText = 'NO';
    //this.rideRechedulable = 'NO';
    this.rideMissed = 'NO';
    switch (ride_status) {
      case 0:
        if (request_status == 0) {
          this.rideText = "Yes";
        } else if (request_status == 1) {
          this.rideText = "Yes";
          this.hasDriver = 'YES';
        } else if (request_status == 10) {
          this.rideText = "Cancelled";
          this.rideMissed = "Yes";
        } else if (request_status == null && is_active == 0) {
          this.rideText = "Cancelled";
          this.rideMissed = "Yes";
        } else {
          this.rideText = "Yes";
        }
        break;
      case 1:
        this.rideText = "Yes";
        this.hasDriver = 'YES';
        break;
      case 2:
        this.rideText = "Yes";
        this.hasDriver = 'YES';
        break;
      case 3:
        this.rideText = "No-enroute";
        this.hasDriver = 'YES';
        break;
      case 4:
        this.rideText = "Completed";

        break;
      case 5:
        this.rideText = "Cancelled";
        break;
      case 6:
        this.rideText = "Cancelled";
        break;
      case 8:
        this.rideText = "Cancelled";
        break;
      case 9:
        this.rideText = "Cancelled";
        break;
      case 11:
        this.rideText = "Cancelled";
        break;
      default:
        this.rideText = "Default";
        break;
    }
    this.rideInFocus.rideText = this.rideText;
  }

  public getTripStatus(index, req, is_active, is_schedule) {

    if (this.rideInFocus.driver_name == null) {
      this.rideInFocus.driver_name = ' - ';
    }
    if (this.rideInFocus.estimate_pickup_time == null) {
      this.rideInFocus.estimate_pickup_time = '00:00';
    }
    if (this.rideInFocus.estimate_diff == "NaN") {
      this.rideInFocus.estimate_diff = '0';
    }


    if (is_schedule == "1") {
      switch (index) {
        case 0:
          if (req == 1) {
            return "Accepted<br>" + this.fare_calculated;
          } else if (req == 10) {
            //return "Lapsed";
            return "Missed";
          } else if (req == null && is_active == 0) {
            return "Missed";
          } else {
            //return "Driver Time to Accept<br>"+this.estimate_pickup_time+" mins";  
            return "Assigning";
          }
        case 1:
          //return "Picking Up";
          return "Estimate to Pickup<br>" + this.rideInFocus.estimate_pickup_time + " mins";
        case 2:
          return "Arrived";
        case 3:
          return "Estimate to Arrival<br>" + this.rideInFocus.estimate_diff + " mins";
        case 4:
          return "Completed<br>" + this.fare_calculated;
        case 5:
          return "Cancelled By Driver<br>Driver: " + this.rideInFocus.driver_name;

        case 6:
          return "Cancelled By Rider";

        case 7:
          return "Cancelled By Rider";

        case 8:
          return "Unsuccessful Payment";
        case 9:
          return "Cancelled by Admin";

        case 11:
          return "Cancelled By Corporate";

        default:
          return index + ' ' + req;

      }
    } else if (is_schedule == "0") {
      switch (index) {
        case 0:
          if (req == 1) {
            return "Accepted<br>" + this.fare_calculated;
          } else if (req == 10) {
            //return "Lapsed";
            return "Missed";
          } else if (req == null && is_active == 0) {
            return "Missed";
          } else {

            return "Driver Time to Accept<br>" + this.rideInFocus.timer + " mins";
          }
        case 1:
          return "Estimate to Pickup<br>" + this.rideInFocus.estimate_pickup_time + " mins";
        case 2:
          return "Arrived";
        case 3:
          return "Estimate to Arrival<br>" + this.rideInFocus.estimate_diff + " mins";
        case 4:
          return "Completed<br>" + this.fare_calculated;
        case 5:
          //return "Cancelled By Driver";
          return "Cancelled";
        case 6:
          //return "Cancelled By Rider";
          return "Cancelled";
        case 7:
          //return "Cancelled By Rider";
          return "Cancelled";
        case 8:
          return "Unsuccessful Payment";
        // return "Cancelled";	
        case 9:
          //return "Cancelled by Admin";
          return "Cancelled";
        case 11:
          //return "Cancelled By Corporate";
          return "Cancelled";
        default:
          return index + ' ' + req;

      }
    }

  }

  public disableDrivers() {

    clearInterval(gettingDrivers);

    this.availableCurrentPage = 0;
    this.availableCarsPages = 0;
    this.countAvailableCars = 0;

    this.availableFrom = 0;
    this.availableTo = 0;

    gettingDrivers = 0;
    this.cleanDrivers();
    setTimeout(() => {
      this.cleanDrivers();
    }, 1000);
  }
  public cleanDrivers(id?: any) {
    if (id) {

    } else {

      this.availableCurrentPage = 0;
      this.availableCarsPages = 0;
      this.countAvailableCars = 0;

      this.availableFrom = 0;
      this.availableTo = 0;
    }

    for (let i = 0; i < markers.length; i++) {
      if (markers[i].driver_id == id) {

      } else {
        markers[i].marker.setMap(null);
      }
    }
  }



  public imageCheck() {
    $('.center-block.image').height($('.center-block.image').width());
    /*$('.listing').each(function(i,d){
        if($(this).height() > 49){		$(this).find('.ride-status').css({'line-height':$(this).height()-20+"px",'height':$(this).height()-20+"px",});
        }
    });*/

    // check it once
    // setTimeout(function () {
    //     imageCheck()
    // }, 500);
  }
  public isNumberKeys(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    //console.log(charCode);

    if (charCode < 48 || charCode > 57) return false;

    return true;
  }
  public isNumberKey(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    //console.log(charCode);

    if (charCode == 43) return true;

    if (charCode < 48 || charCode > 57) return false;

    return true;
  }


  scheduleSkip: any;
  regularSkip: any;
  completedSkip: any;
  public pageChanged = (currentPage, type) => {
    this.active_trip_data = "";
    if (type == "scheduled") {
      this.scheduledCurrentPage = currentPage;

      if (this.scheduledCurrentPage == 0) {
        this.scheduledFrom = 1;
        this.scheduledTo = 15;
      }

      this.hideNextscheduled = 0;

      if (parseInt(`${this.totalItemsScheduled / 15 + 1}`) <= currentPage) {
        this.hideNextscheduled = 1;
      }
      for (var i = 1; i <= this.totalItemsScheduled / 15; i++) {
        if (this.scheduledCurrentPage == i) {
          this.scheduleSkip = 15 * (i - 1);

        }
      }

      if (this.scheduledCurrentPage == 1) {
        this.hidePrevscheduled = 1;
        this.hideNextscheduled = 0;
      } else if (this.scheduledCurrentPage == this.scheduledPages) {
        this.hidePrevscheduled = 0;
        this.hideNextscheduled = 1;
      } else {
        this.hidePrevscheduled = 0;
        this.hideNextscheduled = 0;
      }

      this.socketService.emit('corporateScheduledRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.scheduleSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });
    } else if (type == "regular") {
      this.regularCurrentPage = currentPage;

      if (this.regularCurrentPage == 0) {
        this.regularFrom = 1;
        this.regularTo = 15;
      }

      this.hideNext = 0;

      if (parseInt(`${this.totalItemsRegular / 15 + 1}`) <= currentPage) {
        this.hideNext = 1;
      }
      for (var i = 1; i <= this.totalItemsRegular / 15 + 1; i++) {
        if (this.regularCurrentPage == i) {
          this.regularSkip = 15 * (i - 1);
          //this.$apply();
        }
      }

      if (this.regularCurrentPage == 1) {
        this.hidePrev = 1;
        this.hideNext = 0;
      } else if (this.regularCurrentPage == this.regularPages) {
        this.hidePrev = 0;
        this.hideNext = 1;
      } else {
        this.hidePrev = 0;
        this.hideNext = 0;
      }

      if (this.regularPages <= 1) {
        this.hidePrev = 1;
        this.hideNext = 1;
      }

      this.socketService.emit('corporateRegularRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.regularSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });
    } else if (type == "completed") {
      this.completedCurrentPage = currentPage;

      if (this.completedCurrentPage == 0) {
        this.completedFrom = 1;
        this.completedTo = 15;
      }
      this.completedFrom = ((this.completedCurrentPage - 1) * 15) + 1;

      this.completedTo = this.completedFrom - 1 + 15;
      if (this.completedTo > this.totalItemsCompleted) {
        this.completedTo = this.totalItemsCompleted;
      }

      this.hideNextcompleted = 0;

      if (parseInt(`${this.totalItemsCompleted / 15 + 1}`) <= currentPage) {
        this.hideNextcompleted = 1;
      }
      for (var i = 1; i <= this.totalItemsCompleted / 15 + 1; i++) {
        if (this.completedCurrentPage == i) {
          this.completedSkip = 15 * (i - 1);

          //this.$apply();

        }
      }
      if (this.completedCurrentPage == 1) {
        this.hidePrevcompleted = 1;
        this.hideNextcompleted = 0;
      } else if (this.completedCurrentPage == this.completedPages) {
        this.hidePrevcompleted = 0;
        this.hideNextcompleted = 1;
      } else {
        this.hidePrevcompleted = 0;
        this.hideNextcompleted = 0;
      }


      this.socketService.emit('corporateCompletedRequests', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.completedSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 2 });
    } else if (type == "availableDrivers") {
      this.availableCurrentPage = currentPage;
      this.hideNextAV = 0;

      this.availableFrom = ((this.availableCurrentPage - 1) * this.driverLimit) + 1;
      this.availableTo = this.availableFrom - 1 + this.driverLimit;

      if (this.availableCurrentPage == 0) {
        this.availableFrom = 1;
        this.availableTo = this.driverLimit;
      }

      if (parseInt(`${this.totalAvailableCars / this.driverLimit + 1}`) <= currentPage) {
        this.hideNextAV = 1;
      }

      if ((this.availableCurrentPage == 1) && (this.availableCarsPages == 1)) {
        this.hidePrevsAV = 0;
        this.hideNextAV = 0;
      } else if (this.availableCurrentPage == 1) {
        this.hidePrevsAV = 1;
        this.hideNextAV = 0;
      } else if (this.availableCurrentPage == this.availableCarsPages) {
        this.hidePrevsAV = 0;
        this.hideNextAV = 1;
      } else {
        this.hidePrevsAV = 0;
        this.hideNextAV = 0;
      }

      if (!this.dsearchFlag) {
        //this.totalAvailableCars = this.totalAvailableCars/ this.driverLimit + 1;
      }

      /*if(parseInt(this.totalAvailableCars) <= currentPage){
        this.hideNextAV = 1;
      }*/
      for (var i = 1; i <= this.totalAvailableCars; i++) {
        if (this.availableCurrentPage == i) {
          if (!this.dsearchFlag) {
            this.driverSkip = this.driverLimit * (i - 1);

          }
        }
      }

      if (this.dsearchFlag) {
      } else {
      }
      this.socketService.emit('corporateDriverAvailablity', { limit: this.driverLimit, offset: this.driverSkip, searchFlag: this.dsearchFlag, searchString: this.dsearchString });
    }

  };

  blocked = 1;
  public blockcheck() {
    this.blocked = 0;
  }

  driverSkip = 0;
  public monitorLiveData() {

    this.socketService.emit('corporateCompletedRequests', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.completedSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 2 });

    this.socketService.emit('corporateScheduledRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.scheduleSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });

    this.socketService.emit('corporateRegularRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.regularSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });


    //this.socketService.emit('corporateDriverAvailablity', {limit:this.driverLimit,offset:this.driverSkip, searchFlag:this.dsearchFlag, searchString:this.dsearchString});

    $('#loading').modal('show');

    stop = setInterval(() => {

      this.socketService.emit('corporateCompletedRequests', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.completedSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 2 });

      this.socketService.emit('corporateScheduledRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.scheduleSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });

      this.socketService.emit('corporateRegularRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.regularSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });

      //this.socketService.emit('corporateDriverAvailablity', {limit:this.driverLimit,offset:this.driverSkip, searchFlag:this.dsearchFlag, searchString:this.dsearchString});

    }, 8000)

  }

  public addYourLocationButton(map, marker) {
    var controlDiv: any = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Your Location';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
    secondChild.style.backgroundSize = '180px 18px';
    secondChild.style.backgroundPosition = '0px 0px';
    secondChild.style.backgroundRepeat = 'no-repeat';
    secondChild.id = 'you_location_img';
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, 'dragend', () => {
      $('#you_location_img').css('background-position', '0px 0px');
    });

    firstChild.addEventListener('click', () => {
      var imgX = '0';
      var animationInterval = setInterval(() => {
        if (imgX == '-18') imgX = '0';
        else imgX = '-18';
        $('#you_location_img').css('background-position', imgX + 'px 0px');
      }, 500);
      if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition((position) => {
          var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          marker.setPosition(latlng);
          map.setCenter(latlng);
          clearInterval(animationInterval);
          $('#you_location_img').css('background-position', '-144px 0px');
        });
      }
      else {
        clearInterval(animationInterval);
        $('#you_location_img').css('background-position', '0px 0px');
      }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
  }


  public mapInit() {
    var bounds = new google.maps.LatLngBounds();
    this.driverDetails.latitude = this.driverModel.latitude;
    this.driverDetails.longitude = this.driverModel.longitude;

    if (!this.driverDetails.latitude) {
      var center: any = { lat: 40.732210, lng: -73.919020 };
      var zoom = 11;
    } else {
      var center: any = { lat: this.driverDetails.latitude, lng: this.driverDetails.longitude };
      var zoom = 13;
    }

    map = new google.maps.Map(document.getElementById('map'), {

      zoom: zoom,
      center: center,

      streetViewControl: false,
      mapTypeControl: false,

      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      }

    });

    var ny = { lat: 40.732210, lng: -73.919020 };

    var myMarker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      //position: ny
    });

    this.addYourLocationButton(map, myMarker);
    this.loadPlaces();
  }

  public loadPlaces() {

    var autocomplete = {};
    var autocompletesWraps = ['searchLocation'];
    $.each(autocompletesWraps, (index, name) => {

      if ($('#' + name).length == 0) {
        return;
      }
      autocomplete[name] = new google.maps.places.Autocomplete($('#' + name + '.autocomplete')[0],);

      google.maps.event.addListener(autocomplete[name], 'place_changed', () => {

        var place = autocomplete[name].getPlace();
        if (!place.geometry) {
          this.utilityService.alert('error', 'Location not found, Please select from the suggested locations!!');
          return;
        }


        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();

        var newlatlng = new google.maps.LatLng(latitude, longitude);

        map.setCenter(newlatlng);
        map.setZoom(this.driverZoom);

      });
    });
  }

  strtloca: any;
  strtlocaObj: any;
  strtloca: any;
  drvObj: any;
  mdes: any;
  mdesObj: any;

  public showonm(data) {

    this.MapShow = true;
    this.CarShow = false;
    this.UserShow = false;

    let routeState: any = {}
    if (data['session_id']) {
      routeState = {
        key: 'session_id',
        id: data.session_id
      }
      this.strtloca = data.pickup_latitude + ',' + data.pickup_longitude;

      this.strtlocaObj = { lat: data.pickup_latitude, lng: data.pickup_longitude };

    } else if (data['pickup_id']) {
      routeState = {
        key: 'pickup_id',
        id: data.pickup_id
      }
      this.strtloca = data.latitude + ',' + data.longitude;
      this.strtlocaObj = { lat: data.latitude, lng: data.longitude };
    }

    this.routeMode = 1;

    this.drvObj = { lat: data.current_location_latitude, lng: data.current_location_longitude };

    /*this.routeState = routeState;
    this.mdes = data.manual_destination_latitude + ','+ data.manual_destination_longitude;
    this.mdesObj = {lat:data.manual_destination_latitude,lng:data.manual_destination_longitude};
    this.getDirections();
    */
    if (this.routeState && this.routeState.key == routeState.key && this.routeState.id == routeState.id) {

      directionsDisplay.setMap(null);
      this.routeState = {};
    } else {
      this.routeState = routeState;
      this.mdes = data.manual_destination_latitude + ',' + data.manual_destination_longitude;
      this.mdesObj = { lat: data.manual_destination_latitude, lng: data.manual_destination_longitude };
      this.getDirections();
    }
  }

  fakeThisId = 0;
  public getDirections() {
    directionsDisplay.setMap(null);
    directionsDisplay.setMap(map);

    var request = {
      origin: this.strtloca,
      destination: this.mdes,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, (response, status) => {

      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);

        if (this.fakeThisId == this.routeState.id) {

          this.search_session_id = this.fakeThisId;
          /**** Displayed driver marker but to show this moving need to set Interval ******/
          this.socketService.emit('corporateDriverAvailablity', { session_id: this.search_session_id, limit: this.driverLimit, offset: this.driverSkip, searchFlag: this.dsearchFlag, searchString: this.dsearchString });
          setTimeout(() => {
            this.setCenterNow();
          }, 200);
        }

      } else {
        this.utilityService.alert('error', 'Google route unsuccesfull!');
      }
    });

  }

  public fakeCenter(ride, force?) {

    if (this.routeState.id == ride.session_id) {
      this.strtlocaObj = { lat: ride.pickup_latitude, lng: ride.pickup_longitude };
      this.mdesObj = { lat: ride.manual_destination_latitude, lng: ride.manual_destination_longitude };
      if (ride.current_location_latitude) {
        this.drvObj = { lat: ride.current_location_latitude, lng: ride.current_location_longitude };
      } else {

        this.drvObj = { lat: 40.710344, lng: -73.79898 };
      }


      this.fakeThisId = ride.session_id;
      if (force) {

        this.setCenterNow();
      }
      this.centering = 1;
    } else {

      this.showonm(ride);
      setTimeout(() => {
        this.fakeCenter(ride);
      }, 0);
    }
  }


  public setCenterNow() {

    var pointers = [
      this.strtlocaObj,
      this.mdesObj,
      this.drvObj,
    ];

    if (this.drvObj.lat != null) {
      for (let i = 0; i < pointers.length; i++) {
        var data = pointers[i]
        if (data.lat == null) { continue; }
        var myLatlng = new google.maps.LatLng(data.lat, data.lng);


        marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: '',
          icon: null,
          visible: false
        });

        bounds.extend(marker.position);
      }
      map.setCenter(bounds.getCenter());

      zoomlevel = map.getZoom();
      map.setZoom(zoomlevel);
    } else {

    }

  }

  lastBounds: any;

  public setBoundsNow(pointers: any) {
    map.setZoom(16);
    if (!pointers) {
      pointers = [
        this.strtlocaObj,
        this.mdesObj,
        this.drvObj,
      ];

    }
    if (pointers.length > 0) {

      for (let i = 0; i < pointers.length; i++) {
        var data = pointers[i]
        if (data.lat == null) { continue; }
        var myLatlng = new google.maps.LatLng(data.lat, data.lng);


        marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: '',
          icon: null,
          visible: false
        });

        bounds.extend(marker.position);
      }
      map.setCenter(bounds.getCenter());

      map.fitBounds(bounds);
      zoomlevel = map.getZoom();
      //map.setZoom(zoomlevel);
      this.driverZoom = zoomlevel;
      this.lastBounds = { searched: this.dsearchString, size: pointers.length, zoom: zoomlevel }

    } else {

    }

  }

  public move = (driverMarker, wait) => {
    if (driverMarker.path.length > 0) {
      driverMarker.isMoving = true;
      driverMarker.marker.setPosition(driverMarker.path[0][0]);
      let url = driverMarker.marker.getIcon().url;
      var markerImg: any = document.querySelector(`img[src="${url}"]`);
      if (markerImg) {
        var deg = driverMarker.path[0][1];
        markerImg.style.transform = 'rotate(' + deg + 'deg)'
      }
      driverMarker.path.splice(0, 1);
      setTimeout(() => {
        this.move(driverMarker, wait);
      }, wait);
      let icon = driverMarker.marker.getIcon();
      driverMarker.marker.setIcon(icon);
    } else {
      driverMarker.isMoving = false;
    }
  }


  setMarker(driverData, { image, infowindow, rotation }) {

    var driverMarker = _.find(markers, { 'driver_id': driverData.driver_id });
    var location = new google.maps.LatLng(driverData.current_location_latitude, driverData.current_location_longitude);
    var marker;
    if (driverMarker) {

      let prevPos = driverMarker.marker.getPosition();
      if (driverMarker.path.length > 0) {
        prevPos = driverMarker.path[driverMarker.path.length - 1][0];
      }
      let icon = driverMarker.marker.getIcon();
      icon.url = image.url;
      driverMarker.marker.setIcon(icon)
      driverMarker.marker.setMap(map);
      var rotation = google.maps.geometry.spherical.computeHeading(prevPos, location);
      let fromLat = prevPos.lat();
      let fromLng = prevPos.lng();
      let toLat = location.lat();
      let toLng = location.lng();
      if (fromLat != toLat || fromLng != toLng) {
        let diff = Date.now() - driverMarker.time;
        driverMarker.time = Date.now();
        let frames = driverMarker.path;
        let hasPath = false;
        if (frames.length > 0) {
          hasPath = true;
        }
        if (diff > 2000) {
          diff = 1000;
        }
        if (frames.length >= 100) {
          frames = []
        }


        for (var percent = 0; percent < 1; percent += 0.01) {
          let curLat = fromLat + percent * (toLat - fromLat);
          let curLng = fromLng + percent * (toLng - fromLng);
          frames.push([new google.maps.LatLng(curLat, curLng), rotation]);
        }
        driverMarker.path = frames;
        if (!hasPath) {
          this.move(driverMarker, diff / 100);
        } else if (!driverMarker.isMoving) {
          this.move(driverMarker, diff / 100);
        } else {
          this.move(driverMarker, 0.5);
        }
      }
      marker = driverMarker.marker;
    } else {

      marker = new google.maps.Marker({
        position: location,
        icon: image,
        map: map,
        infoWindow: infowindow,
      });
      marker.addListener('click', function (e) {
        marker.infoWindow.open(map, this);
        setTimeout(function () {
          var contentDiv = $('.gm-style-iw');
          contentDiv.next('div').hide();
          contentDiv.prev('div.custom-close').remove();
          var closeBtn =
            `<div class="custom-close" id="${driverData.driver_id}">
                                <img alt="" src="https://maps.gstatic.com/mapfiles/api-3/images/mapcnt6.png" draggable="false" style="position: absolute; left: -2px; top: -336px; width: 59px; height: 492px; user-select: none; border: 0px; padding: 0px; margin: 0px; max-width: none;">
                            </div>`;
          $(closeBtn).insertBefore(contentDiv)
          $('div.custom-close').bind('click', function (e) {
            $(e.target).parent().parent().css({ opacity: 0, 'pointer-events': 'none' });
          });
        });
      });

      new google.maps.event.trigger(marker, 'click');
      markers.push({
        driver_id: driverData.driver_id,
        marker: marker,
        time: Date.now(),
        path: [],
        isMoving: false,
      });
      // setTimeout(function() {
      // });
    }
    return marker;
  }

  public cancelRidePopup(session_id) {
    this.triptoCancel = session_id;
  };

  public cancelRide(trip) {

    if (trip) {
      $('#loading').modal('show');
      this.httpService.post(environment.urlC + 'cancel_ride', {
        web_access_token: this.cookieService.get('web_access_token'),
        session_id: trip
        //pickup_id:trip			
      }).subscribe((data) => {

        if (typeof (data) == 'string') data = JSON.parse(data);

        if (data.error || data.flag == 0) {
          $('#loading').modal('hide');
          this.utilityService.toast('error', data.error || data.message, '');

          return;
        } else {
          this.rideCancelButtonRef.nativeElement.click();
          this.utilityService.toast('success', 'Ride Cancelled Successfully', '');
          setTimeout(() => {
            $('#loading').modal('hide');
          }, 1000);
        }

        this.socketService.emit('corporateCompletedRequests', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.completedSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 2 });

        this.socketService.emit('corporateScheduledRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.scheduleSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });

        this.socketService.emit('corporateRegularRides', { corporate_id: this.driverDetails.corporate_id, limit: 15, offset: this.regularSkip, sort_by: '', sort_order: '', searchFlag: this.searchFlag, searchString: this.searchString, requestType: 5 });

      });
    } else {
      this.utilityService.alert('info', 'No pickup_id is found');
      $('#loading').modal('hide');
    }
  }


  public sendRiderCardLink() {
    $('#loading').modal('show');
    this.httpService.post(environment.urlC + 'ride_payment_user_card_send_link', {
      web_access_token: this.cookieService.get('web_access_token'),
      user_id: this.booking.user_id,
    }).subscribe((data) => {

      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.error || data.flag == 0) {
        $('#loading').modal('hide');
        this.utilityService.toast('error', data.error || data.message, '');

        return;
      } else {
        $('#loading').modal('hide');
        $('#showRiderCardError').modal('hide');
        // $('#payment_step').modal('hide');
        this.disableCRA = true;

        this.utilityService.toast('success', data.log, '');
        setTimeout(() => {
          this.disableCRA = false;
        }, 9000)
      }
    });
  }

  public validateRebookingDateTime() {
    var datedata = this.rebooking.date.split(', ');

    var today = new Date();
    var dd: any = today.getDate();
    var mm: any = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd
    }

    if (mm < 10) {
      mm = '0' + mm
    }

    let dateToday = yyyy + '-' + mm + '-' + dd;


    if (datedata[0] === dateToday) {
      var d = new Date();
      var h = d.getHours();
      var m = d.getMinutes();

      var sm, sh = h;
      if (m <= 5) {
        sm = 5; //TODO:05
      } else if (m <= 10) {
        sm = 10;
      } else if (m <= 15) {
        sm = 15;
      } else if (m <= 20) {
        sm = 20;
      } else if (m <= 25) {
        sm = 25;
      } else if (m <= 30) {
        sm = 30;
      } else if (m <= 35) {
        sm = 35;
      } else if (m <= 40) {
        sm = 40;
      } else if (m <= 45) {
        sm = 45;
      } else if (m <= 50) {
        sm = 50;
      } else if (m <= 55) {
        sm = 55;
      } else if (m <= 59) {
        sm = 0; //TODO:00
        if (h != 23) {
          sh = sh + 1;
        } else if (h == 23) {
          sh = 0;
        }
      }

      if (h != 23) {
        sh = sh + 1;
      } else if (h == 23) {
        sh = 0;
      }


      sm = this.addZero(sm);
      sh = this.addZero(sh);


      var hour_difference = sh - parseInt(this.rebooking.time_hour);
      var min_difference = sm - parseInt(this.rebooking.time_minutes);

      if (hour_difference == 0) {

        if (min_difference <= 0) {

        } else {

          return 0;
        }

      } else if (hour_difference >= 1) {

        return 0;
      } else if (hour_difference <= 1) {

      }

    } else {


      var date1 = new Date(datedata[0]);
      var date2 = new Date(dateToday);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (this.max_schedule_ride_days_count < diffDays) {
        return 8;
      }

      return 1;
    }
    return 1;
  }

  public validateReBookingData() {
    if (!this.rebooking.date) {
      this.utilityService.alert("info", "Please enter Date of travel");
      return 0;
    } else if (!this.rebooking.time_hour || (this.rebooking.time_hour == '')) {
      this.utilityService.alert("info", "Please select Time.");
      return 0;
    } else if (!this.rebooking.time_minutes) {
      this.utilityService.alert("info", "Please select Time minutes.");
      return 0;
    } else if (this.validateRebookingDateTime() == 0) {
      this.utilityService.alert("info", "Please select minimum one hour from now.");
      return 0;
    } else if (this.validateRebookingDateTime() == 8) {
      this.utilityService.alert("info", "You are allowed to book a scheduled ride for upto next 6 days only");
      return 0;
    } else {
      return 1;
    }

  }


  rescheduleNow() {
    this.DisableOnReschd = true;
    if (!this.rebooking || !this.rebooking.time_hour || !this.rebooking.date || !this.rebooking.time_minutes) {
      this.DisableOnReschd = false;
      this.utilityService.alert('info', "Please enter Date and Time");
      return;
    }

    if (!this.validateReBookingData()) {
      this.DisableOnReschd = false;
      return false;
    }


    var datedata = this.rebooking.date.split(', ');

    this.rebooking.time = datedata[0] + ' ' + this.rebooking.time_hour + ':' + this.rebooking.time_minutes + ':00';


    //this.rebooking.time = this.rebooking.date+' '+this.rebooking.time_hour+':'+this.rebooking.time_minutes;



    if (!this.rTrip.pickup_id) {
      this.utilityService.alert('info', 'Pickup ID is not found');
      this.DisableOnReschd = false;
      return false;
    }

    this.httpService.post(environment.urlC + 'modify_schedule', {
      web_access_token: this.cookieService.get('web_access_token'),
      pickup_id: this.rTrip.pickup_id,
      pickup_time: this.rebooking.time,
      latitude: this.rTrip.pickup_latitude,
      longitude: this.rTrip.pickup_longitude,
      offset: new Date().getTimezoneOffset() * -1,
      manual_destination_latitude: this.rTrip.manual_destination_latitude,
      manual_destination_longitude: this.rTrip.manual_destination_longitude,
      manual_destination_address: this.rTrip.manual_destination_address,
    }).subscribe((data) => {

      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.error || data.flag == 0) {

        setTimeout(() => {
          this.DisableOnReschd = false;
        }, 1500);
        this.utilityService.toast('error', data.error || data.message, '');

        return;
      } else {
        $('#reschedule').modal('hide');
        setTimeout(() => {
          this.DisableOnReschd = false;
        }, 1500);
        this.utilityService.toast('success', data.log, '');

      }

    });


  }


  setDate(stamp) {
    var year: any = new Date(stamp).getFullYear();
    var month: any = new Date(stamp).getMonth();

    month = month + 1;
    month = (month < 10) ? "0" + month : month;

    var day: any = new Date(stamp).getDate();
    day = (day < 10) ? "0" + day : day;
    var dateOfPickup = year + '-' + month + '-' + day;

    this.rebooking.date = dateOfPickup;
  }

  setTime(stamp) {
    let hours: any = new Date(stamp).getHours();
    hours = (hours < 10) ? "0" + hours : '' + hours;
    this.rebooking.time_hour = hours;



    let mins: any = new Date(stamp).getMinutes();
    mins = (mins < 10) ? "0" + mins : '' + mins;

    this.rebooking.time_minutes = mins;
  }


  rTrip: any = {};
  rescheduleRide(ride) {
    var tripDetails = ride;

    this.rTrip = tripDetails;
    this.rebooking = {};


    /** Now this is used**/
    this.rebooking.date = this.booking.date;

    this.rebooking.time_hour = this.booking.time_hour;
    this.rebooking.time_minutes = this.booking.time_minutes;

  }

  sockos: any;
  sockoc: any;
  centering: any;

  totalAvailableCars: any;
  avail: any;
  driverToFocus: any;

  driverListSubscription: Subscription;
  completedRequestSubscription: Subscription;
  scheduledRidesSubscription: Subscription;
  regularRidesSubscription: Subscription;
  driverAvailablitySubscription: Subscription;

  public socketListener(): void {
    this.driverListSubscription = this.socketService.on('corporateRequestedDriverList').subscribe((data) => {
      this.driverNames = '';
      this.driverrec2 = 0;
      this.driverrec3 = 0;
      this.driverNames = data.data.paginated_list;

      if (this.driverNames.length == 0) {
        this.requestLoader = 0;
      } else {
        this.requestLoader = 1;
      }
      this.driver1 = '';
      this.payment_date = ' - ';
      this.payment_timezone = ' - ';
      if (this.driverNames[0]) {
        this.driver1 = (this.driverNames[0].names != null) ? this.driverNames[0].names : '';
        this.payment_date = this.driverNames[0].payment_date;
        this.payment_timezone = new Date(this.driverNames[0].payment_date).toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        if ((this.payment_timezone == "India Standard Time") || (this.payment_timezone == "GMT+5:30")) {
          this.payment_timezone = 'IST';
        }
      }
      this.driver1 = this.driver1.replace(/,/g, '<br />');
      // this.driver1 = $sce.trustAsHtml(this.driver1); //TODO:




      if (this.driverNames[1]) {
        this.driverrec2 = 1;
        this.driver2 = '';
        this.driver2 = (this.driverNames[1].names != null) ? this.driverNames[1].names : '';
        this.driver2 = this.driver2.replace(/,/g, '<br />');
        // this.driver2 = $sce.trustAsHtml(this.driver2);  //TODO:
      }
      if (this.driverNames[2]) {
        this.driverrec3 = 1;
        this.driver3 = '';
        this.driver3 = (this.driverNames[2].names != null) ? this.driverNames[2].names : '';
        this.driver3 = this.driver3.replace(/,/g, '<br />');
        // this.driver3 = $sce.trustAsHtml(this.driver3);  //TODO:
      }

    });


    this.completedRequestSubscription = this.socketService.on('corporateCompletedRequests').subscribe((data) => {

      this.sockoc = data.data.paginated_rides;
      //this.completedRides = this.sockoc;
      this.totalItemsCompleted = data.data.count;


      var CompletedData = data.data.paginated_rides;

      this.completedRides = [];
      var i = 1;
      CompletedData.forEach((ride) => {
        var r = ride;

        if (ride.start_time) {
          var dt = new Date(ride.start_time)
          dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          r.start_time_raw = raw;
          r.start_time_original = ride.start_time;
          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        }
        if (ride.drop_time) {
          var dt = new Date(ride.drop_time)
          dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          r.drop_time_raw = raw;
          r.drop_time_original = ride.drop_time;
          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        }
        if (ride.pickup_time) {
          var dt = new Date(ride.pickup_time)
          dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          //r.pickup_time_raw =  raw;
          r.pickup_time_processed = ride.pickup_time;
          r.pickup_time_original = ride.pickup_time;

          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        }

        if ((r.tzName == "India Standard Time") || (r.tzName == "GMT+5:30")) {
          r.tzName = 'IST';
        }

        if (i == 1) {
          //this.showonm(r);	
        }
        i++;
        this.completedRides.push(r);
        if (!this.stopCompleted) {
          if (this.classExpand == 1) {
            if (this.rideInFocus.session_id == r.session_id) {

              this.expandDisc(r);
            }
          }
        }

      });

      this.completedPages = parseInt(`${this.totalItemsCompleted / 15 + 1}`);

      this.completedTo = this.completedFrom - 1 + 15;
      if (this.completedTo > this.totalItemsCompleted) {
        this.completedTo = this.totalItemsCompleted;
      }
      if (this.completedCurrentPage == 1) {
        this.hidePrevcompleted = 1;
        this.hideNextcompleted = 0;
      } else if (this.completedCurrentPage == this.completedPages) {
        this.hidePrevcompleted = 0;
        this.hideNextcompleted = 1;
      } else {
        this.hidePrevcompleted = 0;
        this.hideNextcompleted = 0;
      }
    });


    this.scheduledRidesSubscription = this.socketService.on('corporateScheduledRides').subscribe((data) => {

      this.sockos = data.data.paginated_rides;

      this.totalItemsScheduled = data.data.count;

      this.scheduledPages = parseInt((this.totalItemsScheduled / 15 + 1).toString());

      if ((this.scheduledPages > 1) && this.scheduledCurrentPage == this.scheduledPages) {

      }

      this.scheduledFrom = ((this.scheduledCurrentPage - 1) * 15) + 1;


      this.scheduledTo = this.scheduledFrom - 1 + 15;

      if (this.scheduledTo >= this.totalItemsScheduled) {
        this.scheduledTo = this.totalItemsScheduled;
        this.hideNextscheduled = 1;

      }

      if (this.scheduledCurrentPage == 1) {
        this.hidePrevscheduled = 1;
        this.hideNextscheduled = 0;
      } else if (this.scheduledCurrentPage == this.scheduledPages) {
        this.hidePrevscheduled = 0;
        this.hideNextscheduled = 1;
      } else if (this.scheduledTo >= this.totalItemsScheduled) {
        this.hidePrevscheduled = 0;
        this.hideNextscheduled = 1;
      } else {
        this.hidePrevscheduled = 0;
        this.hideNextscheduled = 0;
      }

      var ScheduledRides = data.data.paginated_rides;

      this.scheduledrides = [];
      ScheduledRides.forEach((ride) => {
        if (ride.session_id == 10007) {

        }

        var r = ride;
        r.tzName = '';
        if (ride.pickup_time) {
          var dt = new Date(ride.pickup_time)
          dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          /**** r.pickup_time =  raw; ***/
          r.pickup_time_processed = raw;

          //r.pickup_time_raw =  raw;
          r.pickup_time_original = ride.pickup_time;

          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        }

        if (ride.start_time) {
          var dt = new Date(ride.start_time)
          dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          r.start_time = raw;
          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        }

        if ((r.tzName == "India Standard Time") || (r.tzName == "GMT+5:30")) {
          r.tzName = 'IST';
        }
        var bounceData = ride.sent_to.split(',');

        if (ride.sent_to != '') {
          r.bounce = bounceData.length;;
        } else {
          r.bounce = 0;
        }

        var userName = ride.user_name.split(' ');
        var firstname, lastname;
        if (userName.length > 2) {
          firstname = userName[0];
          lastname = userName[1] + ' ' + userName[2];

        } else if (userName.length == 2) {
          firstname = userName[0];
          lastname = userName[1];
        } else {
          firstname = ride.user_name;
          lastname = '';
        }

        r.User_firstname = firstname;
        r.User_lastname = lastname;

        r.estimate_pickup_time_original = ride.estimate_pickup_time;
        r.estimate_pickup_time = Math.ceil(ride.estimate_pickup_time);
        r.estimate_pickup_time = Math.abs(r.estimate_pickup_time);

        r.estimate_diff_original = ride.estimate_diff;
        r.estimate_diff = Math.ceil(ride.estimate_diff);
        r.estimate_diff = Math.abs(r.estimate_diff);

        this.scheduledrides.push(r);

        if (this.routeOffID) {
          if (r.session_id == this.routeOffID) {

            this.expandDisc(r);
            this.showonm(r);

            localStorage.removeItem('routeOff');
            this.routeOffID = null;
          }
        }

        if (this.classExpand == 1) {
          if (this.rideInFocus.session_id == r.session_id) {

            this.expandDisc(r);
          }
        }
      });
    });


    this.regularRidesSubscription = this.socketService.on('corporateRegularRides').subscribe((data) => {

      this.sockos = data.data.paginated_rides;

      this.totalItemsRegular = parseInt(data.data.count);
      this.regularPages = parseInt(`${this.totalItemsRegular / 15 + 1}`);

      /*this.regularTo = this.regularFrom - 1 + 15;
      if(this.regularTo > this.totalItemsRegular){
        this.regularTo = this.totalItemsRegular;
      }*/

      this.regularFrom = ((this.regularCurrentPage - 1) * 15) + 1;

      this.regularTo = this.regularFrom - 1 + 15;

      if (this.regularTo >= this.totalItemsRegular) {
        this.regularTo = this.totalItemsRegular;
        this.hideNext = 1;

      }

      if (this.regularCurrentPage == 1) {
        this.hidePrev = 1;
        this.hideNext = 0;
      } else if (this.regularCurrentPage == this.regularPages) {
        this.hidePrev = 0;
        this.hideNext = 1;
      } else if (this.regularTo >= this.totalItemsRegular) {
        this.hidePrev = 0;
        this.hideNext = 1;
      } else {
        this.hidePrev = 0;
        this.hideNext = 0;
      }

      if (this.regularPages <= 1) {
        this.hidePrev = 1;
        this.hideNext = 1;
      }


      var RegularRides = data.data.paginated_rides;

      this.regular_rides = [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {}
      ];
      var newRegularData = [];

      // var statscroll = $('table.table-full:last').scrollTop();


      RegularRides.forEach((ride) => {
        var r = ride;
        if (r.ride_status == 3) {

        }
        r.tzName = '';
        if (ride.start_time) {
          var dt = new Date(ride.start_time)
          dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          /***Old COde***/
          /***r.start_time =  raw;***/

          /***New COde***/
          r.start_time_processed = raw;
          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        } else if (ride.pickup_time) {
          var dt = new Date(ride.pickup_time)
          dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          /****r.pickup_time =  raw;***/
          r.pickup_time_processed = raw;
          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        } else if (ride.date) {
          var dt = new Date(ride.date)
          /*dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
          var raw = dt.toISOString();
          r.date =  raw;*/
          r.tzName = dt.toLocaleString('en', { timeZoneName: 'short' }).split(' ').pop();
        }

        if ((r.tzName == "India Standard Time") || (r.tzName == "GMT+5:30")) {
          r.tzName = 'IST';
        }
        var string = "00:00";
        r.timer = string;
        if (ride.ride_status == 0 && ride.is_active == 1) {

          var givendate = new Date(ride.date);
          var givenmilliseconds: any = givendate.getTime();

          var nowdate = new Date();
          var nowmilliseconds: any = nowdate.getTime();

          var secondsSinceBooked: any = (nowmilliseconds - givenmilliseconds);
          secondsSinceBooked = parseInt(`${secondsSinceBooked / 1000}`);
          var lapsWindow = 135;
          if (secondsSinceBooked <= lapsWindow) {
            var secsLeft = lapsWindow - secondsSinceBooked;
            var totalsecs = secsLeft;

            var mins: any = totalsecs / 60;
            var cleanMins = parseInt(mins);

            var secs = totalsecs % 60;
            secs = this.addZero(secs);
            cleanMins = this.addZero(cleanMins);

            string = cleanMins + ':' + secs;
          }

          r.timer = string;

        }

        r.estimate_pickup_time_original = ride.estimate_pickup_time;
        r.estimate_pickup_time = Math.ceil(ride.estimate_pickup_time);
        r.estimate_pickup_time = Math.abs(r.estimate_pickup_time);


        //r.estimate_diff = ride.estimate_diff.replace('-','');
        r.estimate_diff = Math.ceil(ride.estimate_diff);
        r.estimate_diff = Math.abs(r.estimate_diff);

        if (ride.ride_status == 1 && !this.centering) {
          this.centering = 1;

          setTimeout(() => {
            this.fakeCenter(ride, 1);
          }, 0);
        } else {

        }


        var bounceData = ride.sent_to.split(',');

        if (ride.sent_to != '') {
          r.bounce = bounceData.length;;
        } else {
          r.bounce = 0;
        }
        var userName = ride.user_name.split(' ');
        var firstname, lastname;
        if (userName.length > 2) {
          firstname = userName[0];
          lastname = userName[1] + ' ' + userName[2];

        } else if (userName.length == 2) {
          firstname = userName[0];
          lastname = userName[1];
        } else {
          firstname = ride.user_name;
          lastname = '';
        }


        r.User_firstname = firstname;
        r.User_lastname = lastname;

        //this.regular_rides.push(r);
        newRegularData.push(r);

        if (this.routeOffID) {
          if (r.session_id == this.routeOffID) {

            this.expandDisc(r);
            this.showonm(r);
            localStorage.removeItem('routeOff');
            this.routeOffID = null;
          }
        }

        if (this.classExpand == 1) {
          if (this.rideInFocus.session_id == r.session_id) {

            this.expandDisc(r);
          }
        }

      });

      this.regular_rides = newRegularData;


      setTimeout(() => {
        // $('#loading').modal('hide');
        document.getElementById('loading').style.display = 'none';
      }, 1300);
    });


    this.driverAvailablitySubscription = this.socketService.on('corporateDriverAvailablity').subscribe((data) => {
      this.countAvailableCars = data.data.total_drivers[0].total_drivers;
      this.totalAvailableCars = data.data.total_drivers[0].total_drivers;

      if (this.availableCurrentPage == 0) {
        this.availableCurrentPage = 1;
      }


      this.availableFrom = ((this.availableCurrentPage - 1) * this.driverLimit) + 1;
      this.availableTo = this.availableFrom - 1 + this.driverLimit;


      if (this.availableTo >= this.totalAvailableCars) {
        this.availableTo = this.totalAvailableCars;
        this.hideNextAV = 1;

      }

      if (this.totalAvailableCars == 0) {
        this.availableFrom = 0;
        this.availableTo = 0;
      }

      this.avail = data.data.drivers;

      this.driverToFocus = [];
      this.driverToFocus = this.avail;

      if (!this.dsearchFlag) {
        //this.totalAvailableCars = this.totalAvailableCars/ this.driverLimit + 1;
      }
      this.availableCarsPages = parseInt(`${this.totalAvailableCars / this.driverLimit}`) + 1;
      if ((this.availableCurrentPage == 1) && (this.availableCarsPages == 1)) {
        //this.hidePrevsAV = 0;
        //this.hideNextAV = 0;
        this.hidePrevsAV = 1;
        this.hideNextAV = 1;
      }/*else if(this.availableCurrentPage == 1){
            this.hidePrevsAV = 1;
            this.hideNextAV = 0;
          }*/else if (this.availableCurrentPage == this.availableCarsPages) {
        this.hidePrevsAV = 0;
        this.hideNextAV = 1;
      } else if (this.availableTo >= this.totalAvailableCars) {
        this.hidePrevsAV = 0;
        this.hideNextAV = 1;
      } else {
        this.hidePrevsAV = 0;
        this.hideNextAV = 0;
      }

      if (this.dsearchFlag && !(this.routeMode)) {
        if (this.avail[0]) {

          if ((!this.lastBounds) || (this.lastBounds.searched != this.dsearchString) || (this.lastBounds.size != this.avail.length)) {
            this.cleanDrivers();
            map.setZoom(16);
            /*	var newlatlng = new google.maps.LatLng(this.avail[0].current_location_latitude, this.avail[0].current_location_longitude);
                
            map.setCenter(newlatlng);
            this.driverZoom = map.getZoom();
          
            map.setZoom(this.driverZoom);
            
            */
            /** get all drivers coordinates and set map bounds **/

            var pointers = [];
            for (let p = 0; p < this.avail.length; p++) {
              var obj = { lat: this.avail[p].current_location_latitude, lng: this.avail[p].current_location_longitude };
              pointers.push(obj);
            }
            this.setBoundsNow(pointers);

          } else {

          }
        }
      }


      var url;
      var urlGoing;
      var image = {
        url: url,
        scaledSize: new google.maps.Size(33, 33),
        anchor: new google.maps.Point(16.5, 16.5)
      };

      let avl = new Array();
      _.each(this.avail, (key, value) => {
        avl.push(_.pick(key, 'current_location_latitude', 'current_location_longitude'));
      });

      for (var i = 0; i < avl.length; i++) {

        if (this.avail[i].is_free == 1) {

          if (this.avail[i].car_type == 2) {
            url = 'assets/carTypeImage/QLE/3_White_QLE.svg';
            urlGoing = 'assets/carTypeImage/QLE/2_Blue_QLE.svg';
          } else if (this.avail[i].car_type == 1) {
            url = 'assets/img/driver_idle.svg';
            urlGoing = 'assets/img/driver_intransit.svg';
          } else if (this.avail[i].car_type == 3) {
            url = 'assets/carTypeImage/LUXE/3_White_LUXE.svg';
            urlGoing = 'assets/carTypeImage/LUXE/2_Blue_LUXE.svg';
          } else if (this.avail[i].car_type == 4) {
            url = 'assets/carTypeImage/Grande/3_White_Grande.svg';
            urlGoing = 'assets/carTypeImage/Grande/2_Blue_Grande.svg';
          } else {
            url = 'assets/carTypeImage/QLE/3_White_QLE.svg';
            urlGoing = 'assets/carTypeImage/QLE/2_Blue_QLE.svg';
          }
        } else {

          if (this.avail[i].car_type == 1) {
            url = 'assets/carTypeImage/QLE/2_Blue_QLE.svg';
          } else if (this.avail[i].car_type == 2) {
            url = 'assets/carTypeImage/LUXE/2_Blue_LUXE.svg';
          } else if (this.avail[i].car_type == 3) {
            url = 'assets/carTypeImage/Grande/2_Blue_Grande.svg';
          } else {
            url = 'assets/carTypeImage/Grande/2_Blue_Grande.svg';
          }
        }



        var infowindow = new google.maps.InfoWindow({
          content: "<div id='" + this.avail[i].driver_id + "' style='font-size: 9px;'>" +
            "<span></span>  <span>" + this.avail[i].driver_name + "</span><br>" +
            "</div>",
          disableAutoPan: true
        });
        image.url = `${url}#${this.avail[i].driver_id}`;

        /* if (ongoingDriverIds.includes(this.avail[i].driver_id)) {
           image.url = `${urlGoing}#${this.avail[i].driver_id}`;
         }*/
        this.setMarker(this.avail[i], { image, infowindow, rotation });

      }

    });
  }

  ngOnDestroy(): void {
    if (!!this.driverListSubscription) this.driverListSubscription.unsubscribe();
    if (!!this.completedRequestSubscription) this.completedRequestSubscription.unsubscribe();
    if (!!this.scheduledRidesSubscription) this.scheduledRidesSubscription.unsubscribe();
    if (!!this.regularRidesSubscription) this.regularRidesSubscription.unsubscribe();
    if (!!this.driverAvailablitySubscription) this.driverAvailablitySubscription.unsubscribe();

    if (!!stop) clearInterval(stop);
  }


}
