import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';

declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: "app-bank-details",
  templateUrl: "./bank-details.component.html",
  styleUrls: ["./bank-details.component.scss"],
})
export class BankDetailsComponent implements OnInit {
  loading: boolean;

  ridePage: number = 0;
  skip: number = 0;
  currentPage: number = 1;
  buttonClicked: number = 0;
  accountType: any = 1;

  bregion: string = "New York";
  region: string = "New York";

  pop: any = {
    myDate: new Date(),
    isOpen: false
  };
  Users: any;
  // Users: Array<any> = [];
  // userDetails:Array<any> = [];
  // driverDetails:Array<any> = [];
  userDetails: any = {};
  driverDetails: any = {};
  hideNext: number;
  totalItems: number;
  postal: any;
  front_doc_file: any;
  front_doc_file_name: any;
  back_doc_file: any;
  back_doc_file_name: any;
  doc_file_name: Blob;
  doc_file_nameB: Blob;
  term_checked: any;
  errormsg: string;
  commanError: any = {
    $error: {
      required: false
    },
    $touched: false,
  };
  validationError: any = {
    $error: {
      required: false
    },
    $touched: false,
    minlength: 0
  };
  AddAccount: any = {
    $invalid: false,
    ssn_num: this.validationError,
    dob_user: this.commanError,
    s_address: this.commanError,
    locality_user: this.commanError,
    postal_user: this.validationError,
    Bussiness_Name: this.commanError,
    MobNum: this.validationError,
    tax_id: this.validationError,
    bussiness_Web: this.validationError,
    saddress: this.commanError,
    city: this.commanError,
    country: this.commanError,
    postalc: this.validationError,
    acc: this.commanError,
    routing_Num: this.commanError,
  };
  fname: string | Blob;
  lname: string | Blob;
  Email: string | Blob;
  Phone: string | Blob;
  dob: string | Blob;
  ssn: string | Blob;
  address: string | Blob;
  locality: string | Blob;
  bussinessWeb: string | Blob;
  Mob: string | Blob;
  BussinessName: string | Blob;
  taxid: string | Blob;
  saddress: string | Blob;
  city: string | Blob;
  postalc: string | Blob;
  country: string | Blob;
  accNumber: string | Blob;
  routingNum: string | Blob;

  cardAlert: boolean;
  mydocuploado1: any;
  myCheckbox: any;

