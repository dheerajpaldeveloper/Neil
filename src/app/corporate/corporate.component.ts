import { environment } from 'src/environments/environment';
import { HttpService } from './../services/http/http.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SocketioService } from '../services/socketio/socketio.service';
import { UtilityService } from '../core/services/utility/utility.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
declare const jQuery: any;
const $: any = jQuery;

declare const google: any;


@Component({
  selector: 'app-corporate',
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.scss']
})
export class CorporateComponent implements OnInit, AfterViewInit {

  files: any[] = [];
  editMode: number = 0;
  user_image = '';
  isTrackingPage: boolean = true;

  loading: boolean = false;
  profile: any = {};
  // profile = $scope.driverDetail;
  pop: any = {};

  totalNotifications: number = 0;
  driverDetails: any = {}
  usernewimage: any;
  sockos: any;
  drivers: any[];

 showRideButton: boolean = false;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private httpService: HttpService,
    private socketService: SocketioService,
    public utilityService: UtilityService
  ) { }

  ngAfterViewInit(): void {
    $(document).on(
      'touchmove',
      (e) => {
        if ($(".notfMenuMobile").hasClass("open"))
          $(".notfMenuMobile").toggleClass("open");
      }
    );
    if ($(window).width() < 800) {
      $('#subMenu ul').on('click', () => {
        $(".subMenu ul.nav div").css("transform", "rotateX(-88deg)");
      });
      $('li a').on('click', () => {
        $(".subMenu ul.nav div").css("transform", "rotateX(0deg)");
      });
      window.addEventListener('click', (e: any) => {

        if (document.getElementById('navMenu').contains(e.target)) {
        } else {
          $(".subMenu ul.nav div").css("transform", "rotateX(-88deg)");
        }
      })
    }
    $('body').removeClass('login-page');

    $(document).ready(() => {
      "use strict";
      /* Header*/
      $('.head__menu').on('click', () => {
        $(this).toggleClass('header__menu--active');
        $('.head__nav').toggleClass('header__utilityServicev--active');

      });

      $(document).on('click', '.head__open', () => {
        var status = $('.head__menu').hasClass('header__nav--active');
        console.log(status);
        if (status != true) {
          $('.head__nav').removeClass('header__nav--active');
          $('#clickhead').removeClass('header__menu--active');
        }
        else {
          $('.head__nav').addClass('head__nav');
          $('#clickhead').addClass('header__menu');
        }
      });
    });

    $('#selectpdpimage').change((e) => {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        var fileName = e.target.files[0].name;
        reader.onload = function (e) {
          $('#editdpimage').attr('src', e.target.result);
          /*$('#editfilename').html(fileName);*/
        }
        reader.readAsDataURL(this.files[0]);
      }
    });

    $('img').on('dragstart', (event) => {
      event.preventDefault();
    });

    $('.menuItems').click(() => {
      $('.menuItems').removeClass("active");
      $(this).addClass("active");
    });

  }

  ngOnInit(): void {
    this.initNotification();
    this.locationPicker();
    this.initMenu();

    const access_token = this.cookieService.get('access_token');
    if (access_token === undefined) {
      this.showCredentialsAlert();
    }

    var driverModel = JSON.parse(localStorage.getItem('corporateModel'));
    // JSON.parse(localStorage.getItem('driverdata')) ||
    if (driverModel) {
      this.driverDetails = driverModel;
    } else {
      this.cookieService.delete('access_token');
      this.router.navigate["corporate_login"];
    }

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (event.url == '/corporate/live-tracking') {
        this.isTrackingPage = true;
      } else {
        this.isTrackingPage = false;
      }
    })
    this.drivers = [{
      name: this.driverDetails ? this.driverDetails.first_name : ''
    }]

    this.utilityService.newRideButtonChanges.subscribe((value) => {
      this.showRideButton = value;
    })
  }

  public showCredentialsAlert() {
    $('#alertCredModal').show();
  };

  public logoutConfirm() {
    $('#confirmLogout').show();
  };

  public notifyMe(): void { }//TODO:

  public initMenu() {
    $('.menuItems').on('click', () => {
      $('.menuItems').removeClass('active');
      $(this).addClass('active');
    });

    // if ($location.path().match('schedule')) {
    //   $('.menuItems').removeClass('active');
    //   $('.schedule').addClass('active');
    // }
    // if ($location.path().match('documents')) {
    //   $('.menuItems').removeClass('active');
    //   $('.documents').addClass('active');
    // }
    // if ($location.path().match('driver_profile')) {
    //   $('.menuItems').removeClass('active');
    // }
  };

  public dontDiscard(): void { }//TODO:

  public discard(): void { }//TODO:

  public logoutClose() {
    this.logout();
  }

  public logout() {
    localStorage.removeItem('driverdata');
    localStorage.removeItem('corporateModel');
    $('.modal').hide();
    const prms = { web_access_token: this.cookieService.get('access_token') };
    this.httpService.post(environment.urlC + 'logout', prms)
      .subscribe((data) => {
        this.cookieService.delete('access_token');
        this.cookieService.delete('web_access_token');
        this.router.navigate(['/', 'corporate_login']);
      });
    /**/
  };

  public closeDropDown() {
    $(".sub").css("transform", "rotateX(-88deg)");
  }

  public initNotificationListener() {
    document.addEventListener('DOMContentLoaded', () => {
      if (!Notification) {
        this.utilityService.alert('info', 'Desktop notifications not available in your browser. Try Chromium.');
        return;
      }

      if (Notification.permission !== "granted")
        Notification.requestPermission();
    });


    Notification.requestPermission()
      .then(function (permission) {

      });
  }

  public initNotification() {
    var token = this.cookieService.get('web_access_token');
    this.socketService.connect();
    this.socketService.emit('auth', { session_id: 0, user_type: 'corporate', access_token: token });
    this.socketService.on('auth').subscribe((data) => {
      if (data.flag == true) {

        this.socketService.emit('corporateNotification', { corporate_id: this.driverDetails.corporate_id });
        setInterval(() => {
          this.socketService.emit('corporateNotification', { corporate_id: this.driverDetails.corporate_id });
        }, 10000);

        this.socketService.on('corporateNotification').subscribe((data) => {
          this.sockos = data.data.paginated_notification;
          this.totalNotifications = data.data.count;
        });
      } else {
        setTimeout(() => {
         location.reload();
        }, 2000);
        // this.logout();
      }
    });
  }

  public closeEdit() {
    this.editMode = 0;
  }

  public locationPicker() {

    var autocomplete = {};
    var autocompletesWraps = ['base_location'];

    var test_form = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };
    var test2_form = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };

    $.each(autocompletesWraps, (index, name) => {
      if ($('#' + name).length == 0) {
        return;
      }
      autocomplete[name] = new google.maps.places.Autocomplete($('#' + name + '.autocomplete')[0],);
      google.maps.event.addListener(autocomplete[name], 'place_changed', () => {

        var place = autocomplete[name].getPlace();
        if (!place.geometry) {
          alert('Something Went Wrong!!');
          return;
        }
        if (name == 'base_location') {
          var latitude = place.geometry.location.lat();
          var longitude = place.geometry.location.lng();
          this.pop = {
            latitude: latitude,
            longitude: longitude
          }
          this.pop.address = place.formatted_address;
        }
      });
    });
  }

  public editProfile() {
    this.editMode = 1;
    $('#editProfile').modal('show');
    this.profile = JSON.parse(localStorage.getItem('corporateModel'));

    if (!this.profile.is_approved) {

      this.pop.address = this.profile.address;
      this.pop.city = this.profile.city;
      this.pop.state = this.profile.state;
      this.pop.zipcode = this.profile.zipcode;
      this.pop.latitude = this.profile.latitude;
      this.pop.longitude = this.profile.longitude;
    } else {
      this.pop = this.profile;
    }
  };

  public file_to_upload = function (files, id) {
    if (id == 1) { //driver image
      this.user_image = files[0];
      this.pop.user_image_sent = 1;
      // this.pop.user_image_name = files[0].name;
      var file = files[0];
      var imageType = /image.*/;
      if (!file.type.match(imageType)) {
      }
    }
  };

  public submitDetails() {
    var formData = new FormData();
    $('#loading').modal('show');

    formData.append('web_access_token', this.cookieService.get('access_token'));

    var driverModel = JSON.parse(localStorage.getItem('corporateModel'));

    this.httpService.post(environment.urlC + 'edit_profile', {
      web_access_token: localStorage.getItem('access_token'),
      address: this.pop.address,
      city: this.pop.city,
      state: this.pop.state,
      zipcode: this.pop.zipcode,
      latitude: this.pop.latitude,
      longitude: this.pop.longitude,

    }).subscribe((data) => {

      console.log("dataaaa", data);
      if (typeof (data) == 'string') data = JSON.parse(data);

      if (data.flag == 101) {
        this.showCredentialsAlert();
      } else if (data.error || data.flag == 0) {

        $('#loading').modal('hide');
        this.utilityService.alert('error',data.error || data.message);
        return;
      } else {
        var driverModel = JSON.parse(localStorage.getItem('corporateModel'));

        driverModel.zipcode = this.pop.zipcode;
        driverModel.city = this.pop.city;
        driverModel.state = this.pop.state;
        driverModel.address = this.pop.address;
        driverModel.latitude = this.pop.latitude;
        driverModel.longitude = this.pop.longitude;

        localStorage.setItem('corporateModel', JSON.stringify(driverModel));

        this.editMode = 0;
        this.utilityService.toast('success', 'Profile Updated successfully', '');
        $('#loading').modal('hide');

        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    }, (error) => {
      this.utilityService.alert('error', 'Something went Wrong!');
    })
  };

  onNewRide() {
    this.utilityService.showNewRideButton(false);
  }

}



