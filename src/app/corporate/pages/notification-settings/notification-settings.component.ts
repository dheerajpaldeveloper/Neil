import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';

declare const Stripe;
declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  Users: any[];
  notification: any = {};
  ridePage: number = 0;
  skip: number = 0;
  currentPage: number = 1;
  buttonClicked: number = 0;

  pop: any = {
    myDate: new Date(),
    isOpen: false
  };

  userDetails: any = {};
  driverDetails: any = {};
  driverID: any;
  hideNext: number;
  totalItems: number;
  docs: any;
  doc: any;
  cardAlert: number;
  showLoader: number;
  attention_required: any;
  doc_id: any;
  type: number;
  editDoc: any;
  docTypes: any;
  myTrips: any;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private cookieService: CookieService,
    private utilityService: UtilityService
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
    } else {
      this.cookieService.delete('access_token');
      this.router.navigate(["/", "corporate_login"]);
    }

  }

  ngOnInit(): void {
    $(document).on('show.bs.modal', '.modal', function (event) {
      var zIndex = 1040 + (10 * $('.modal:visible').length);
      $(this).css('z-index', zIndex);
      setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
      }, 0);
    });
    this.initTable();
  }
  doNothing() { }

  saveNumber() { }

  public logout() {
    $('.modal').modal('hide');
    localStorage.removeItem('access_token');
    this.router.navigate(["/", "corporate_login"]);
  };

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

  public initCard() {

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
    var card = elements.create('card', { style: style });

    // Add an instance of the card Element into the `card-element` <div>.
    card.mount('#card-element');

    card.addEventListener('change', (event) => {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    var form = document.getElementById('payment-form');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      stripe.createToken(card).then((result) => {
        if (result.error) {
          this.buttonClicked = 0;
          // Inform the customer that there was an error.
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // Send the token to your server.
          this.stripeTokenHandler(result.token);
        }
      });
    });

  }

  public stripeTokenHandler(token) {
    if (this.buttonClicked === 1) {
      this.utilityService.toast('error', 'Please Wait while we complete the request for you!', '');
      return false;
    } else {
      this.buttonClicked = 1;
      this.httpService.post(environment.urlC + 'add_credit_card', {
        web_access_token: this.cookieService.get("web_access_token"),
        nounce: token.id,
        card_type: 52
      }).subscribe((data) => {
        setTimeout(() => {
          this.buttonClicked = 0;
        }, 3000);
        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;

        if (data.error) {
          this.utilityService.toast('error', data.error, '')
          return;
        } else {
          this.utilityService.toast('success', 'Card Added Successfully', '')
          $('#add_to_account').modal('hide');
          this.initTable();
        }
      })

    }
  }

  public initTable() {
    this.Users = [];
    return;

    this.httpService.post(environment.urlC + 'list_credit_cards', {
      web_access_token: this.cookieService.get("web_access_token"),
    }).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;
      if (data.flag == 101) {
        // this.showCredentialsAlert();
      }
      if (data.flag == 807) {
        this.totalItems = data.resultData.length;
        this.docs = data.driver_docs;
      } else {
        this.totalItems = data.count;
        this.Users = data.list_credit_cards;
      }
    })
  }


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
          this.utilityService.toast('error', data.error, '');
          return;
        } else {
          this.utilityService.toast('success', 'Default card updated', '');
          this.initTable();
        }
      })
    }
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

  // $scope.minDate=new Date();

  public typeSelect(a) {
    this.doc.docType = a;
  }
  public openAddUser() {
    window.open(environment.vendorBaseURL + 'riderlogin.html', '_blank');
  };
  // $scope.doc = {};

  // $scope.doc.expiry_date = new Date();
  // $scope.doc.reminder_before = '';
  // $scope.submitText = 'Add Document';

  public showCardAlert() {
    $('#show_cardError').modal('show');
    this.cardAlert = 1;
  }

  public closeCard() {
    this.showLoader = 0;
    $('#show_cardError').modal('hide');
  }

  public deleteCard(user) {
    this.utilityService.confirm('delete this Card?').then((result) => {
      if (result.value) {
        if (user.id) {
          this.httpService.post(environment.urlC + 'delete_card', {
            web_access_token: this.cookieService.get('web_access_token'),
            card_id: user.id
          }).subscribe((data) => {
            if (typeof (data) == 'string') data = JSON.parse(data);
            if (data.flag == 304) {
              this.showCardAlert();
              this.showLoader = 0;
            } else if (data.error || data.flag == 0) {
              // $rootScope.openToast('error', data.error || data.message, '');
              this.utilityService.toast('error', data.error || data.message, '')
              return;
            } else {
              // $rootScope.openToast('success', 'Card Removed Successfully', '');
              this.utilityService.toast('success', 'Card Removed Successfully', '')
              this.initTable();
            }
          })
        }
      }

    })
  }

  public attention_doc_dialog(doc_id, a) {
    this.attention_required = a;
    this.doc_id = doc_id;
    // ngDialog.open({
    //     template: 'attention_doc_dialog',
    //     className: 'ngdialog-theme-default',
    //     showClose: false,
    //     scope: $scope
    // });
  };

  public attentionDoc(docID, flag) {
    this.httpService.post(environment.urlC + '/change_attention_doc', {
      access_token: this.cookieService.get('access_token'),
      doc_id: docID,
      attention_flag: flag
    }).subscribe((data) => {
      if (data.flag == 1309) {
        // $rootScope.openToast('success', 'Attention Raised Successfully', '');
        this.utilityService.toast('success', 'Attention Raised Successfully', '')
        setTimeout(() => {
          // ngDialog.close({
          //     template: 'attention_doc_dialog',
          //     className: 'ngdialog-theme-default',
          //     scope: $scope
          // });
          location.reload();
        }, 2500)
      }
      if (data.flag == 1310) {
        // $rootScope.openToast('success', 'Attention Withdrawn Successfully', '');
        this.utilityService.toast('success', 'Attention Withdrawn Successfully', '');
        setTimeout(() => {
          // ngDialog.close({
          //     template: 'attention_doc_dialog',
          //     className: 'ngdialog-theme-default',
          //     scope: $scope
          // });
          location.reload();
        }, 2500)
      }
    })
  }

  public verify_doc_dialog(doc_id) {
    this.doc_id = doc_id;
    // ngDialog.open({
    //     template: 'verify_doc_dialog',
    //     className: 'ngdialog-theme-default',
    //     showClose: false,
    //     scope: $scope
    // });
  };

  public verify(docID) {
    this.httpService.post(environment.urlC + '/verify_doc', {
      access_token: this.cookieService.get('access_token'),
      doc_id: docID
    }).subscribe((data) => {
      if (data.flag == 1307) {
        // $rootScope.openToast('success', 'Document Verified Successfully', '');
        this.utilityService.toast('success', 'Document Verified Successfully', '');

        setInterval(() => {
          // ngDialog.close({
          //   template: 'verify_doc_dialog',
          //   className: 'ngdialog-theme-default',
          //   scope: $scope
          // });
          location.reload();
        }, 2500)
      }
    })
  }
  public addDocDialog() {
    this.type = 0;
    // $scope.$apply();
  };

  public viewDocDialog(doc, edit) {
    this.editDoc = edit;
    this.doc.expiry_date = new Date(doc.expiry_date);
    this.doc.reminder_before = doc.reminder_before;
    this.doc.document_url = doc.document_url;
    this.doc.doc_id = doc.doc_id;
    this.doc.docType = this.docTypes.find(function (docType) {
      return docType.document_type_id == doc.document_type_id
    })
  };

  public file_to_upload(files) {
    this.processfile(files[0]);
    this.doc.doc_file_name = files[0].name;
    // $scope.$apply();
  }

  public processfile(file) {

    if (!(/image/i).test(file.type)) {
      // $rootScope.openToast('error', "File " + file.name + " is not an image.", '');
      this.utilityService.toast('error', "File " + file.name + " is not an image.", '')
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
    this.doc.doc_file = blob;
    // $scope.$apply();
  };

  public viewDetails(modalIndex) {
    var tripDetails = this.myTrips[modalIndex];
    localStorage.setItem('userTripDetails', JSON.stringify(tripDetails));
    // $state.go("corporate.rideDetails");
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
