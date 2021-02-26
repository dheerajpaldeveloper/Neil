import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';
import { SocketioService } from 'src/app/services/socketio/socketio.service';

declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  corporate: any;

  Notifications: any[] = [];

  UnReadNotifications: any[] = [];

  hideLoadMore: number;
  DisableLoadMore: boolean;
  verifymsg: any;
  doc: any;
  type: any;
  myForm: any;
  docName: any;
  docTypes: any[];
  submitText: string;

  ridePage: number = 0;

  showLoader: number = 0
  searchflag: number = 0;
  searchString: string = '';
  skip: number = 0;
  currentPage: number = 1;

  userDetails: any = {};
  driverDetails: any = {};
  driverID: any;
  hideNext: number;
  totalItems: number;
  searchuser: boolean;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private utilityService: UtilityService,
    private cookieService: CookieService,
    private socketService: SocketioService
  ) {

    var driverModel = JSON.parse(localStorage.getItem('corporateModel'));
    if (driverModel) {
      this.userDetails.userName = driverModel.user_name;
      this.userDetails.userImage = driverModel.user_image;
      this.driverID = driverModel.vendor_id;
      this.driverDetails.driver_name = driverModel.driver_name;
      this.driverDetails.driver_image = driverModel.driver_image;
      this.driverDetails.driver_email = driverModel.email;
      this.driverDetails.driver_mobile = driverModel.mobile;
      this.driverDetails.driver_refcode = driverModel.referral_code;
      this.driverDetails.corporate_id = driverModel.corporate_id;
    } else {
      this.cookieService.delete('access_token');
      this.router.navigate(["/", "corporate_login"]);
    }
  }

  ngOnInit(): void {
    // $('#datepicker').datepicker({
    //   uiLibrary: 'bootstrap4'
    // });
    $('.panel-faq').on('show.bs.collapse', function () {
      $(this).addClass('active');
    });

    $('.panel-faq').on('hide.bs.collapse', function () {
      $(this).removeClass('active');
    });
    $('#mydocuploado').click(function () {
      $('#afterbordero').css("cssText", "border:1px solid #1f8dc6!important;");
    });
    $('#mydocupload').click(function () {
      $('#afterborder').css("cssText", "border:1px solid #1f8dc6!important;");
    });

    // $('#date').combodate({
    //   firstItem: 'name',
    // });
    // $('#edate').combodate({
    //   firstItem: 'name',
    // });
    this.initTable();
  }
  addEditDocType(doc, type) { }
  file_to_upload(value) { }
  typeSelect(data) { }
  editDocument(dov) { }

  public logout() {
    $('.modal').modal('hide');
    this.cookieService.delete('access_token');
    this.router.navigate(["/", "corporate_login"]);
  };
  public initNotification() {
    var token = this.cookieService.get('web_access_token');
    // socketFactory.init();
    return;
  }

  // socketListner() {
  //   this.socketService.on('corporateNotification').subscribe((data) => {

  //     this.sockos=data[0].data.paginated_notification;
  //     //$scope.Notifications = $scope.sockos;
  //     this.totalNotifications = data[0].data.count;

  //   });
  // }



  pageChanged(currentPage) {
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

  public initTable() {
    const params: any = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: this.skip
    }

    if ((this.searchflag == 1) && this.searchuser) {

      params.searchFlag = 1;
      params.searchString = this.searchuser;
    }
    this.httpService.post(environment.urlC + 'corporate_notification', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;

      if (data.flag == 101) {
        // this.showCredentialsAlert();
      }
      if (data.flag == 807) {
        // $scope.$apply();
      } else {
        this.totalItems = data.total_corporate_notificatons;

        this.Notifications = data.read_corporate_notificatons;
        this.UnReadNotifications = data.unread_corporate_notificatons;

        var Notification = data.read_corporate_notificatons;
        var UnReadNotifications = data.unread_corporate_notificatons;

        var alert_ids = [];

        UnReadNotifications.forEach((notification) => {
          alert_ids.push(notification.alert_id);

        })
        Notification.forEach((userData, ind) => {
          var u = userData;
          u.subject = u.subject.charAt(0).toUpperCase() + u.subject.slice(1);
          this.Notifications.push(u);
        });
        if ((this.totalItems / 10 + 1) <= this.currentPage) {
          this.hideLoadMore = 1;
          setTimeout(() => {
            this.DisableLoadMore = false;
          }, 2000)
        }
        // $scope.$apply();
        var string = alert_ids.join();

        if (string != '') {

          this.httpService.post(environment.urlC + 'read_corporate_notification', {
            web_access_token: this.cookieService.get("web_access_token"),
            alert_id: string
          }).subscribe((data) => {
            if (typeof (data) == 'string')
              data = JSON.parse(data);
            else data = data;

            if (data.flag == 101) {
              // this.showCredentialsAlert();
            }
            if (data.flag == 807) {
              // $scope.$apply();
            }
          })

        }
      }
    })

  }

  loadData() {
    $('.accordion-toggle').addClass('collapsed');
  };
  // $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
  //   $('.collapse').on('show.bs.collapse', function() {
  //       $('.collapse.in').collapse('hide');
  //       var index = $(this).attr("id");
  //       $scope.arrowKey = true
  //       $cookieStore.put('modalToOpen', index);
  //   });

  // });

  public loadMore() {

    this.currentPage = this.currentPage + 1;

    this.hideLoadMore = 0;
    this.DisableLoadMore = true;

    if ((this.totalItems / 10 + 1) <= this.currentPage) {
      this.hideLoadMore = 1;
      setTimeout(() => {
        this.DisableLoadMore = false;
      }, 2000)
    }
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);

        //$scope.$apply();

        this.loadMoreNow();
      } else {

        setTimeout(() => {
          this.DisableLoadMore = false;
        }, 2000)
      }
    }

  }

  loadMoreNow() {
    var params: any = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: this.skip
    }

    if ((this.searchflag == 1) && this.searchuser) {
      params.searchFlag = 1;
      params.searchString = this.searchuser;
    }

    this.httpService.post(environment.urlC + 'corporate_notification', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
      } else {
        this.totalItems = data.total_corporate_notificatons;
        var alert_ids = [];
        var Notification = data.read_corporate_notificatons;
        var UnReadNotifications = data.unread_corporate_notificatons;

        UnReadNotifications.forEach((userData, ind) => {
          var u = userData;
          u.subject = u.subject.charAt(0).toUpperCase() + u.subject.slice(1);

          this.UnReadNotifications.push(u);
          alert_ids.push(userData.alert_id);
        });
        Notification.forEach((userData, ind) => {
          var u = userData;
          u.subject = u.subject.charAt(0).toUpperCase() + u.subject.slice(1);
          this.Notifications.push(u);
        });

        // $scope.$apply();

        var string = alert_ids.join();

        if (string != '') {
          this.httpService.post(environment.urlC + 'read_corporate_notification', {
            web_access_token: localStorage.getItem("web_access_token"),
            alert_id: string
          }).subscribe((data) => {
            if (typeof (data) == 'string')
              data = JSON.parse(data);
            else data = data;

            if (data.flag == 101) {
              // this.showCredentialsAlert();
            }
            if (data.flag == 807) {

              // $scope.$apply();
            } else {

            }
          })

        }

      }
    })


  }
}
