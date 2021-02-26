import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';
import { ValidationService } from 'src/app/core/services/validation/validation.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

declare const google;
declare const Stripe;
declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: 'app-my-users',
  templateUrl: './my-users.component.html',
  styleUrls: ['./my-users.component.scss']
})
export class MyUsersComponent implements OnInit {
  searchuser: any;
  hideNext: any;
  Users: any[] = [];
  hideLoadMore: any;
  DisableLoadMore: any;
  cardForEmail: any;
  currentTab: any;
  myForm: any;
  doc: any;
  searchflag: number = 1;
  ridePage: number = 1;
  booking: any = {};
  skip: number = 0;
  currentPage: number = 1;
  corporateFareInfo: any[] = [];
  myTrips: any[] = [];

  userDetails: any = {};
  driverDetails: any = {};
  totalItems: number;
  timendate: number;
  driverselect: number;
  card: any;
  cardForUser: any;
  buttonClicked: number;
  EmailUpdating: any = 0;
  token: any;
  lastStep: number;

  searchForm: FormControl = new FormControl();

  
  constructor(
    private router: Router,
    private validation: ValidationService,
    private httpService: HttpService,
    private cookieService: CookieService,
    private utilityService: UtilityService
  ) {
    var driverModel = JSON.parse(localStorage.getItem('corporateModel'));
    var newdriverModel = JSON.parse(localStorage.getItem('driverdata'));
    if (driverModel) {
      this.userDetails.userName = driverModel.driver_name;
      this.userDetails.userImage = driverModel.driver_image;
      this.driverDetails.driver_image = driverModel.driver_image;
      this.driverDetails.driver_mobile = driverModel.driver_mobile;;
      this.driverDetails.driver_location = 'New York';
      this.driverDetails.referral_code = driverModel.referral_code;
    }
    else {
      this.cookieService.delete('web_access_token');
      this.router.navigate(["/", "corporate_login"]);
    }
  }

