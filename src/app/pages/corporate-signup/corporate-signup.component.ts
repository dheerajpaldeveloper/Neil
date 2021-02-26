import { environment } from 'src/environments/environment';
import { UtilityService } from './../../core/services/utility/utility.service';
import { HttpService } from './../../services/http/http.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input-r';
import { Router } from '@angular/router';

declare const jQuery: any;
const $: any = jQuery;


@Component({
  selector: 'app-corporate-signup',
  templateUrl: './corporate-signup.component.html',
  styleUrls: ['./corporate-signup.component.scss']
})
export class CorporateSignupComponent implements OnInit, AfterViewInit {

  OTPStarted = 0;
  otpSent = 0;
  otpVerified = 0;
  hitInProgress = 0;
  loadings = false;

  success = 0;
  signup1 = 1;
  signup2 = 0;
  signup3 = 0;
  signup4 = 0;

  loginUser: any = {
    country: 'United States',
    country_id: 1,
  };

  signupData: any = {};

  otp: string = '';
  countryToSet: string = 'US';

  promoCountryCode: string = '';
  error: string = '';
  errorMsg: string = '';
  otpSuccess: string = '';

  onloadotp: boolean = false;
  zipMaxLength: number = 5;

  DisableResnd: boolean = true;
  DisableCCA: boolean = false;

  user_mobile: string;

  resendOTPOne: number;
  resendOTPCounter: number;
  firstResend: number;
  resendOTP: number;

  countries: Array<any> = [];
  states: Array<any> = [];

  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  mobileNumber: FormControl = new FormControl(undefined, [Validators.required]);
  maxlength: any = 10;

  isNameHighlighted: boolean = false;
  isEntityHighlighted: boolean = false;
  isPhoneHighlighted: boolean = false;
  isEmailHighlighted: boolean = false;
  isPasswordHighlighted: boolean = false;
  isPassComHighlighted: boolean = false;
  isZipHighlighted: boolean = false;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    $(document).ready(() => {
      $('body').addClass('login-page');
      this.manageResolution();
      this.viewInit();
    });
    $(window).resize(() => {
      this.manageResolution();
    });

