import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';
import { HttpHeaders, HttpParams } from '@angular/common/http';

declare const google;
declare const jQuery: any;

const $: any = jQuery;
@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {
  doc: any;
  Drivers: any[] = [];
  corporateFareInfo: any[] = [];
  myTrips: any[] = [];
  booking: any = {
    abc: 1
  }
  skip: number = 0;
  currentPage: number = 1;
  ridePage: number = 0;
  showLoader: number = 0;
  userDetails: any = {};
  driverDetails: any = {}
  ridesType: string = '0';
  hideNext: number;
  totalItems: number;
  triptoCancel: any;
  tripTypeCancel: any;
  rTrip: any;
  lastStep: any;
  driverselect: any;
  currentTab: any;
  data: any[];

  constructor(
    private router: Router,
    private httpService: HttpService,
    private cookieService: CookieService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    $(document.body).on('show.bs.collapse', '.panel-collapse', function () {
      $('.display').show();
    });

    $('.tripsbtn').not('.active-page').on('mouseover touchstart', function () {
      $(this).find('img').attr('src', $(this).data('hover'));
    });
    $('.tripsbtn').not('.active-page').on('mouseout touchend', function () {
      $(this).find('img').attr('src', $(this).data('unhover'));
    })

    $(document.body).on('hide.bs.collapse', '.panel-collapse', function () {
      $('.display').hide();
    });
    // $('#date').datepicker({
    //   format: 'yyyy-mm-dd',
    //   startDate: '0d'
    // });
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
    this.data = [{
      label: 'Scheduled',
      value: "1"
    }, {
      label: 'Regular',
      value: "0"
    }]
    this.initTable();
  }
  completeUserAdd() { }
  public showDriver() { }
  public BookRideNow() { }
  public showTime() { }
  public showLast() { }
  public showTab(data) { }

  public logout() {
    $('.modal').modal('hide');
    this.cookieService.delete('web_access_token');
    this.router.navigate(["/", "corporate_login"]);
  };
  // $scope.status = {
  //   isCustomHeaderOpen: false
  // };
  public getRideType() {
    var ridesType = localStorage.getItem('ridesType');
    if (!ridesType) {
      localStorage.setItem('ridesType', '0');
      this.ridesType = '0';
    } else {
      this.ridesType = ridesType;
    }
  }

  public setRideType() {
    localStorage.setItem('ridesType', this.ridesType);
    this.currentPage = 1;
    this.skip = 0;
    this.initTable();
  }

  public pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.hideNext = 0;

    if ((this.totalItems / 10 + 1) <= currentPage) {
      this.hideNext = 1;
    }
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);
        $('.collapse').removeClass('show');
      }
    }
    this.initTable();
  };

  public initTable() {
    var limit = 10;

    let payload = {
      'web_access_token': this.cookieService.get("web_access_token"),
      'limit': `${limit}`,
      'offset': `${this.skip}`,
      'requestType': '3',
      'is_schedule': this.ridesType,
    }
    this.httpService.postFormData(environment.urlC + 'ride_history', payload).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
        this.myTrips = [];
        this.totalItems = data.total_length;
        if ((this.totalItems / 10 + 1) <= this.currentPage) {
          this.hideNext = 1;
        } else {
          this.hideNext = 0;
        }
        var Bookings = data.my_trips;

        Bookings.forEach(function (bookingData, ind) {
          if ((bookingData.ride_status > 3)) {
            return false;
          }
          var d = bookingData;
          d.payment_method = bookingData.payment_method || 'Card';
          d.ride_key = bookingData.ride_status
          switch (bookingData.ride_status) {
            case 0:

              if (((bookingData.request_status == 0) || (bookingData.request_status == null)) && (bookingData.is_active == 1)) {
                d.ride_status = "Assigning";
              } else if (((bookingData.request_status == 0) || (bookingData.request_status == null)) && (bookingData.is_active == 0)) {
                d.ride_status = "Missed by driver";
              } else if ((bookingData.request_status == 1)) {
                d.ride_status = "Accepted"
              } else if ((bookingData.request_status == 10)) {
                d.ride_status = "Missed by driver"
              } else if ((bookingData.request_status == 5)) {
                d.ride_status = "Cancelled by driver"
              } else {
                d.ride_status = "Unknown "
              }

              break;
            case 1:
              d.ride_status = "Picking Up"
              break;
            case 2:
              d.ride_status = "Arrived"
              break;
            case 3:
              d.ride_status = "En Route"

              break;
            case 4:
              d.ride_status = "Completed"
              break;
            case 5:
              d.ride_status = "Cancelled by driver"
              break;
            case 6:
              d.ride_status = "Cancelled by rider"
              break;
            case 7:
              d.ride_status = "Cancelled by rider"
              break;
            case 8:
              d.ride_status = "Unsuccessful payment"
              break;
            case 9:
              d.ride_status = "Cancelled by admin"
              break;
            case 10:
              d.ride_status = "Missed by driver"
              break;
            case 11:
              d.ride_status = "Cancelled by corporate"
              break;

          }

          d.path_string = bookingData.path_string;
          d.ratings = [];
          for (let i = 0; i < d.user_rating; i++) {
            d.ratings.push(1);
          }
          d.noRatings = [];
          for (let i = 0; i < (5 - d.user_rating); i++) {
            d.noRatings.push(1);
          }
          d.imgSource = 'https://maps.googleapis.com/maps/api/staticmap?size=400x400&style=feature%3Alandscape%7Cvisibility%3Aoff&style=feature%3Apoi%7Cvisibility%3Aoff&style=feature%3Atransit%7Cvisibility%3Aoff&style=feature%3Aroad.highway%7Celement%3Ageometry%7Clightness%3A39&style=feature%3Aroad.local%7Celement%3Ageometry%7Cgamma%3A1.45&style=feature%3Aroad%7Celement%3Alabels%7Cgamma%3A1.22&style=feature%3Aadministrative%7Cvisibility%3Aoff&style=feature%3Aadministrative.locality%7Cvisibility%3Aon&style=feature%3Alandscape.natural%7Cvisibility%3Aon&scale=2&markers=shadow%3Afalse%7Cscale%3A2%7Cicon%3Ahttps://s3.ap-south-1.amazonaws.com/qudosemail/pickup1.png%7C' + bookingData.pickup_latitude + '%2C' + bookingData.pickup_longitude + '&markers=shadow%3Afalse%7Cscale%3A2%7Cicon%3Ahttps://s3.ap-south-1.amazonaws.com/qudosemail/drop_off1.png%7C' + bookingData.manual_destination_latitude + '%2C' + bookingData.manual_destination_longitude + '&path=geodesic:true%7Cweight:3%7Ccolor:0x2dbae4ff%7C' + bookingData.path_string + '&key=AIzaSyADXfBi40lkKpklejdGIWNxdkqQCKz8aKI';

          d.total_with_tax = bookingData.total_with_tax.toFixed(2);
          //d.total_with_tax = parseFloat(d.total_with_tax);
          if (bookingData.pickup_time) {
            d.pickup_time = bookingData.pickup_time;

            var dt = new Date(d.pickup_time)
            dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
            var raw = dt.toISOString();
            d.pickup_time = raw;
          }
          if (bookingData.start_time) {
            d.start_time = bookingData.start_time;
          }
          if ((d.ride_status != 'Completed') && (d.ride_status != 'Unknown') && (d.ride_status != 'Cancelled by driver') && (d.ride_status != 'Cancelled by admin') && (d.ride_status != 'Missed by driver')) {
            this.myTrips.push(d);
            var index = this.myTrips.length;
            this.getRouteEnc(d.pickup_location_address, d.manual_destination_address, d, index - 1);
          }
        });
        $('.collapse').removeClass('show');
      }
    })

  }

  public sorterFunc(car) {
    return parseFloat(car.value_regular);
  };

  public getCSV(data) {
    let payload = {
      'web_access_token': this.cookieService.get("web_access_token"),
      'limit': `${10}`,
      'offset': `${this.skip}`,
      'requestType': '3',
    }
    this.httpService.postFormData(environment.urlC + 'ride_history', payload).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
        this.totalItems = data.total_length;
        var Bookings = data.my_trips;
        var csvContent = "data:text/csv;charset=utf-8,";
        var header = 0;
        Bookings.forEach(function (bookingData, ind) {
          if ((bookingData.ride_status > 3)) {
            return false;
          }
          var d = bookingData;
          d.payment_method = bookingData.payment_method || 'Card';

          switch (bookingData.ride_status) {
            case 0:

              if ((bookingData.request_status == 0)) {
                d.ride_status = "Assigning";

              } else if ((bookingData.request_status == 1)) {
                d.ride_status = "Accepted"
              } else if ((bookingData.request_status == 10)) {
                d.ride_status = "Missed by driver"
              }

              break;
            case 1:
              d.ride_status = "Picking Up"
              break;
            case 2:
              d.ride_status = "Arrived"
              break;
            case 3:
              d.ride_status = "En Route"
              break;
            case 4:
              d.ride_status = "Completed"
              break;
            case 5:
              d.ride_status = "Cancelled by driver"
              break;
            case 6:
              d.ride_status = "Cancelled by rider"
              break;
            case 7:
              d.ride_status = "Cancelled by rider"
              break;
            case 8:
              d.ride_status = "Unsuccessful payment"
              break;
            case 10:
              d.ride_status = "Missed by driver"
              break;
            case 11:
              d.ride_status = "Cancelled by corporate"
              break;

          }
          if (bookingData.pickup_time) {
            d.pickup_time = bookingData.pickup_time;

            var dt = new Date(d.pickup_time)
            dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
            var raw = dt.toISOString();
            d.pickup_time = raw;
          }
          if (bookingData.start_time) {
            d.start_time = bookingData.start_time;

            var dt = new Date(d.start_time)
            dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset())
            var raw = dt.toISOString();
            d.start_time = raw;
          }
          d.path_string = bookingData.path_string;
          d.ratings = [];
          for (let i = 0; i < d.user_rating; i++) {
            d.ratings.push(1);
          }
          d.noRatings = [];
          for (let i = 0; i < (5 - d.user_rating); i++) {
            d.noRatings.push(1);
          }
          if ((d.ride_status != 'Completed') && (d.ride_status != 'Missed by driver')) {
            var obj = bookingData;
            if (!header) {
              header = 1

              var csvKey = Object.keys(obj).filter((key, v) => {

                if ((key == "session_id") || (key == "user_name") || (key == "car_name") || (key == "ride_status")) {
                  return obj[key];
                } else if (key == "pickup_time") {
                  return obj[key];
                } else if (key == "total_with_tax") {
                  return obj[key] + " paid via ";
                }

              });
              csvContent += csvKey + "\r\n";
            }
            var row = [];
            var payment_method = obj['payment_method'];

            for (let key in obj) {

              if ((key == "session_id") || (key == "user_name") || (key == "car_name") || (key == "ride_status")) {
                row.push(obj[key]);
              } else if (key == "pickup_time") {
                // var dateData = $filter('date')(new Date(obj[key]), 'MM/dd/yyyy HH:mm a');
                // row.push(dateData);
              } else if (key == "total_with_tax") {
                row.push(obj[key] + " paid via " + payment_method);
              }
            }
            csvContent += row + "\r\n";
          }
        });
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Trips_data.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
      }
    })

  }

  public getRouteEnc(o, d, bookingData, pointer) {
    var directionsService = new google.maps.DirectionsService();
    var request = {
      origin: o,
      destination: d,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    let polylines = '0';
    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        polylines = response.routes[0].overview_polyline;
        var imgSourcePath = 'https://maps.googleapis.com/maps/api/staticmap?size=600x600&path=color:0x00000cd0|weight:5|enc:' + polylines + '&markers=shadow:false|scale:2|color:green|label:A|' + bookingData.pickup_latitude + ',' + bookingData.pickup_longitude + '&markers=color:red|label:B|shadow:false|scale:2|' + bookingData.manual_destination_latitude + ',' + bookingData.manual_destination_longitude + '&key=AIzaSyADXfBi40lkKpklejdGIWNxdkqQCKz8aKI';
        bookingData.imgSourcePath = imgSourcePath;
      }
    });
  }

  public loadData() {
    $('.accordion-toggle').addClass('collapsed');
  };
  // $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
  //   $('.collapse').on('show.bs.collapse', function () {
  //     $('.collapse.in').collapse('hide');
  //     var index = $(this).attr("id");
  //     $scope.arrowKey = true
  //     $cookieStore.put('modalToOpen', index);
  //   });

  // });
  public cancelRidePopup(modalIndex) {
    var tripDetails = this.myTrips[modalIndex];
    this.triptoCancel = tripDetails;
    this.tripTypeCancel = tripDetails.is_schedule;
  };

  public cancelRide(trip) {
    var tripDetails = trip;
    if (tripDetails.session_id) {
      this.httpService.post(environment.urlC + 'cancel_ride', {
        web_access_token: this.cookieService.get('web_access_token'),
        session_id: tripDetails.session_id
      }).subscribe((data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);

        if (data.error || data.flag == 0) {
          this.utilityService.toast('error', data.error || data.message, '')
          return;
        } else {
          this.showLoader = 1;
          this.utilityService.toast('success', 'Ride Cancelled Successfully', '');
          setTimeout(() => {
            this.showLoader = 0;
            setTimeout(function () {
              window.location.reload();
            }, 500);
          }, 2000);

        }
      })
    }
  }

  public rescheduleNow() {
    if (!this.booking.time_hour || !this.booking.date || !this.booking.time_minutes) {
      this.utilityService.alert("error", "Please enter Date and Time");
      return;
    }
    this.booking.time = this.booking.date + ' ' + this.booking.time_hour + ':' + this.booking.time_minutes;

    this.httpService.post(environment.urlC + 'modify_schedule', {
      web_access_token: this.cookieService.get('web_access_token'),
      pickup_id: this.rTrip.pickup_id,
      pickup_time: this.booking.time,
      latitude: this.rTrip.pickup_latitude,
      longitude: this.rTrip.pickup_longitude,
      offset: 330,
      manual_destination_latitude: this.rTrip.manual_destination_latitude,
      manual_destination_longitude: this.rTrip.manual_destination_longitude,
      manual_destination_address: this.rTrip.manual_destination_address,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error || data.flag == 0) {
        this.utilityService.toast('error', data.error || data.message, '');
        return;
      } else {
        $('#add_to_account').modal('hide');
        this.utilityService.toast('success', data.log, '')
        this.initTable();
      }
    })
  }

  public setDate(stamp) {
    var year = new Date(stamp).getFullYear();
    var month = new Date(stamp).getMonth();
    month = month + 1;
    month = (month < 10) ? parseInt("0" + month) : month;

    var day = new Date(stamp).getDate();
    day = (day < 10) ? parseInt("0" + day) : day;
    var dateOfPickup = year + '-' + month + '-' + day;
    this.booking.date = dateOfPickup;
  }

  public setTime = function (stamp) {
    var hours = new Date(stamp).getHours();
    hours = (hours < 10) ? parseInt("0" + hours) : hours;
    this.booking.time_hour = hours;

    var mins = new Date(stamp).getMinutes();
    mins = (mins < 10) ? parseInt("0" + mins) : mins;
    this.booking.time_minutes = mins;
  }

  public rescheduleRide(modalIndex) {
    var tripDetails = this.myTrips[modalIndex];
    this.rTrip = tripDetails;
    this.setDate(this.rTrip.pickup_time);
    this.setTime(this.rTrip.pickup_time);
  }
  public viewDetails(modalIndex) {
    var tripDetails = this.myTrips[modalIndex];
    localStorage.setItem('userTripDetails', JSON.stringify(tripDetails));
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