  constructor(
    private router: Router,
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
      this.driverDetails.corporate_id = driverModel.corporate_id;
    }
    else {
      this.cookieService.delete('web_access_token');
      this.router.navigate(["/", "corporate_login"]);
    }
  }
  ngOnInit(): void {
    this.driverDetails = {
      subtype_id: 1,
    };
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

    // $("#dob_user").combodate({
    //   firstItem: "name",
    //   minYear: 1930,
    //   maxYear: 2000,
    // });

    this.initTable()
  }
  public closeCard() { }
  public isNumberKey(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    //console.log(charCode);

    if (charCode == 43) return true;

    if (charCode < 48 || charCode > 57) return false;

    return true;
  }
  public isNumberKeys(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    //console.log(charCode);

    if (charCode < 48 || charCode > 57) return false;

    return true;
  }
  public logout() {
    $('.modal').modal('hide');
    this.cookieService.delete('access_token');
    this.router.navigate(["/", "corporate_login"]);
  };

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

  // public initCard() {
  //   var stripe = Stripe(MY_CONSTANT.stripeKey);
  //   var elements = stripe.elements();
  //   var style = {
  //     base: {
  //       // Add your base input styles here. For example:
  //       fontSize: '16px',
  //       color: "#32325d",
  //     }
  //   };
  //   // Create an instance of the card Element.
  //   var card = elements.create('card', { style: style });

  //   // Add an instance of the card Element into the `card-element` <div>.
  //   card.mount('#card-element');
  //   card.addEventListener('change', function (event) {
  //     var displayError = document.getElementById('card-errors');
  //     if (event.error) {
  //       displayError.textContent = event.error.message;
  //     } else {
  //       displayError.textContent = '';
  //     }
  //   });

  //   var form = document.getElementById('payment-form');
  //   form.addEventListener('submit', function (event) {
  //     event.preventDefault();

  //     stripe.createToken(card).then(function (result) {
  //       if (result.error) {
  //         this.buttonClicked = 0;
  //         // Inform the customer that there was an error.
  //         var errorElement = document.getElementById('card-errors');
  //         errorElement.textContent = result.error.message;
  //       } else {
  //         // Send the token to your server.
  //         this.stripeTokenHandler(result.token);
  //       }
  //     });
  //   });


  // }

  public trimZip() {
    this.postal = this.postal.slice(0, 6);
  }

  public stripeTokenHandler(token) {
    if (this.buttonClicked === 1) {
      // $rootScope.openToast('error', 'Please Wait while we complete the request for you!', '');
      this.utilityService.toast('error', 'Please Wait while we complete the request for you!', '')
      return false;
    } else {
      this.buttonClicked = 1;
      this.httpService.post(environment.urlC + 'add_credit_card', {
        web_access_token: this.cookieService.get("web_access_token"),
        nounce: token.id,
        card_type: 52
      }).subscribe((data) => {
        setTimeout(function () {
          this.buttonClicked = 0;
        }, 3000);
        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;

        if (data.error) {
          // $rootScope.openToast('error', data.error, '');
          this.utilityService.toast('error', data.error, '')
          return;
        } else {
          // $rootScope.openToast('success', 'Card Added Successfully', '');
          this.utilityService.toast('success', 'Card Added Successfully', '')
          $('#add_to_account').modal('hide');
          this.initTable();
        }
      })

    }

  }

  public initTable() {
    this.Users = [];
    this.httpService.post(environment.urlC + 'view_sub_merchant_account_details', {
      web_access_token: this.cookieService.get("web_access_token"),
    }).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;
      this.Users = data.account_details;
      console.log("userssssss", this.Users)
      // $scope.$apply();
    })
  }

  // $scope.initTable();

  public setDefaultCard(card_id) {
    if (card_id) {
      this.httpService.post(environment.urlC + 'change_default_card', {
        web_access_token: this.cookieService.get("web_access_token"),
        card_id: card_id
      }).subscribe((data) => {
        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;
        if (data.error) {
          // $rootScope.openToast('error', data.error, '');
          this.utilityService.toast('error', data.error, '');
          return;
        } else {
          // $rootScope.openToast('success', 'Default card updated', '');
          this.utilityService.toast('success', 'Default card updated', '');
          this.initTable();
        }
      })
    }
  }

  public file_to_upload(files) {
    this.processfile(files[0]);
    this.front_doc_file = files[0];
    this.front_doc_file_name = files[0].name;
    // $scope.$apply();
  }
  public file_to_uploadB(files) {
    this.processfile(files[0]);
    this.back_doc_file = files[0];
    this.back_doc_file_name = files[0].name;
    // $scope.$apply();
  }

  public processfile(file) {

    if (!(/image/i).test(file.type)) {
      // $rootScope.openToast('error', "File " + file.name + " is not an image.", '');
      this.utilityService.toast('error', "File " + file.name + " is not an image.", '');
      return false;
    }

    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (event) => {
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); // and get it's URL

      // helper Image object
      var image = new Image();
      image.src = blobURL;
      //preview.appendChild(image); // preview commented out, I am using the canvas instead
      image.onload = () => {
        // have to wait till it's loaded
        var resized = this.resizeMe(image); // send it to canvas
        this.dataURItoBlob(resized);
      }
    };
  }

  public resizeMe(img) {

    var canvas = document.createElement('canvas');
    var width = img.width;
    var height = img.height;
    var max_width = 1024;
    var max_height = 720;
    // calculate the width and height, constraining the proportions
    if (width > height) {
      if (width > max_width) {
        //height *= max_width / width;
        height = Math.round(height *= max_width / width);
        width = max_width;
      }
    } else {
      if (height > max_height) {
        //width *= max_height / height;
        width = Math.round(width *= max_height / height);
        height = max_height;
      }
    }

    // resize the canvas and draw the image data into it
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // preview.appendChild(canvas); // do the actual resized preview

    return canvas.toDataURL("image/jpeg", 0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)

  }
  public dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {
      type: 'image/jpeg'
    });
    this.doc_file_name = blob;
    this.doc_file_nameB = blob;
    // $scope.$apply();
  };

  public someFunction(myCheckbox) {
    if (myCheckbox == true) {
      this.term_checked = myCheckbox;
    }
    else {
      this.errormsg = "Please select checkbox"
    }
  }
  // $scope.fname = newdriverModel.first_name
  //  $scope.lname = newdriverModel.last_name
  //  $scope.Email = newdriverModel.email
  //  $scope.Phone = newdriverModel.mobile
  public sendBankDetails(formCheck) {

    this.AddAccount.$invalid = true;
    this.loading = true;
    if (!formCheck) {
      var form = new FormData();
      form.append('personalInfo_firstName', this.fname);
      form.append('personalInfo_lastName', this.lname);
      form.append('personalInfo_email', this.Email);
      form.append('personalInfo_phone', this.Phone);
      form.append('personalInfo_dateOfBirth', (this.dob));
      form.append('personalInfo_ssn', this.ssn);
      form.append('personalInfo_address_streetAddress', this.address);
      form.append('personalInfo_address_locality', this.locality);
      form.append('personalInfo_address_region', this.region);
      form.append('personalInfo_address_postalCode', this.postal);
      form.append('business_type', this.accountType);
      form.append('business_businessUrl', this.bussinessWeb);
      form.append('business_phoneNumber', this.Mob);
      form.append('business_name', this.BussinessName);
      form.append('business_taxId', this.taxid);
      form.append('business_address_streetAddress', this.saddress);
      form.append('business_address_locality', this.city);
      form.append('business_address_region', this.bregion);
      form.append('business_address_postalCode', this.postalc);
      form.append('business_address_country', this.country);
      form.append('front_document', this.front_doc_file ? this.front_doc_file : '');
      form.append('back_document', this.back_doc_file ? this.back_doc_file : '');
      form.append('accountDetails_accountNumber', this.accNumber);
      form.append('accountDetails_routingNumber', this.routingNum);
      form.append('web_access_token', this.cookieService.get("web_access_token"));
      form.append('tos_accepted', this.term_checked);

      // send headers
      // headers: {
      //   'Content-Type': undefined
      // }
      this.httpService.post(environment.urlC + 'add_sub_merchant_account', form).subscribe((data) => {
        data = data == 'string' ? data = JSON.parse(data).data : data.data;
        this.AddAccount.$invalid = false;
        if (data.error) {
          setTimeout(() => {
            this.AddAccount.$invalid = false;
          }, 2000)
          this.loading = false;
          // $scope.openToast('error', data.error, '');
          this.utilityService.toast('error', data.error, '');
          return;
        }
        else if (data.flag == 3111)
          // $scope.openToast('success', 'Account is Created Successfully', '');
          this.utilityService.toast('success', 'Account is Created Successfully', '');
        this.loading = false;
        this.AddAccount.$invalid = false;
        $('#add_to_account').modal('hide');
        // $scope.initTable();
        $('.modal-backdrop.show').fadeOut();
        $('#loading').modal('hide');
      })
    } else {
      // $scope.openToast("error", 'Invalid details', "ERROR");
      this.utilityService.toast("error", 'Invalid details', "ERROR");
      this.loading = false;
      setTimeout(() => {
        this.AddAccount.$invalid = false;
      }, 2000)
    }
  }

}
