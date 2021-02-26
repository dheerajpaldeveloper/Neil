import { environment } from 'src/environments/environment';
import { UtilityService } from './../../core/services/utility/utility.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SearchCountryField, TooltipLabel, CountryISO } from 'ngx-intl-tel-input-r';
import { HttpService } from '../../services/http/http.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

declare const jQuery: any;
const $: any = jQuery;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  loginMode: number = 1;
  forgotMode: number = 0;
  otpVerifyMode: number = 0;
  resetMode: number = 0;
  resetSuccess: number = 0;
  error: string = '';

  forgot = { 'mobile': '' };
  otp: string = '';

  otpVerified: number = 0;
  forgotStarted: number = 0;
  OTPStarted: number = 0;

  promoCountryCode: string = '';
  hitInProgress: number = 0;
  loginDriver: any = {
    mobile: '',
    password: ''
  };

  otpSent: number = 0;
  success: boolean = false;
  onloadDisble: boolean = false;

  isDisable: boolean = false;
  loadings: boolean = false;
  DisableOtp: boolean = false;
  DisableRegenrate: boolean = false;
  DisableVerifyOtp: boolean = false;

  resetPass: any = {

  }

  show_err: number = 0;
  text: string = "RESET PASSWORD";
  set: string = "SET PASSWORD";

  showPassword: number = 0;

  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  phoneNumber: FormControl = new FormControl(undefined);
  forgotMobileNumber: FormControl = new FormControl(undefined, [Validators.required]);

  is_approved: any;
  successMsg = '';
  errorMsg = '';

  resendOTPOne: number = 1;
  otpError: string = '';
  otpSuccess: string = '';

  saveInProgress: number;


  // reference of the last toast for [ confirm password error ]
  lastToastRef;

  constructor(
    private router: Router,
    private utilityService: UtilityService,
    private httpService: HttpService,
    private cookieService: CookieService
  ) {
    localStorage.removeItem('book-ride-for');
  }

  ngAfterViewInit(): void {
    $('#mobile').focus();

    $("#mobile").blur(() => {
      if (!this.phoneNumber.value) return;
      // $('#extPopTwo').val('+' + countryData.dialCode); // do something with countryData
      localStorage.setItem("countryCode", this.phoneNumber.value.dialCode); // do something with countryData
      this.formatMobileNumber();
    });

    $("#mobile1").blur(() => {
      if (!this.forgotMobileNumber.value) return;

      // $('#extPopThree').val('+' + this.phoneNumber.value.dialCode); // do something with countryData
      localStorage.setItem("countryCode", this.forgotMobileNumber.value.dialCode); // do something with countryData
    });

  }

  ngOnInit(): void {
    $(document).ready(() => {
      $('.modal-backdrop.show').remove();
      if (localStorage.getItem('userModel') != null) {
        location.reload();
      }
      $('body').addClass('login-page');
      $('#mobile').attr('type','text')
    });

    window.onbeforeunload = this.WindowCloseHanlder;
  }

  public WindowCloseHanlder() {
    if (!localStorage.get('web_access_token')) {
      window.location.href = 'http://qudos.tech/affiliatelogin.html';
    }
  };

  public isNumberKeys(evt): boolean {
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (charCode < 48 || charCode > 57) return false;

    return true;
  }

  public isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;


    if (charCode == 43) return true;

    if (charCode < 48 || charCode > 57)
      return false;

    return true;
  }

  public homelink() { }

  public resetComplete() {
    this.loginMode = 0;
    this.forgotMode = 0;
    this.resetSuccess = 1;
    this.otpVerifyMode = 0;
    this.resetMode = 0;
  }

  public switchToLogin() {
    this.loginMode = 1;
    this.forgotMode = 0;
    this.otpVerifyMode = 0;
    this.resetMode = 0;
    this.otpVerified = 0;
    this.forgotStarted = 0;
    this.OTPStarted = 0;
    this.resetSuccess = 0;
  }

  public startAgain() {
    location.reload();
  }

  public showLogin() {
    this.loginMode = 1;
    this.forgotMode = 0;
  }

  public sendOtpEnter(e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {

      if ($("#input3").val().length != 0) {

        this.verifyOTP();
      }
    } else {
      // return true;
    }
  };

  public resetForm(user_mobile, password) {
    document.getElementById("promoPhone")['val'] = "";
    document.getElementById("pass")['val'] = "";
    document.getElementById("promoPhoneOne")['val'] = "";
    if ($("#promoPhone").css("border-color", "rgb(244,67,54)") || ($("#pass").css("border-color", "rgb(244,67,54)")) || $("#promoPhoneOne").css("border-color", "rgb(244,67,54)")) {

      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(225, 225, 225)");

      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(225, 225, 225)");

      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(225, 225, 225)");
      location.reload();
    } else {
      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(244,67,54)");
      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(244,67,54)");
      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(244,67,54)");
    }
  };

  public promoCountry(c) {
    this.promoCountryCode = '+' + c;
  };

  public formatMobileNumber = () => {

    this.promoCountryCode = this.phoneNumber.value.dialCode + "-";
    this.loginDriver.mobile = this.phoneNumber.value.number;

    if (this.loginDriver.mobile) {
      if (this.loginDriver.mobile.indexOf('+') >= 0) {
        this.loginDriver.mobile = this.loginDriver.mobile.replace(this.phoneNumber.value.dialCode + "-", '');
        this.loginDriver.mobile = this.loginDriver.mobile.replace(this.phoneNumber.value.dialCode, '');
        this.phoneNumber.setValue(this.loginDriver.mobile);
      }
    }
  }

  public forgotStartOne() {
    this.error = '';
    this.otpVerified = 0;
    this.forgotStarted = 1;
    this.OTPStarted = 0;
    this.showPassword = 0;
    $(".grid_before").removeClass("flipInY");
    $(".gridBlock").addClass("flipInY");
    this.otpSent = 0;
  }

  public forgotStart() {
    this.error = '';
    this.forgotStarted = 1;
    this.OTPStarted = 0;
    this.otpSent = 0;
    this.loginMode = 0;
    this.forgotMode = 1;

    $(".grid_before").removeClass("flipInY");
    $(".gridBlock").addClass("flipInY");
    this.otpSent = 0;
  }

  public changeNum() {
    this.forgotStarted = 1;
    this.OTPStarted = 0;
    this.otpSent = 0;
    this.loginMode = 0;
    this.forgotMode = 1;
    this.otp = '';
  }

  public forgotBack = function () {
    this.error = '';
    this.otpSent = 0;
    this.forgotStarted = 0;
    this.OTPStarted = 0;
    this.otpVerified = 0;
    $(".gridBlock").removeClass("flipInY");
    $(".grid_before").addClass("flipInY");
  }

  public pressLoginEnter(e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
      if ($("#promoPhone").val().length != 0) {
        this.loginDriverFn();
      }
    } else {
      // return true;
    }
  };

  public pressForgotEnter = function (e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
      if ($("#promoPhoneOne").val().length != 0) {
        this.requestOTP();
      }
    } else {
      // return true;
    }
  };

  public showVerify() {
    this.success = true;
    this.otpSent = 1;
    this.otpVerified = 0;
    this.loginMode = 0;
    this.forgotMode = 0;
    this.otpVerifyMode = 1;
  }

  public showResetScreen = function () {
    this.openToast('success', 'OTP verified successfully.', '');
    this.otpVerified = 1;
    this.OTPStarted = 0;
    this.forgotStarted = 0;
    this.otpVerifyMode = 0;
    this.resetMode = 1;
  }

  public BackStartOne() {
    this.otpVerified = 0;
    this.forgotStarted = 0;
    this.OTPStarted = 0;
    this.showPassword = 0;
    document.getElementById("promoPhone")['val'] = "";
    document.getElementById("pass")['val'] = "";
    document.getElementById("promoPhoneOne")['val'] = "";
    if ($("#promoPhone").css("border-color", "rgb(244,67,54)") || ($("#pass").css("border-color", "rgb(244,67,54)")) || $("#promoPhoneOne").css("border-color", "rgb(244,67,54)")) {

      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(225, 225, 225)");

      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(225, 225, 225)");

      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(225, 225, 225)");
      location.reload();
    } else {
      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(244,67,54)");
      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(244,67,54)");
      $("md-input-container.md-default-theme.md-input-invalid .md-input").css("border-color", "rgb(244,67,54)");
    }
  }

  public loginDriverFn() {
    this.error = '';

    if (this.phoneNumber.invalid) {
      return this.utilityService.toast("error", "Please enter valid number.");
    } else {
      this.loginDriver.mobile = this.phoneNumber.value.number;
      this.promoCountryCode = this.phoneNumber.value.dialCode;
    }

    if (!this.loginDriver.mobile) {
      return this.utilityService.alert("info", "Please enter Mobile number.");
    } else if (!this.loginDriver.password) {
      return this.utilityService.alert("info", "Please enter Password.");
    } else if (this.loginDriver.password.length < 6) {
      return this.utilityService.alert("info", "Password should be of at least 6 letters. Please enter the valid password")
    } else if (this.loginDriver.mobile && this.loginDriver.password) {

      this.loadings = true;
      this.isDisable = true;
      const data = {
        mobile: this.promoCountryCode + '-' + this.loginDriver.mobile,
        password: this.loginDriver.password,
        web_access_token: 0,
        access_token_login_flag: 0,
      };
      this.httpService.post(environment.urlC + 'mobile_login', data)
        .subscribe((data) => {
          if (typeof (data) == 'string')
            data = JSON.parse(data);

          if (data.error) {
            this.error = data.error;

            this.utilityService.toast('error', data.error, '');
            this.loadings = false;

            setTimeout(() => {
              this.isDisable = false;
            }, 1500);

            // this.$digest();
          } else if (data.login[0].web_access_token) {

            this.loadings = false;
            this.isDisable = false;
            var params = {
              mobile: this.promoCountryCode + '-' + this.loginDriver.mobile,
              password: this.loginDriver.password,
              web_access_token: data.login[0].web_access_token,
              access_token_login_flag: 0,
            };

            this.httpService.post(environment.urlC + 'access_token_login', params)
              .subscribe((resp) => {
                if (typeof (resp) == 'string')
                  resp = JSON.parse(resp);

                if (resp.error) {
                  this.error = resp.error;
                  this.utilityService.toast('error', data.error, '');
                  this.loadings = false;

                  setTimeout(() => {
                    this.isDisable = false;
                  }, 1500);

                  // this.$digest();
                } else {
                  this.loadings = false;
                  this.isDisable = false;
                  const driverModel = {
                    "first_name": resp.login[0].first_name,
                    "driver_name": resp.login[0].first_name + ' ' + resp.login[0].last_name,
                    "driver_image": resp.login[0].image,
                    "driver_mobile": resp.login[0].mobile,
                    "driver_email": resp.login[0].email,
                    "referral_code": resp.login[0].referral_code,
                    "zipcode": resp.login[0].zipcode,
                    "state_id": resp.login[0].state_id,
                    "corporate_id": resp.login[0].corporate_id,
                    "subtype_id": resp.login[0].subtype_id,
                    "location": resp.login[0].city,
                    "state": resp.login[0].state,
                    "city": resp.login[0].city,
                    "address": resp.login[0].address,
                    "latitude": resp.login[0].latitude,
                    "longitude": resp.login[0].longitude,
                  }

                  if (!driverModel.driver_image) {
                    driverModel['driver_image_approved'] = 'images/default.png';
                    driverModel.driver_image = 'images/default.png';
                  }

                  var web_access_token = resp.login[0].web_access_token;

                  this.cookieService.set('web_access_token', web_access_token);
                  this.cookieService.set('access_token', web_access_token);


                  localStorage.setItem('corporateModel', JSON.stringify(driverModel));
                  this.cookieService.set('driverdata', resp.login[0]);

                  localStorage.setItem('driverdata', JSON.stringify(resp.login[0]));
                  localStorage.setItem('justLogin', '1');

                  this.router.navigate(['/', 'corporate', 'live-tracking']);
                }
              });

          } else {
            this.utilityService.alert('error', 'No Token Received');
          }
        })

    } else {
      this.utilityService.alert("error", "Invalid Mobile number or Password.");
    }
  }

  public verifyOTP() {
    this.DisableVerifyOtp = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.saveInProgress = 1;

    this.loadings = true;

    if (!this.otp) {
      this.utilityService.alert('info', 'Please enter OTP');
      setTimeout(() => {
        this.DisableVerifyOtp = false;
        this.loadings = false;
      }, 500);

    } else {
      this.httpService.post(environment.urlC + 'verify_otp', {
        "mobile": this.promoCountryCode + this.forgot.mobile,
        "otp": this.otp
      }).subscribe((data) => {

        if (typeof data == 'string') data = JSON.parse(data);
        if (data.error) {
          this.otpError = 'You have entered incorrect OTP';
          this.otpSuccess = '';
          this.forgotStarted = 0;
          this.otpVerified = 0;
          this.OTPStarted = 1;
          this.utilityService.toast('error', data.error, '');

          setTimeout(() => {
            this.DisableVerifyOtp = false;
            this.loadings = false;
          }, 400);

        } else if (data.flag == 122) {

          this.utilityService.toast('success', 'OTP verified successfully.', '');
          this.loginMode = 0;
          this.forgotMode = 0;
          this.resetMode = 1;
          this.otpVerifyMode = 0;
          this.otpVerified = 1;
          this.OTPStarted = 0;
          this.forgotStarted = 0;
          this.loadings = false;

        } else {
          this.utilityService.toast('success', 'OTP verified successfully.', '');
          this.loginMode = 0;
          this.forgotMode = 0;
          this.resetMode = 1;
          this.otpVerifyMode = 0;
          this.otpVerified = 1;
          this.OTPStarted = 0;
          this.forgotStarted = 0;
          this.loadings = false;
        }

        //$scope.showResetScreen();
      })
    }
  }


  public requestOTP() {

    if (!this.forgotMobileNumber.value || !this.forgotMobileNumber.value.number) {
      this.utilityService.toast('info', 'Please Enter Mobile Number');
      return;
    }

    var mobile = this.forgotMobileNumber.value.number;

    if (mobile.trim() == '') {
      this.utilityService.toast('info', 'Please Enter Mobile Number');
      return;
    }
    this.DisableOtp = true;
    this.loadings = true;
    this.promoCountryCode = this.forgotMobileNumber.value.dialCode + "-";


    this.forgot.mobile = mobile;
    if (this.forgot.mobile.indexOf('+') >= 0) {
      //$scope.promoCountryCode = '';
      this.forgot.mobile = this.forgot.mobile.replace(this.forgotMobileNumber.value.dialCode + "-", '');
      this.forgot.mobile = this.forgot.mobile.replace(this.forgotMobileNumber.value.dialCode, '');
    }


    var data = {
      mobile: this.promoCountryCode + this.forgot.mobile
    };

    this.error = '';
    var stop;
    this.httpService.post(environment.urlC + 'mobile_forgot_password', data)
      .subscribe((data) => {

        if (typeof (data) == 'string') data = JSON.parse(data);

        if (data.error) {
          if (data.error == 'This email or phone number is not registered with us.') {
            this.utilityService.toast('error', 'This phone number is not registered with us.', '');
          } else {
            this.utilityService.toast('error', data.error, '');
          }

          setTimeout(() => {
            this.DisableOtp = false;
          }, 1500);

          this.loadings = false;
          this.forgotStarted = 1;
          this.OTPStarted = 0;
          this.otpSent = 0;
          this.otpVerified = 0;
        } else {
          this.DisableOtp = false;
          this.loadings = false;
          // this.driver_mobile = data.mobile; TODO: FC

          this.error = "";

          this.success = true;
          this.otpSent = 1;
          this.otpVerified = 0;


          this.loginMode = 0;
          this.forgotMode = 0;
          this.otpVerifyMode = 1;

          this.utilityService.toast('success', data.log, '');

        }
      }, (error) => {
        this.DisableOtp = false;
        this.loadings = false;
      })

  }

  public regenerateOTP() {
    this.successMsg = '';
    this.errorMsg = '';
    // this.DisableRegenrate = true;
    this.httpService.post(environment.urlC + 'resend_otp', {
      mobile: this.promoCountryCode + this.forgot.mobile,
      is_approved: this.is_approved
    })
      .subscribe((data) => {
        if (data.flag == 0) {
          this.errorMsg = data.message;

          setTimeout(function () {
            this.errorMsg = '';
          }, 2500);

          setTimeout(function () {
            this.DisableRegenrate = false;
          }, 2500);

          this.utilityService.toast('error', this.errorMsg);

        } else {
          //  $scope.otp = '';

          this.otpSuccess = 'An OTP has been sent to your mobile number';
          this.utilityService.toast('success', 'An OTP has been sent on your mobile number', '');

          setTimeout(function () {
            this.DisableRegenrate = false;
          }, 2500);
        }
      }, (error) => {

      })

  }

  public setPassword() {
    this.errorMsg = '';
    this.utilityService.clearToast();

    if (!this.resetPass.password) {
      this.utilityService.alert('info', 'Please enter New password');
      return;
    } else if (this.resetPass.password.length < 6) {
      this.utilityService.alert('info', 'Password should be of atleast 6 characters');
      return;
    } else if (!this.resetPass.confirmpassword) {
      this.utilityService.alert('info', 'please enter Confirm password');
      return;
    } else if (this.resetPass.password != this.resetPass.confirmpassword) {
      if(this.lastToastRef?.toastId){
        this.utilityService.removeToast(this.lastToastRef?.toastId);
      }
      this.lastToastRef = this.utilityService.toast('error', 'New and Confirm password doesn\'t match.', '');
      // this.onloadDisble = true;
      // setTimeout(() => {
      //   this.errorMsg = "";
      //   this.onloadDisble = false;
      //   // this.$apply();
      // }, 3000);

    } else {
      this.onloadDisble = true;
      this.httpService.post(environment.urlC + 'reset_password_mobile', {
        mobile: this.promoCountryCode + this.forgot.mobile,
        password: this.resetPass.password,
        otp: this.otp,
        is_approved: 0

      }).subscribe((data) => {
        // data = JSON.parse(data);
        var takeInside = {
          mobile: this.forgot.mobile,
          password: this.resetPass.password,
          is_approved: parseInt(this.is_approved)
        };
        localStorage.setItem('takeInside', JSON.stringify(takeInside));

        if (data.error && data.flag == 130) {
          setTimeout(() => {
            this.onloadDisble = false;
          }, 1500);

          this.utilityService.toast('error', "old and new password must be different", '');
        } else if (data.error) {

          setTimeout(() => {
            this.onloadDisble = false;
          }, 1500);

          this.utilityService.toast('error', data.error, '');
        } else if (data.flag != 117) {
          this.utilityService.toast('error', 'Something went wrong, Please try again later.', '');
          this.resetPass = {}
          setTimeout(() => {
            this.onloadDisble = false;
          }, 1500)
          // $scope.$apply();
          setTimeout(() => {
            this.errorMsg = "";
            // $scope.$apply();
          }, 3000);
        } else if (data.flag == 117) {
          setTimeout(() => {
            this.onloadDisble = false;
          }, 1500)
          this.resetSuccess = 1;
          this.otpVerifyMode = 0;
          this.resetMode = 0;
        } else {
          this.errorMsg = data.message.toString();
          setTimeout(() => {
            this.errorMsg = "";
          }, 3000);
          setTimeout(() => {
            this.onloadDisble = false;
          }, 1500)
        }
      });
    }
  }

}
