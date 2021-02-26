import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input-r';
import { FormControl, Validators } from '@angular/forms';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: 'app-rider-signup',
  templateUrl: './rider-signup.component.html',
  styleUrls: ['./rider-signup.component.scss']
})
export class RiderSignupComponent implements OnInit {
  OTPStarted: number = 0;
  otpSent: number = 0;
  otpVerified: number = 0;
  hitInProgress: number = 0;
  loginUser: any = {
    state_id: 'United States',
    country_id: 1,
  }
  signupData: any = {};
  step1: number = 1;
  step2: number = 0;
  step3: number = 0;
  signup1: number;
  signup2: number;
  signup3: number;
  signup4: number;
  success: number;

  promoCountryCode: string;
  riderUser: any = {};
  loading: boolean;
  disableMobileHit: boolean;
  errorMsg: any;
  otp1: any;
  otpToAdd: string;
  buttonClicked: number;
  newRider: any;
  userToAdd: any;
  onriderSignUp: boolean;
  userMobileToAdd: any;
  otpMode: number;
  DisableResnd: boolean;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  countryToSet: string = 'US';

  mobileNumber: FormControl = new FormControl(undefined, [Validators.required]);

  countries: Array<any> = [];
  states: Array<any> = [];
  constructor(
    private router: Router,
    private httpService: HttpService,
    private cookieService: CookieService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    $(function () {

      $("#first-step").click(function () {

        if ($("#select-state option:selected").text() == 'No State') {

          $("#signup-1").addClass("hidden");
          $("#signup-2").removeClass("hidden");
          $("#li-step0").removeClass("active");
          $("#li-step1").addClass("active");
          $("#ny").removeClass("hidden");
          $("#no-ny").addClass("hidden");

          $("#0-step").click(function () {

            $("#signup-1").removeClass("hidden");
            $("#signup-2").addClass("hidden");
            $("#signup-3").addClass("hidden");
            $("#signup-4").addClass("hidden");
            $("#li-step0").addClass("active");
            $("#li-step1").removeClass("active");
            $("#li-step2").removeClass("active");
            $("#li-step3").removeClass("active");

            $("#1-step").click(function () {
              $("#signup-1").addClass("hidden");
              $("#signup-2").removeClass("hidden");
              $("#li-step0").removeClass("active");
              $("#li-step1").addClass("active");
            });
          });
        }
        else {
          $("#signup-1").addClass("hidden");
          $("#signup-6").removeClass("hidden");
          $("#no-ny").removeClass("hidden");
          $("#ny").addClass("hidden");
          $("#4-step").click(function () {
            $("#signup-1").removeClass("hidden");
            $("#signup-6").addClass("hidden");

            $("#li-step4").addClass("active");
            $("#li-step5").removeClass("active");

            $("#5-step").click(function () {
              $("#signup-1").addClass("hidden");
              $("#signup-6").removeClass("hidden");
              $("#li-step4").removeClass("active");
              $("#li-step5").addClass("active");
            });

          });
        }
      });
    });

    $(document).ready(() => {
      $('#referral').val(this.getQueryStringValue("referral_code"));
    });
    $("#getOtpCode").click(function () {
      $('#corporate_getCode').modal('show');
    })
    $('#extPopTwo').val('+1');
    this.getCountries();

    $('#phonenumber').bind('copy paste', function (e) {
      let txt = e.originalEvent.clipboardData.getData('text');
      if (parseInt(txt) !== +txt) { // allow only Ints
        e.preventDefault(); //prevent the default behaviour 
      }
    });
    $('#phonenumber').bind('copy paste', function (e) {
      let txt = e.originalEvent.clipboardData.getData('text');
      if (parseInt(txt) !== +txt) { // allow only Ints
        e.preventDefault(); //prevent the default behaviour 
      }
    });
  }
  ngAfterViewInit(): void {
    // $('html, body').animate({ scrollTop: 0 }, 'slow');
    $('#phone').focus();
    $("#phone").blur((e) => {
      if (!this.mobileNumber.value) return;
      localStorage.setItem("countryCode", this.mobileNumber.value.dialCode); // do something with countryData
      this.getCountryandMobile();
    });
  }
  onValidation(event) {
    if (!/^[a-zA-Z]*$/g.test(event.target.value)) {
      alert("Invalid characters");
      return false;
    }
  }
  public getCountries() {

    this.loginUser.state_id = "United States";
    this.loginUser.country_id = 1;
    this.countries = [];

    this.httpService.get(environment.urlC + 'countryList').subscribe((data) => {

      if (data.error || data.flag == 0) {

        this.utilityService.toast('error', data.error || data.message, '')
        return;
      } else if (data.flag == 123) {

      } else if (data.flag == 108) {

      } else {
        this.countries = data.countries;

        this.getStates();
        setTimeout(() => {
          this.loginUser.country_id = 1;
          $("#select-state option:eq(0)").attr('selected', 1);
          ($("#select-state option:eq(0)").val() == "?") ? $("#select-state option:eq(0)").remove() : '';
        }, 100);
      }
    });
  }

