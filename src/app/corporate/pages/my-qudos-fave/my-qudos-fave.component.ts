import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';

declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: 'app-my-qudos-fave',
  templateUrl: './my-qudos-fave.component.html',
  styleUrls: ['./my-qudos-fave.component.scss']
})
export class MyQudosFaveComponent implements OnInit {
  Users: any[] = [];
  currentPage: number = 1;
  skip: number = 0;
  ridePage: number = 0;
  myTrips: any[] = [];
  userDetails: any = {};
  driverDetails: any = {};
  hideNext: number;
  totalItems: number;
  DisableLoadMore: boolean;
  hideLoadMore: number;
  searchuser: any;
  toBeDeleted: any;
  driver_toDelete: any;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private utilityService: UtilityService,
    private cookieService: CookieService
  ) {
    if (!this.cookieService.get('web_access_token')) {
      window.location.href = 'http://ridequdos.com/driverlogin.html';
    }
    if (!this.cookieService.get('web_access_token')) {
      this.router.navigate(["/", "corporate_login"]);
    }
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
    $(document.body).on('show.bs.collapse', '.panel-collapse', function () {
      $('.display').show();
    });
    $(document.body).on('hide.bs.collapse', '.panel-collapse', function () {
      $('.display').hide();
    });

    $('.tripsbtn').not('.active-page').on('mouseover touchstart', function () {
      $(this).find('img').attr('src', $(this).data('hover'));
    });
    $('.tripsbtn').not('.active-page').on('mouseout touchend', function () {
      $(this).find('img').attr('src', $(this).data('unhover'));
    })
    this.initTable(0);
  }
  public logout() {
    $('.modal').modal('hide');
    this.cookieService.delete('web_access_token');
    this.router.navigate(["/", "corporate_login"]);
  };
  // $scope.status = {
  //   isCustomHeaderOpen: false
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
    // this.initTable();
    this.initTable(0);

  };
  public initTable(searchflag) {
    this.Users = null;
    var params = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: this.skip,
      searchFlag: 0,
      searchString: ''
    }

    if ((searchflag == 1) && this.searchuser) {
      this.currentPage = 1;
      this.hideLoadMore = 1;
      params.offset = 0;
      params.searchFlag = 1;
      params.searchString = this.searchuser;
    } else if ((searchflag == 1) && !this.searchuser) {
      params.offset = 0;
      this.currentPage = 1;
    }

    this.httpService.post(environment.urlC + 'get_fav_driver', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
      } else {
        this.totalItems = data.count;
        if ((this.totalItems / 10 + 1) <= this.currentPage) {
          this.hideLoadMore = 1;
        } else {
          this.hideLoadMore = 0;
        }
        this.Users = data.drivers;
        // $scope.$apply();
      }
    })
  }
  // $scope.initTable();
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
        // this.loadMoreNow();
        this.loadMoreNow(0);
      }
    }
  }
  public loadMoreNow(searchflag) {
    var params = {
      web_access_token: this.cookieService.delete("web_access_token"),
      limit: 10,
      offset: this.skip
    }
    if (this.searchuser) {
      // params.searchFlag = 1;
      // params.searchString = this.searchuser;
    }
    this.httpService.post(environment.urlC + 'get_fav_driver', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
      } else {
        this.totalItems = data.count;
        var Users = data.drivers;
        Users.forEach((userData, ind) => {
          this.Users.push(userData);
        });
      }
    })

  }
  // $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
  //   $('.collapse').on('show.bs.collapse', function () {
  //     $('.collapse.in').collapse('hide');
  //     var index = $(this).attr("id");
  //     $scope.arrowKey = true
  //     $cookieStore.put('modalToOpen', index);
  //   });
  // });

  public deleteUser(user) {
    this.toBeDeleted = user.driver_name;
    this.driver_toDelete = user.driver_id;
  }
  public deleteUserConfirmed(driver_id) {
    $('#loading').modal('show');
    this.httpService.post(environment.urlC + 'remove_fav_driver', {
      web_access_token: this.cookieService.get('web_access_token'),
      driver_id: driver_id
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error || data.flag == 0) {
        $('#loading').modal('hide');
        alert(data.error || data.message);
        return;
      } else {
        this.initTable(0);
        this.utilityService.toast('success', 'Driver Removed Successfully', '')
        setTimeout(() => {
          $('html, body').animate({ scrollTop: 0 }, 'slow');
          $('#loading').modal('hide');
          // location.reload();
        }, 20);
      }

    })
  }

  public openAddUser() {
    window.open(environment.vendorBaseURL + 'driverlogin.html', '_blank');
  };

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