    this.getCountries();
  }

  ngAfterViewInit(): void {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    this.viewInit();
  }

  viewInit(): void {
    // $('#mobile').focus();
    $('#mobile').on("cut copy paste", (e) => e.preventDefault());
    $("#mobile").blur(() => {
      if (!this.mobileNumber.value) return;
      localStorage.setItem("countryCode", this.mobileNumber.value.dialCode); // do something with countryData
      this.getCountryandMobile();
    });

    $('#zip').on("cut copy paste", (e) => e.preventDefault());

  }
  onNameChange(event) {
    this.isNameHighlighted = false
  }
  onEntityChange(event) {
    this.isEntityHighlighted = false
  }
  onPhoneChange(event) {
    this.isPhoneHighlighted = false
  }
  onEmailChange(event) {
    this.isEmailHighlighted = false
  }
  onPassChange(event) {
    this.isPasswordHighlighted = false
  }
  onPassComChange(event) {
    this.isPassComHighlighted = false
  }
  onZipChange(event) {
    this.isZipHighlighted = false
  }

  isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    //console.log(charCode);

    if (charCode == 43) return true;

    if (charCode < 48 || charCode > 57)
      return false;

    return true;
  }

  isNumberKeys(evt) {
    this.isZipHighlighted = false
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode < 48 || charCode > 57)
      return false;

    return true;
  }

  manageResolution() {
    var divHeight = $(".loginInnerDiv").height();
    var windowHeight = $(window).height();
    var outerDivWidth = $(".loginOuterDiv").width();
    var innerDivWidth = $(".loginInnerDiv").width();
    var windowWidth = $(window).width();
    if (windowHeight > 720) $(".loginSignupPage").css("height", windowHeight);
    $(".loginSignupPage").css("height", "100%");
    //$(".loginSignupPage").css("height",windowHeight);
    //console.log(divHeight,windowHeight,outerDivWidth,innerDivWidth,windowWidth);
    var paddingToGive = 15;
    if (windowHeight > divHeight) {
      paddingToGive = (windowHeight - divHeight) / 2;
    }
    if (paddingToGive > 40) {
      //$(".loginInnerDiv").css({'padding-top':paddingToGive,'padding-bottom':paddingToGive});
    } else {
      $(".loginInnerDiv").css({
        'padding-top': 15,
        'padding-bottom': 15
      });
    }
    if (windowWidth < 420) {
      // $(".loginOuterDiv").width(windowWidth).css('margin',0);

    } else {
      //$(".loginOuterDiv").css('margin-left','30%').width('%');
    }
    if (innerDivWidth < 250) {
      $(".loginInnerDiv").css({
        'padding-left': 0,
        'padding-right': 0
      });
    }
    //console.log($('.loginButtonDiv button').width(),$('.loginButtonDiv').width());
    if ($('.loginButtonDiv button').width() > $('.loginButtonDiv').width()) {
      //$('.loginButtonDiv button').width($('.loginButtonDiv').width())
    } else {
      //$('.loginButtonDiv button').width($('.loginButtonDiv').width())
    }
  }

  public getCountryandMobile() {
    this.promoCountryCode = this.mobileNumber.value.dialCode + "-";
    this.loginUser.user_mobile = this.mobileNumber.value.number;

    if (this.mobileNumber.value.number.indexOf('+') >= 0) {
      //$scope.promoCountryCode = '';

      this.loginUser.user_mobile = this.loginUser.user_mobile.replace(this.mobileNumber.value.dialCode + "-", '');
      this.loginUser.user_mobile = this.loginUser.user_mobile.replace(this.mobileNumber.value.dialCode, '');
      this.mobileNumber.setValue(this.loginUser.user_mobile);
      return 1;
    } else {

      return 1;
    }

  }

  public showStep1() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    if (this.loginUser.country_id) {
      this.signup1 = 1;
      this.signup2 = 0;
      this.signup3 = 0;
      this.signup4 = 0;
    }
  }

  public showSignup2() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    if (this.loginUser.country_id) {
      this.signup1 = 0;
      this.signup2 = 1;
      this.signup3 = 0;
      this.signup4 = 0;
      this.otp = ''
    } else {
      this.utilityService.alert('info', 'Please Select a Country');
      return;
    }
  }

  public showSignup3() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');

    if (this.loginUser.country_id && this.otpSent) {
      this.signup1 = 0;
      this.signup2 = 0;
      this.signup3 = 1;
      this.signup4 = 0;
    }
  }

  public showSignup4() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    this.signUp();
    this.success = 1;
    this.otpVerified = 1;
    this.OTPStarted = 1;
    this.otpSent = 1;
    this.signup3 = 0;
    this.signup4 = 1;
  }


  public homelink() {
    this.router.navigate(["/corporate_login"]);
  }

  public checkZip() {
    this.zipMaxLength = (this.countryToSet == "PH") ? 4 : 5;

    this.loginUser.zip_code = this.loginUser.zip_code.slice(0, this.zipMaxLength);
  }

  public validateFields() {

    var reg = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    var fname = $('#fname').val();
    var lname = $('#lname').val();
    var mobile = $('#mobile').val();
    var email = $('#email').val();
    var password = $('#password').val();
    var passwordc = $('#passwordc').val();
    var zip = $('#zip').val();
    var country_id = $("#select-state option:selected").val();
    var state_id = $("#my-state option:selected").val();
    var how_hear_us = $("[name='hear']:checked").val();
    var refferal = $('#refferal').val();


    if (fname.trim() == '') {
      // this.utilityService.alert('info', 'Please enter your Business Name.');
      // $('#fname').focus();
      this.isNameHighlighted = true;
      // return false;
    }
    if (lname.trim() == '') {
      // this.utilityService.alert('info', 'Please enter your Business Entity.');
      // $('#lname').focus();
      this.isEntityHighlighted = true;
      // return false;
    }
    if (mobile.trim() == '') {
      // this.utilityService.alert('info', 'Please enter your Mobile.', '', { width: 400 });
      // $('#mobile').focus();
      this.isPhoneHighlighted = true;
      // return false;
    } else if (!/^[1-9]{1}[0-9]{7,9}$/.test(mobile)) {
      this.utilityService.alert('info', 'Please enter valid Mobile Number');
      // $('#mobile').focus();
      return false;
    }
    if (email.trim() == '') {
      // this.utilityService.alert('info', 'Please enter your email.');
      // $('#email').focus();
      this.isEmailHighlighted = true;
      // return false;
    } else if (email.trim() != '' && !reg.test(email)) {
      this.utilityService.alert('info', 'Please enter valid email.');
      // $('#email').focus();
      return false;
    }
    if (password.trim() == '') {
      // this.utilityService.alert('info', 'Please enter the password');
      // $('#password').focus();
      this.isPasswordHighlighted = true;
      // return false;
    } else if (password.trim().length < 6) {
      this.utilityService.alert('info', 'Please enter atleast 6 characters');
      // $('#password').focus();
      return false;
    }
    if (passwordc.trim() == '') {
      // this.utilityService.alert('info', 'Please enter confirm password');
      // $('#passwordc').focus();
      this.isPassComHighlighted = true;
      // return false;
    } else if (password !== passwordc) {
      this.utilityService.alert('info', 'Password and confirm password doesn\'t match');
      // $('#password').focus();
      return false;
    }
    if (zip.trim() == '') {
      // this.utilityService.alert('info', 'Please enter Your Zip Code.');
      // $('#zip').focus();
      this.isZipHighlighted = true;
      // return false;
    } else if (zip.length < this.zipMaxLength) {
      this.utilityService.alert('info', 'Please Enter valid zip code.');
      // $('#zip').focus();
      return false;
    }
    if (fname.trim() == '' || lname.trim() == '' || mobile.trim() == '' || email.trim() == '' || password.trim() == '' || passwordc.trim() == '' || zip.trim() == '') {
      this.utilityService.alert('info', 'Please enter the highlighted field.');
      return false;
    }

    return true;
  }

  public sendOtp() {
    // $window.scrollTo(100, 50);
    var validated = this.validateFields();

    if (validated) {
      this.loadings = true;
      this.onloadotp = true;

      var data = {
        mobile: this.promoCountryCode + this.loginUser.user_mobile,
        email: this.loginUser.user_email,
      };
      this.error = '';

      this.signupData = this.loginUser;

      this.httpService.post(environment.urlC + 'otp/send', data).subscribe((data) => {

        if (typeof (data) == 'string') data = JSON.parse(data);

        if (data.error || data.flag == 0) {
          this.loadings = false;
          setTimeout(() => {
            this.onloadotp = false;
          }, 1500);

          this.utilityService.toast('error', data.error || data.message, '');
          return;
        } else if (data.flag == 123) {
          // $scope.log = data.log;
          this.utilityService.toast('warning', 'This phone number is already registered with us.', '');

          this.loadings = false;
          setTimeout(() => {
            this.onloadotp = false;
          }, 1500);
          this.router.navigate(["/corporate_login"]);
          this.OTPStarted = 0;
          this.otpSent = 0;
          this.otpVerified = 0;
        } else if (data.flag == 108) {
          this.loadings = false;
          setTimeout(() => {
            this.onloadotp = false;
          }, 1500);
          this.utilityService.toast('warning', 'Please enter a valid phone number', '');
          setTimeout(() => {
            this.hitInProgress = 0;
          }, 1500);
        } else {
          this.utilityService.toast('success', data.message, '');
          this.loadings = false;
          this.onloadotp = false;
          this.otpSent = 1;
          this.signup1 = 0;
          this.signup2 = 0;
          this.signup3 = 1;
          this.signup4 = 0;

          this.showSignup3();
          this.user_mobile = this.promoCountryCode + this.loginUser.user_mobile;
          $('html, body').animate({ scrollTop: 0 }, 'slow');
        }
      })

    }
  }

  public regenerateOTP() {
    // $scope.loadings = true;
    this.DisableResnd = true;

    $.post(environment.urlC + 'otp/resend', {
      mobile: this.promoCountryCode + this.loginUser.user_mobile
    })
      .subscribe((data) => {
        if (data.flag == 0) {
          this.errorMsg = data.message;
          setTimeout(() => {
            this.errorMsg = '';
            this.DisableResnd = false;

          }, 2500)
        } else {

          this.otpSuccess = 'An OTP has been sent to your mobile number';
          this.utilityService.toast('success', 'An OTP has been sent on your mobile number', '');
          setTimeout(() => {
            this.otpSuccess = '';
            this.DisableResnd = false;
          }, 2000);

          this.resendOTPOne = 1;
          $("#showResend").css("display", "none", "important");
          this.resendOTPCounter = 30;
          this.firstResend = 0;
          let resend = setInterval(() => {
            if (this.resendOTPCounter > 0 && this.firstResend == 0)
              --this.resendOTPCounter;
          }, 1000);
          setTimeout(() => {
            if (this.firstResend == 0) {
              this.resendOTP = 0;
              clearInterval(resend);
              $("#showResend").css("display", "block", "important");
              // $scope.$apply();
            }
          }, 30000);
        }
      }, (data) => {

      });

  }

  public changeNum() {
    let resend = setInterval(() => {
      if (this.resendOTPCounter > 0 && this.firstResend == 0)
        --this.resendOTPCounter;
    }, 1000);
    clearInterval(resend);
    this.OTPStarted = 0;
    this.otpSent = 0;
    this.otpVerified = 0;
    location.reload();
  }

  public forgotBack() {
    //   console.log("asdf");
    this.error = '';
    this.router.navigate(["/corporate_login"]);
  }

  public verifyOTP() {

    this.DisableCCA = true;
    this.loadings = true

    // $timeout(function(){
    // $scope.DisableCCA = false;
    // // $scope.loadings = false

    // },2000)
    //   var otp = $('#otp').val();

    //   if(otp.trim()==''){
    // 	  alert('Please Enter OTP');

    // 	//   return;
    // 	//   $scope.DisableCCA = false;
    //   }
    //   else if(!/^[0-9]{4}$/.test(otp)){
    // 	  alert('Enter OTP sent to your Mobile.');

    // 	//   return;
    // 	//   $scope.DisableCCA = false;
    //   }

    //   $scope.loadings = false
    this.httpService.post(environment.urlC + 'otp/verify', {
      "mobile": this.promoCountryCode + this.loginUser.user_mobile,
      "otp": this.otp

    })
      .subscribe((data) => {
        if (typeof data == 'string') {
          data = JSON.parse(data);
        }
        if (data.error || data.flag == 0) {
          this.utilityService.toast('error', data.error || data.message, '');
          this.loadings = false;

          setTimeout(() => {
            this.DisableCCA = false;
          }, 2000);
          return;
        } else {
          // this.phoneNumber = this.user_mobile;
          this.utilityService.toast('success', 'OTP verified successfully.', '');

          this.signUp();
          $('html, body').animate({ scrollTop: 0 }, 'slow');

        }
      })
  }

  public signUp() {

    this.validateFields()

    var first_name = $('#fname').val();
    var last_name = $('#lname').val();
    var mobile = this.promoCountryCode + this.loginUser.user_mobile;
    var email = $('#email').val();
    var password = $('#password').val();
    var zipcode = $('#zip').val();
    var country_id = $("#select-state option:selected").val();
    var state_id = $("#my-state option:selected").val();
    var referring_code = $('#referral').val();

    var data = { first_name, last_name, mobile, email, password, zipcode, country_id, state_id, referring_code };

    this.httpService.post(environment.urlC + 'register', data)
      .subscribe((data) => {
        // console.log('data after register:', data);
        if (typeof data == 'string') {
          data = JSON.parse(data);
        }
        if (data.error) {
          this.utilityService.toast('error', 'data.error', '')

          return;
        } else {
          this.otpVerified = 1;
          this.OTPStarted = 1;
          this.otpSent = 1;
          this.success = 1;
          this.signup3 = 0;
          this.signup4 = 1;
          $('html, body').animate({ scrollTop: 0 }, 'slow');
        }
      });
  }

  public countryChanged = (data?: any) => {
    console.log('country change', data);
    let number = data.placeHolder.replace(/[- ]/g, "").substring(data.dialCode.length + 1, data.placeHolder.length)
    this.maxlength = number.length

    if (this.loginUser.country_id == 2) {
      this.countryToSet = 'PH';
    } else {
      this.countryToSet = 'US';
    }

    this.getStates();
  }

  public getCountries() {

    this.loginUser.country = "United States";
    this.loginUser.country_id = 1;
    this.countries = [];

    this.httpService.get(environment.urlC + 'countryList').subscribe((data) => {

      //console.log("abc: ", data, JSON.parse(data));

      // if (typeof(data) == 'string') data = JSON.parse(data);
      //console.log(data);
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
    }, (error) => { });


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


  public trackById(index: number, country: any): string {
    return country.country_id;
  }

  public trackByStateId(index: number, state: any): string {
    return state.state_id;
  }

  public stateChanged() {

  }

}
