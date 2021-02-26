import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';

declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  corpCardEnabled: boolean;
  riderCardEnabled: boolean;

  ridePage: number = 0;
  skip: number = 0;
  currentPage: number = 1;
  buttonClicked: number = 0;

  pop: any = {
    myDate: new Date(),
    isOpen: false,
  };
  Users: Array<any> = [];

  userDetails: any = {};
  driverDetails: any = {};
  driverID: any;
  hideNext: number;
  totalItems: number;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private cookieService: CookieService,
    private utilityService: UtilityService
  ) {
    var driverModel = JSON.parse(localStorage.getItem("corporateModel"));

    if (driverModel) {
      this.userDetails.userName = driverModel.user_name;
      this.userDetails.userImage = driverModel.user_image;
      this.driverID = driverModel.vendor_id;
      this.driverDetails.driver_name = driverModel.driver_name;
      this.driverDetails.driver_image = driverModel.driver_image;
      this.driverDetails.driver_email = driverModel.email;
      this.driverDetails.driver_mobile = driverModel.mobile;
      this.driverDetails.driver_refcode = driverModel.referral_code;
      this.driverDetails.subtype_id = driverModel.subtype_id;
    } else {
      this.cookieService.delete("access_token");
      this.router.navigate(["/", "corporate_login"]);
    }
  }

  ngOnInit(): void {
    $(document).on("show.bs.modal", ".modal", function (event) {
      var zIndex = 1040 + 10 * $(".modal:visible").length;
      $(this).css("z-index", zIndex);
      setTimeout(function () {
        $(".modal-backdrop")
          .not(".modal-stack")
          .css("z-index", zIndex - 1)
          .addClass("modal-stack");
      }, 0);
    });
    this.initTable();
  }

  public logout() {
    $(".modal").modal("hide");
    this.cookieService.delete("access_token");
    this.router.navigate(["/", "corporate_login"]);
  }

  public initTable() {
    this.httpService.post(environment.urlC + 'list_card_payment_option', {
      web_access_token: this.cookieService.get("web_access_token"),
    }).subscribe((data) => {
      if (typeof (data) == 'string') {
        data = JSON.parse(data);
      } else {
        data = data;
      }

      if (data.flag == 101) {
        // this.showCredentialsAlert();
      }

      if (data.payment_type[0].card_used == 1) {
        this.corpCardEnabled = true;
        this.riderCardEnabled = true;
      } else if (data.payment_type[0].card_used == 2) {
        this.corpCardEnabled = true;
        this.riderCardEnabled = false;
      } else if (data.payment_type[0].card_used == 3) {
        this.corpCardEnabled = false;
        this.riderCardEnabled = true;
      }
    })
  }

  public changeRiderSetting(isEnable: boolean) {
    if ((!isEnable) && !this.corpCardEnabled) {
      this.utilityService.alert("info", "You must enable one payment type");
      this.riderCardEnabled = true;
      return;
    } else if ((!isEnable) && this.corpCardEnabled) {
      this.riderCardEnabled = false;
      this.updatePayment(2);
    } else {
      if (this.corpCardEnabled == true) {
        this.updatePayment(1);
      } else {
        this.updatePayment(3);
      }
    }
  }

  public changeCorpSetting(isEnable) {
    if ((!isEnable) && !this.riderCardEnabled) {
      this.corpCardEnabled = true;
      this.utilityService.alert("info", "You must enable one payment type");
      return;
    } else if ((!isEnable) && this.riderCardEnabled) {
      this.corpCardEnabled = false;
      this.updatePayment(3);
    } else {
      if (this.riderCardEnabled == true) {
        this.updatePayment(1);
      } else {
        this.updatePayment(2);
      }
    }
  }

  public updatePayment(card_used) {
    this.httpService.post(environment.urlC + 'edit_corporate_card_payment_option', {
      web_access_token: this.cookieService.get("web_access_token"),
      card_used: card_used
    }).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;

      if (data.flag == 101) {
        // this.showCredentialsAlert();
      }
      $('#loading').modal('show');
      setTimeout(() => {
        $('#loading').modal('hide');
        this.initTable();
      }, 2000);
    });
  }

  public pageChanged(currentPage) {
    this.currentPage = currentPage;
    this.hideNext = 0;
    // if (parseInt(this.totalItems / 10 + 1) <= currentPage) {
    //   this.hideNext = 1;
    // }
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
}