  public getStates() {
    this.httpService.post(environment.urlC + 'states', { country_id: this.loginUser.country_id }).subscribe((data,) => {

      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.error || data.flag == 0) {
        this.utilityService.toast('error', data.error || data.message, '')

        return;
      } else if (data.flag == 123) {

      } else if (data.flag == 108) {

      } else {
        this.states = data.cities;

        setTimeout(() => {
          $("#my-state option:eq(1)").attr('selected', 1);
          (($("#my-state option:eq(0)").val() == "?" || $("#my-state option:eq(0)").val() == "")) ? $("#my-state option:eq(0)").remove() : '';
        }, 100);

      }
    });
  }
  public trimZip() {
    var desired = $('#zipcode').val().replace(/[^\w\s]/gi, '').replace(/\D/g, '')
    $('#zipcode').val(desired.slice(0, 6));
  }
  public cleanCity() {
    var clean = $('#city').val().replace(/[^\w\s]/gi, '').replace(/[0-9]/g, "")
    $('#city').val(clean);
  }
  public getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }
  public isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 43) return true;
    if (charCode < 48 || charCode > 57)
      return false;
    return true;
  }
  public isNumberKeys(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode < 48 || charCode > 57)
      return false;
    return true;
  }
  public showSignup1() {
    this.step1 = 1;
    this.step2 = 0;
  }
  public showSignup3() {
    if (this.loginUser.state_id && this.otpSent) {
      this.signup1 = 0;
      this.signup2 = 0;
      this.signup3 = 1;
      this.signup4 = 0;
    }
  }
  public showSignup4() {
    this.success = 1;
    this.otpVerified = 1;
    this.OTPStarted = 1;
    this.otpSent = 1;
    this.signup3 = 0;
    this.signup4 = 1;
  }

  public checkZip() {
    this.loginUser.zip_code = this.loginUser.zip_code.slice(0, 6);
  }

  public getCountryandMobile() {
    this.promoCountryCode = this.mobileNumber.value.dialCode + "-";
    this.riderUser.mobile = this.mobileNumber.value.number;
    if (this.riderUser.mobile.indexOf('+') >= 0) {
      this.riderUser.mobile = this.riderUser.mobile.replace(this.mobileNumber.value.dialCode + "-", '');
      this.riderUser.mobile = this.riderUser.mobile.replace(this.mobileNumber.value.dialCode, '');
      this.mobileNumber.setValue(this.riderUser.mobile);
    } else {
    }
  }

  public validateRiderOTP() {
    var fname1 = $('#fname1').val();
    var lname1 = $('#lname1').val();
    var mobile1 = $("#phone").val();
    this.promoCountryCode = this.mobileNumber.value.dialCode + "-";
    var email1 = $('#email1').val();
    var password1 = $('#password1').val();
    var otp1 = $('#otp1').val();
    var referral = $('#referral').val();
    if (otp1.trim() == '') {
      this.utilityService.alert('info', 'Please Enter OTP');
      return 0;
    } else if (password1 == '') {
      this.utilityService.alert('info', 'Please Enter Password');
      return 0;
    }
    return 1;
  }

  public validateRider() {
    var reg = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    var fname1 = $('#fname1').val();
    var lname1 = $('#lname1').val();
    this.promoCountryCode = (this.mobileNumber.value && this.mobileNumber.value.dialCode) ? this.mobileNumber.value.dialCode + "-" : null;
    var mobile1 = $("#phone").val();
    var email1 = $('#email1').val();
    var referral = $('#referral').val();
    var city = $('#city').val();
    var zipcode = $('#zipcode').val();
    if (fname1.trim() == '') {
      this.utilityService.alert('info', 'Please enter your First Name.');
      $('#fname1').focus();
      return false;
    } else if (lname1.trim() == '') {
      this.utilityService.alert('info', 'Please enter your Last Name.');
      $('#lname1').focus();
      return false;
    } else if (mobile1.trim() == '') {
      this.utilityService.alert('info', 'Please enter your Mobile Number.');
      $('#mobile1').focus();
      return false;
    } else if (mobile1.trim() == '') {
      this.utilityService.alert('info', 'Please enter your Mobile Number.');
      $('#mobile1').focus();
      return false;
    }
    else if (!/^[1-9]{1}[0-9]{9}$/.test(mobile1)) {
      this.utilityService.alert('info', 'Please enter valid Mobile Number.');
      $('#mobile1').focus();
      return false;
    } else if (email1.trim() == '') {
      this.utilityService.alert('info', 'Please enter your Email.');
      $('#email1').focus();
      return false;
    } else if (email1.trim() != '' && !reg.test(email1)) {
      this.utilityService.alert('info', 'Please enter valid email.');
      $('#email1').focus();
      return false;
    } else if (city.trim() == '') {
      this.utilityService.alert('info', 'Please enter your City.');
      $('#city').focus();
      return false;
    } else if (zipcode.trim() == '') {
      this.utilityService.alert('info', 'Please enter your Zip Code.');
      $('#zipcode').focus();
      return false;
    } else if (zipcode.length < 5) {
      this.utilityService.alert('info', 'Please Enter valid zip code.');
      $('#zipcode').focus();
      return false;
    }
    return 1;
  }

  public hitCheckMobile() {
    if (this.validateRider()) {
      this.loading = true;
      this.disableMobileHit = true;

      const payload = {
        user_mobile: this.promoCountryCode + this.riderUser.mobile,
        user_email: this.riderUser.email,
        is_corporate: '1'
      }
      this.httpService
        .post(environment.url + 'check_mobile', payload).subscribe((data) => {
          if (typeof (data) == 'string') data = JSON.parse(data);
          if (data.error) {
            this.loading = false;
            setTimeout(() => {
              this.disableMobileHit = false;
            }, 1500)
            this.utilityService.toast('error', data.error, '')
            return;
          } else if (data.flag == 107) {
            this.loading = false;
            setTimeout(() => {
              this.disableMobileHit = false;
            }, 1500)
            this.utilityService.toast('error', data.error, '');
            return;
          } else if (data.flag == 108) {
            this.loading = false;
            setTimeout(() => {
              this.disableMobileHit = false;
            }, 1500)
            this.utilityService.toast('error', data.error, '')
            return;
          }
          else {
            this.loading = false;
            this.disableMobileHit = false;
          }
          let param = {
            user_mobile: this.promoCountryCode + this.riderUser.mobile,
            user_email: this.riderUser.email
          }
          this.addtoAccount(param);
        });
    }
  }

  public resendRiderOtp() {
    this.httpService.post(environment.url + 'resend_otp', {
      user_mobile: this.promoCountryCode + this.riderUser.mobile,
      is_approved: 1
    }).subscribe((data) => {
      if (data.flag == 0) {
        this.errorMsg = data.message;
        setTimeout(() => {
          this.errorMsg = '';
        }, 2500)
      } else {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        if (data.error) {
          // $rootScope.openToast('error', data.error, '')
          this.utilityService.toast('error', data.error, '');
          return false;
        }
        $('#otp1').val('');
        // $rootScope.openToast('success', 'An OTP has been sent on User\'s mobile number!', '');
        this.utilityService.toast('success', 'An OTP has been sent on User\'s mobile number!', '')
      }
    })
  }

  public verifyRiderOtp() {
    if (this.validateRiderOTP()) {
      this.httpService.post(environment.url + 'verify_otp', {
        user_mobile: this.promoCountryCode + this.riderUser.mobile,
        is_approved: 1,
        otp: this.otp1
      }).subscribe((data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);
        if (data.error) {
          // $rootScope('error', data.error, '')
          this.utilityService.toast('error', data.error, '')
          return;
        } else if (data.flag == 123) {
          // $rootScope('error', 'This phone number is already registered with us.', '')
          this.utilityService.toast('error', 'This phone number is already registered with us.', '')
          return;
        } else if (data.flag == 108) {
          // $rootScope('error', 'Please enter a valid phone number', '')
          this.utilityService.toast('error', 'Please enter a valid phone number', '')
          return;
        }
        this.step1 = 0;
        this.step2 = 1;
      })
    }

  }

  public otp_first() {
    var fname1 = $('#fname1').val();
    var lname1 = $('#lname1').val();
    var mobile1 = $("#phone").val();
    this.promoCountryCode = this.mobileNumber.value.dialCode + "-";
    var email1 = $('#email1').val();
    var password1 = $('#password1').val();
    var otp1 = $('#otp1').val();
    var referral = $('#referral').val();
    var city = $('#city').val();
    var zipcode = $('#zipcode').val();

    if (this.otpToAdd === '' || !this.otpToAdd) {
      this.utilityService.toast('error', 'Please Enter OTP ', '');
      return false;
    } else if (this.buttonClicked === 1) {
      this.utilityService.toast('error', 'Please Wait while we check OTP for you!', '');
      return false;
    } else {
      this.buttonClicked = 1;
      setTimeout(() => {
        this.buttonClicked = 0;
      }, 4000);

      const payload = {
        user_name: this.riderUser.fname + ' ' + this.riderUser.lname,
        user_mobile: this.promoCountryCode + this.riderUser.mobile,
        user_email: this.riderUser.email,
        is_corporate: 1,
        referring_code: referral,
        zipcode: zipcode,
        city: city,
      };

      // const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
      // headers.set('Accept', '*/*');

      // let payload = new HttpParams()
      //   .set('user_name', this.riderUser.fname + ' ' + this.riderUser.lname)
      //   .set('user_mobile', this.promoCountryCode + this.riderUser.mobile)
      //   .set('user_email', this.riderUser.email)
      //   .set('is_corporate', '1')
      //   .set('referring_code', referral)
      //   .set('zipcode', zipcode)
      //   .set('city', city)

      this.httpService.post(environment.url + 'email_registration', payload).subscribe((data) => {
        if (typeof data == 'string') {
          data = JSON.parse(data);
        }
        if (data.error) {
          this.buttonClicked = 1;
          this.utilityService.toast('error', data.error, '');
          this.showSignup1();
          return;
        } else {
          this.newRider = data.userInfo;
          this.userToAdd = data.userInfo.user_id;
          this.otpVerified = 1;
          this.OTPStarted = 1;
          this.otpSent = 1;
          this.success = 1;
          this.completeUserAdd();
        }
      })
    }
  }

  public riderSignUp() {
    this.loading = true;
    this.onriderSignUp = true;
    this.httpService.post(environment.urlC + 'associatedUser_verify_otp', {
      web_access_token: this.cookieService.get("web_access_token"),
      otp: this.otpToAdd,
      mobile: this.userMobileToAdd,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error) {
        // $rootScope.openToast('error', data.error || data.message, '');
        this.utilityService.toast('error', data.error || data.message, '');
        this.loading = false;
        setTimeout(() => {
          this.onriderSignUp = false;
        }, 1500)
        return;
      } else {
        this.otp_first();
        this.loading = false;
        this.onriderSignUp = false;
      }
    })
  }

  public addtoAccount(user) {
    this.otpMode = 1;
    this.userMobileToAdd = user.user_mobile;
    this.otpToAdd = '';
    this.loading = false;
    this.httpService.post(environment.urlC + 'associatedUser_send_otp', {
      web_access_token: this.cookieService.get("web_access_token"),
      mobile: user.user_mobile,
      email: user.user_email,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error || data.flag == 0) {
        // $rootScope.openToast('error', data.error || data.message, '');
        this.utilityService.toast('error', data.error || data.message, '')
        $('#add_to_account').modal('hide');
        return;
      } else {
        this.step1 = 0;
        this.step2 = 1;
        // $rootScope.openToast('success', data.message, '');
        this.utilityService.toast('success', data.message, '');
      }
    })
  }

  public reAddUser() {
    this.DisableResnd = true;
    this.otpToAdd = '';
    this.otpMode = 1;
    this.httpService.post(environment.urlC + 'associatedUser_resend_otp', {
      web_access_token: this.cookieService.get("web_access_token"),
      mobile: this.userMobileToAdd,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error || data.flag == 0) {
        setTimeout(() => {
          this.DisableResnd = false;
        }, 1500)
        // $rootScope.openToast('error', data.error || data.message, '');
        this.utilityService.toast('error', data.error || data.message, '');
        return;
      } else {
        // $rootScope.openToast('success', 'OTP sent again!', '');
        this.utilityService.toast('success', 'OTP sent again!', '');
        setTimeout(() => {
          this.DisableResnd = false;
        }, 1500)
      }
    })
  }

  public completeUserAdd() {
    this.httpService.post(environment.urlC + 'corporate_add_user', {
      web_access_token: this.cookieService.get('web_access_token'),
      user_id: this.userToAdd,
      role: 0,
      otp: this.otpToAdd,
      mobile: this.userMobileToAdd
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      this.buttonClicked = 0;
      if (data.error || data.flag == 0) {
        // $rootScope.openToast('error', data.error || data.message, '')
        this.utilityService.toast('error', data.error || data.message, '')
        return;
      } else {
        // $rootScope.openToast('success', data.log, '');
        this.utilityService.toast('success', data.log, '');
        $('#add_to_account').modal('hide');
        $('.modal-backdrop.show').fadeOut();
        setTimeout(() => {
          // $state.go("corporate.myUsers");
          this.router.navigate(["/", "corporate", "myUsers"]);
        }, 300);
        return;
      }
    })
  }
  public autofillotp() {
    if (!this.userMobileToAdd) {
      this.utilityService.alert('info', 'Please create account first by clicking  \'Create My Rider Account\'! ');
    }
    this.httpService.post(environment.urlC + 'associated_otp_auto_fill', {
      web_access_token: this.cookieService.get('web_access_token'),
      mobile: this.userMobileToAdd,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      this.buttonClicked = 0;
      if (data.error || data.flag == 0) {
        // $rootScope.openToast('error', data.error || data.message, '');
        this.utilityService.toast('error', data.error || data.message, '');
        return;
      } else {
        $('#show_confirmation').modal('hide');
        if (data) {
          this.otpToAdd = data.otp;
          $('#corporate_getCode').modal('hide');
        }
        else {
          this.otpToAdd = '';
        }
        return;
      }
    })
  }
}