  ngOnInit(): void {

    $('html, body').animate({ scrollTop: 0 }, 'slow');
    this.initTable(this.searchflag);

    $(document.body).on('show.bs.collapse', '.panel-collapse', function () {
      $('.display').show();
    });

    $(document.body).on('hide.bs.collapse', '.panel-collapse', function () {
      $('.display').hide();

    });

    $(document).on('show.bs.modal', '.modal', function (event) {
      var zIndex = 1040 + (10 * $('.modal:visible').length);
      $(this).css('z-index', zIndex);
      setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
      }, 0);
    });

    $('.tripsbtn').not('.active-page').on('mouseover touchstart', function () {
      $(this).find('img').attr('src', $(this).data('hover'));
    });
    $('.tripsbtn').not('.active-page').on('mouseout touchend', function () {
      $(this).find('img').attr('src', $(this).data('unhover'));
    })

    this.initCard();

    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(() => this.initTable(1));
  }
  completeUserAdd() { }
  reScheduleNow() { }

  public logout() {
    $('.modal').modal('hide');
    this.cookieService.delete('web_access_token');
    this.router.navigate(["/", "corporate_login"]);
  };

  //   $scope.status = {
  //     isCustomHeaderOpen: false
  // };

  public pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.hideNext = 0;

    if ((this.totalItems / 10 + 1) <= currentPage) {
      this.hideNext = 1;
    }
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);
      }
    }

    this.initTable();
  };

  public initTable(searchflag?) {
    this.Users = null;
    var params = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: this.skip,
      searchFlag: 0,
      searchString: ''
    }
    if ((searchflag == 1) && this.searchuser) {
      params.offset = 0;
      this.currentPage = 1;
      // TODO
      params.searchFlag = 1;
      params.searchString = this.searchuser;

    } else if ((searchflag == 1) && !this.searchuser) {
      params.offset = 0;
      this.currentPage = 1;
    }
    // $('#loading').modal('show');

    this.httpService.post(environment.urlC + 'associated_user_list', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
      } else {
        this.totalItems = data.count;
        if (this.totalItems <= 10) {
          this.hideLoadMore = 1;
        } else {
          this.hideLoadMore = 0;
        }
        this.Users = data.users;
      }
        // $('#loading').modal('hide');
    })

  }

  public loadData() {
    $('.accordion-toggle').addClass('collapsed');
  };

  public loadMore() {
    this.DisableLoadMore = true;
    this.currentPage = this.currentPage + 1;
    this.hideLoadMore = 0;
    if ((this.totalItems / 10 + 1) <= this.currentPage) {
      this.hideLoadMore = 1;
      setTimeout(() => {
        this.DisableLoadMore = false;
      }, 1500)
    } else {
      this.hideLoadMore = 0;
      setTimeout(() => {
        this.DisableLoadMore = false;
      }, 1500)
    }
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);
        this.loadMoreNow();
      }
    }
  }

  public loadMoreNow(searchflag?) {
    var params = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: this.skip,
      searchFlag: 0,
      searchString: ''
    }
    if ((searchflag == 1) && this.searchuser) {
      params.searchFlag = 1;
      params.searchString = this.searchuser;
    }

    $('#loading').modal('show');

    this.httpService.post(environment.urlC + 'associated_user_list', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
      } else {
        this.totalItems = data.count;
        var Users = data.users;
        Users.forEach((userData, ind) => {
          this.Users.push(userData);
        });
      }
        $('#loading').modal('hide');
    })
  }

  //   $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
  //     $('.collapse').on('show.bs.collapse', function () {
  //         $('.collapse.in').collapse('hide');
  //         var index = $(this).attr("id");
  //         $scope.arrowKey = true
  //         $cookieStore.put('modalToOpen', index);
  //     });

  // });

  public showTime() {
    this.timendate = 1;
    this.driverselect = 0;
  }

  public showUserEditPopup() {
    $('#emailUpdateforUser').modal('show');
  }

  public initCard = function () {

    var stripe = Stripe(environment.stripeKey);
    var elements = stripe.elements();
    var style = {
      base: {
        // Add your base input styles here. For example:
        fontSize: '16px',
        color: "#32325d",
      }
    };

    // Create an instance of the card Element.
    this.card = elements.create('card', { style: style });

    // Add an instance of the card Element into the `card-element` <div>.
    this.card.mount('#card-element');

    this.card.addEventListener('change', function (event) {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
    var form = document.getElementById('payment-form');
    form.addEventListener('submit', (event) => {
      $('#loading').modal('show');
      event.preventDefault();
      stripe.createToken(this.card)
        .then((result) => {
          if (result.error) {
            $('#loading').modal('hide');
            this.buttonClicked = 0;
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
          } else {
            this.token = result.token;
            this.stripeTokenHandler(result.token);
          }
        }, (err) => {
          $('#loading').modal('hide');
        });
    });
  }

  public addUserPayment(user_token) {
    this.cardForUser = user_token;
  }

  public stripeTokenHandler(token) {
    if (this.cardForUser) {
      if (this.buttonClicked === 1) {
        $('#loading').modal('hide');
        return false;
      } else {
        this.buttonClicked = 1;
        this.httpService.post(environment.urlC + 'add_user_credit_card', {
          web_access_token: this.cookieService.get('web_access_token'),
          user_id: this.cardForUser,
          nounce: token.id,
          card_type: 52,
          offset: new Date().getTimezoneOffset() * -1,
        }).subscribe((data) => {
          $('#loading').modal('hide');
          setTimeout(() => {
            this.buttonClicked = 0;
          }, 3000);

          if (typeof (data) == 'string')
            data = JSON.parse(data);
          else data = data;

          if (data.flag == 301) {
            this.utilityService.toast('error', "Duplicate Card, Please try another", '');
          } else if (data.flag == 101) {
            this.utilityService.alert('error', data.error);
            this.router.navigate(["/", "corporate_login"]);
          } else if (data.flag == 4000) {
            this.utilityService.alert('error', data.log);
            this.showUserEditPopup();
          } else if (data.error) {
            this.utilityService.alert('error', data.error);
            return;
          } else {
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.card.clear();

            this.utilityService.toast('success', 'Card Added Successfully', '');

            $('#add_to_account').modal('hide');
            $('#add_user_card').modal('hide');
            $('#emailUpdateforUser').modal('hide');

            setTimeout(() => {
              $('html, body').animate({ scrollTop: 0 }, 'slow');
              $('#loading').modal('hide');
              location.reload();
            }, 200);
          }
        }, (err) => $('#loading').modal('hide'))
      }
    } else {
      $('#loading').modal('hide');
      this.utilityService.alert('info', 'User not selected for adding payment.');
    }
  }


  public updateUser() {

    if (!this.EmailUpdating) {

      if (this.validation.isEmailValid(this.cardForEmail)) {
        this.utilityService.toast('error', 'Please fill valid mail id');
        return
      }

      this.EmailUpdating = 1;
      this.httpService.post(environment.urlC + 'update_registered_user_info', {
        web_access_token: this.cookieService.get('web_access_token'),
        user_id: this.cardForUser,
        user_email: this.cardForEmail
      }).subscribe((data) => {
        this.EmailUpdating = 0;
        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;
        if (data.flag == 101) {
          this.utilityService.alert('error', data.error);
          this.router.navigate(["/", "corporate_login"]);
        } else if (data.error) {
          if (data.error == 'Please fill all the required fields.') {
            this.utilityService.alert('error', 'Please fill valid mail id');
          } else {
            this.utilityService.alert('error', data.error);
          }
          return;
        } else {
          this.stripeTokenHandler(this.token);
          this.utilityService.toast('success', 'User info updated Successfully', '')
          $('#add_to_account').modal('hide');
          $('#emailUpdateforUser').modal('hide');
          $('html, body').animate({ scrollTop: 0 }, 'slow');
        }
      })
    } else {
      this.utilityService.toast('error', 'Please Wait while we complete the request for you!', '')
      return false;
    }
  }

  public loadPickup() {
    var autocomplete = {};
    var autocompletesWraps = ['pickup', 'drop'];

    var test_form = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };
    var test2_form = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };


    autocompletesWraps.forEach((name, index) => {
      if ($('#' + name).length == 0) {
        return;
      }
      autocomplete[name] = new google.maps.places.Autocomplete($('#' + name + '.autocomplete')[0], { types: ['establishment'] });
      google.maps.event.addListener(autocomplete[name], 'place_changed', function () {

        var place = autocomplete[name].getPlace();
        if (name == 'pickup') {
          var latitude = place.geometry.location.lat();
          var longitude = place.geometry.location.lng();
          this.booking.current_latitude = latitude;
          this.booking.current_longitude = longitude;
          this.booking.pickup_location_address = place.formatted_address;
        }
        this.booking.is_fav = 1;
        this.booking.toll = 0;
        this.booking.promo_code = '';
        this.booking.promo_value = '0';
        this.booking.offset = '330';

        if (name == 'drop') {
          var latitude = place.geometry.location.lat();
          var longitude = place.geometry.location.lng();
          this.booking.latitude = latitude;
          this.booking.longitude = longitude;
          this.booking.manual_destination_latitude = latitude;
          this.booking.manual_destination_longitude = longitude;
          this.booking.manual_destination_address = place.formatted_address;
        }
        this.booking.ride_estimate_distance = '3469';
        this.booking.ride_estimate_time = '417';
        this.booking.estimated_fare = '22.26';
      });

    })

  }

  public showDriver() {
    if (this.booking.time_hour && this.booking.date && this.booking.pickup && this.booking.drop) {
      this.timendate = 0;
      this.driverselect = 1;
      this.lastStep = 0;
    } else {
      this.utilityService.alert('info', 'Please enter details');
    }
  }

  public showLast() {
    if (this.booking.driver_id && this.booking.car) {
      this.timendate = 0;
      this.driverselect = 0;
      this.lastStep = 1;
    } else {
      this.utilityService.alert('info', 'Please Select Driver');
    }
  }

  public BookRideNow() {
    this.booking.time = this.booking.date + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes + ':00';
    this.httpService.post(environment.urlC + 'schedule_request', {
      web_access_token: this.cookieService.get('web_access_token'),
      current_latitude: this.booking.current_latitude,
      current_longitude: this.booking.current_longitude,
      estimated_fare: this.booking.estimated_fare,
      ride_estimate_distance: this.booking.ride_estimate_distance,
      ride_estimate_time: this.booking.ride_estimate_time,
      pickup_location_address: this.booking.pickup_location_address,
      latitude: this.booking.latitude,
      longitude: this.booking.longitude,
      pickup_time: this.booking.time,
      car_type: this.booking.car,
      driver_id: this.booking.driver_id,
      is_fav: this.booking.is_fav,
      manual_destination_latitude: this.booking.manual_destination_latitude,
      manual_destination_longitude: this.booking.manual_destination_longitude,
      manual_destination_address: this.booking.manual_destination_address,
      toll: this.booking.toll,
      route: this.booking.route,
      promo_code: this.booking.promo_code,
      user_id: this.booking.user_id,
      offset: this.booking.offset,
      promo_value: this.booking.promo_value,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error || data.flag == 0) {
        this.utilityService.alert('error', data.error || data.message);
        return;
      } else {
      }
    })
  }

  public BookUserRide(user) {

    localStorage.setItem('book-ride-for', user.user_mobile);
    localStorage.setItem('book-ride-user-name', user.user_name);
    // $state.go("corporate.bookRide");
    this.router.navigate(['/', 'corporate', 'live-tracking',]);
    return
    this.showTab('1b');
    this.loadPickup();
    this.booking.started = 1;
    this.booking.user_id = user.user_id;
    this.timendate = 1;
    this.driverselect = 0;
    if (user.user_id) {
      this.httpService.post(environment.urlC + 'get_ride_data', {
        web_access_token: localStorage.getItem('web_access_token'),
        user_id: user.user_id,
        region_id: 24
      }).subscribe((data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);
        if (data.error || data.flag == 0) {
          alert(data.error || data.message);
          return;
        } else {
          this.corporateFareInfo = data.corporateFareInfo;
          // this.Drivers = data.favDriver;
          // $scope.$apply();
        }
      })
    }
  }

  public deleteUser(user) {
    this.utilityService.confirm('delete this User from My Users?').then((result) => {
      if (result.value) {
        $('#loading').modal('show');
        if (user.user_id) {
          this.httpService.post(environment.urlC + 'corporate_remove_user', {
            web_access_token: this.cookieService.get('web_access_token'),
            association_id: user.user_id
          }).subscribe((data) => {
            if (typeof (data) == 'string') data = JSON.parse(data);
            if (data.error || data.flag == 0) {
              this.utilityService.alert('error', data.error || data.message);
              $('#loading').modal('hide');
              return;
            } else {
              this.utilityService.toast('success', 'User Removed Successfully', '');
              setTimeout(() => {
                $('html, body').animate({ scrollTop: 0 }, 'slow');
                $('#loading').modal('hide');
                location.reload();
              }, 20);
            }
          })
        }
      }
    })
  }

  public showTab(div) {
    this.currentTab = div;
  }

  public openAddUser() {
    window.open('/#/corporate/riderSignup', '_blank');
  };

  public viewDetails(modalIndex) {
    var tripDetails = this.myTrips[modalIndex];
    localStorage.setItem('userTripDetails', JSON.stringify(tripDetails));
    // $state.go("driver.rideDetails");
    this.router.navigate(["/", "corporate_login"]);
  };

  public rotateImage(id) {
    if ($('.table:nth-child(' + id + ') .displayArrow').hasClass('.collapse_dark_arrow')) {
      $('.table:nth-child(' + id + ') .displayArrow').removeClass('.collapse_dark_arrow')
    } else {
      $('.table:nth-child(' + id + ') .displayArrow').addClass('.collapse_dark_arrow');
    }
  }
}
