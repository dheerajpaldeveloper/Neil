import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss']
})
export class AllUsersComponent implements OnInit {
  searchuser: string;
  hideNext: number;
  Users: any[] = [];
  hideLoadMore: any;
  DisableLoadMore: any;
  otpToAdd: any;
  userToAdd: any;
  userMobileToAdd: any;
  DisableResnd: any;
  userInProcess: any;
  DisonloadCUA: any;
  submitText: any;

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
  captureImage: boolean;
  camConfig: { delay: number; countdown: number; };
  editDoc: boolean;
  totalItems: number;
  otpMode: number;
  attention_required: any;
  doc_id: any;
  type: number;
  docTypes: any;
  minDate: Date = new Date();

  doc: any = {
    expiry_date: new Date(),
    reminder_before: '',
    submitText: 'Add Document'
  };

  searchForm: FormControl = new FormControl();

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
      this.cookieService.delete('access_token')
      this.router.navigate(["/", "corporate_login"]);
    }
    this.captureImage = false;
    this.camConfig = {
      delay: 1,
      countdown: 3,
    };

  }

  ngOnInit(): void {
    $(document).on('show.bs.modal', '.modal', function (event) {
      var zIndex = 1040 + (10 * $('.modal:visible').length);
      $(this).css('z-index', zIndex);
      setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
      }, 0);
    });
    $(document).on('hide.bs.modal', '#show_confirmation', function () {
    });
    $('html, body').animate({ scrollTop: 0 }, 'slow');
    this.initTable(1);

    this.searchForm.valueChanges.pipe(debounceTime(800)).subscribe(() => this.initTable(1));
  }

  public isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode < 48 || charCode > 57)
      return false;
    return true;
  }
  public closePayment() { }

  public onCameraCaptureError(err) { }
  public onCameraCaptureComplete(src) {
    this.doc.capturedImage = src[0];
    this.captureImage = false;
  }
  public onCameraLoad() {
    $('#ng-webcam-counter').css('visibility', 'hidden');
  }
  public takePicture() {
    $('#ng-webcam-counter').css('visibility', 'unset')
    this.doc.capturedImage = undefined;
    // $scope.$broadcast('ngWebcam_capture');
  };
  public cameraOn() {
    // $scope.$broadcast('ngWebcam_on');
  };
  public cameraOff() {
    // $scope.$broadcast('ngWebcam_off');
  };
  public navigateBack() {
    this.doc = {};
    this.captureImage = false;
    this.editDoc = false;
  }
  public editDocument(doc) {
    if (!this.editDoc) {
      this.editDoc = true;
      return;
    }
    // this.addEditDocType(doc, 1);
  }
  public logout() {
    $('.modal').modal('hide');
    this.cookieService.delete('access_token');
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
      // to do
      params.searchFlag = 1;
      params.searchString = this.searchuser;

      this.hideLoadMore = 1;
    } else if ((searchflag == 1) && !this.searchuser) {
      params.offset = 0;
      this.currentPage = 1;
    }
    
    // $('#loading').modal('show');

    this.httpService.post(environment.urlC + 'all_user_list', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;

      if (data.flag == 101) {
      }
      if (data.flag == 807) {
      } else {
        this.totalItems = data.count;
        if ((this.totalItems / 10 + 1) <= this.currentPage) {
          this.hideLoadMore = 1;
        }
        else {
          this.hideLoadMore = 0;
        }
        this.Users = data.all_users;
        // $('#loading').modal('hide');
      }
    })
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
  public loadMore() {
    this.DisableLoadMore = true;
    this.currentPage = this.currentPage + 1;
    this.hideLoadMore = 0;

    if ((this.totalItems / 10 + 1) <= this.currentPage) {
      this.hideLoadMore = 1;
      setTimeout(() => {
        this.DisableLoadMore = false;
      }, 1500)
    }
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);      
        this.loadMoreNow(0);
        setTimeout(() => {
          this.DisableLoadMore = false;
        }, 1500)
      }
    }
  }

  public loadMoreNow(searchflag) {
    const params: any = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: this.skip
    }

    if ((searchflag == 1) && this.searchuser) {
      params.searchFlag = 1;
      params.searchString = this.searchuser;
    }

    $('#loading').modal('show');
    this.httpService.post(environment.urlC + 'all_user_list', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {

      } else {
        this.totalItems = data.count;
        var Users = data.all_users;
        Users.forEach((userData, ind) => {
          this.Users.push(userData);
        });
      }
        $('#loading').modal('hide');
    })

  }

  public typeSelect(a) {
    this.doc.docType = a;
  }

  public openAddUser() {
    window.open('/#/corporate/riderSignup', '_blank');
  };

  public searchForUser() { }

  public addtoAccount(user) {
    this.otpMode = 1;
    this.userInProcess = user;
    this.userToAdd = user.user_id;
    this.userMobileToAdd = user.user_mobile;
    this.otpToAdd = '';
    $('#add_to_account').modal('show');
    user.disableATA = true;
    this.httpService.post(environment.urlC + 'associatedUser_send_otp', {
      web_access_token: this.cookieService.get("web_access_token"),
      mobile: user.user_mobile,
      email: user.user_email,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error) {
        this.utilityService.toast('error', data.error || data.message, '')
        setTimeout(() => {
          user.disableATA = false;
        }, 600);
        $('#add_to_account').modal('hide');
        return;
      }
      else if (data.flag == 0) {
        alert(data.message);
        $('#add_to_account').modal('hide');
        user.disableATA = false;
        return;
      }
      else {
        setTimeout(() => {
          user.disableATA = false;
        }, 600);
        this.utilityService.toast('success', "Enter OTP sent to user's number", '')
      }
    })
  }
  public reAddUser(user) {

    this.otpMode = 1;
    this.userInProcess = user;
    this.userToAdd = user.user_id;
    this.otpToAdd = '';
    this.DisableResnd = true;

    this.httpService.post(environment.urlC + 'associatedUser_resend_otp', {
      web_access_token: this.cookieService.get("web_access_token"),
      mobile: user.user_mobile,
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error || data.flag == 0) {
        this.utilityService.toast('error', data.error || data.message, '')
        setTimeout(() => {
          this.DisableResnd = false;
        }, 2500)
        return;
      } else {
        this.utilityService.toast('success', 'OTP sent again!', '')
        setTimeout(() => {
          this.DisableResnd = false;
        }, 2500)
      }
    })
  }
  public completeUserAdd() {

    if (this.otpToAdd === '' || !this.otpToAdd) {
      this.utilityService.alert('info', 'Please Enter OTP ');
      return false;
    }
    else {
      this.buttonClicked = 1;
      this.DisonloadCUA = true
      this.httpService.post(environment.urlC + 'corporate_add_user', {
        web_access_token: this.cookieService.get('web_access_token'),
        user_id: this.userToAdd,
        role: 0,
        otp: this.otpToAdd,
        mobile: this.userMobileToAdd
      }).subscribe((data) => {
        if (typeof (data) == 'string') data = JSON.parse(data);
        this.buttonClicked = 0;
        if (data.error || data.flag == 0) {
          this.utilityService.toast('error', data.error, '');
          setTimeout(() => {
            this.DisonloadCUA = false
          }, 1500)
          return;
        } else {
          setTimeout(() => {
            this.DisonloadCUA = false
          }, 500)
          this.utilityService.toast('success', 'User Added Successfully', '');
          $('html, body').animate({ scrollTop: 0 }, 'slow');
          $('#add_to_account').modal('hide');
          $('.modal-backdrop.show').fadeOut();
          setTimeout(() => {
            this.router.navigate(["/", "corporate", "myUsers"]);
          }, 300);
          return;
        }
      })
    }


  }
  public autoFillOTP() {
    $('#loading').modal('show');
    this.httpService.post(environment.urlC + 'associated_otp_auto_fill', {
      web_access_token: this.cookieService.get('web_access_token'),
      mobile: this.userMobileToAdd,
    }).subscribe((data) => {
        $('#loading').modal('hide');
      if (typeof (data) == 'string') data = JSON.parse(data);
      this.buttonClicked = 0;
      if (data.error || data.flag == 0) {
        this.utilityService.toast('error', data.error || data.message, '');
        return;
      } else {
        $('#show_confirmation').modal('hide');
        if (data) {
          this.otpToAdd = data.otp;
        }
        else {
          this.otpToAdd = '';
        }
        return;
      }
    })
  }
  public attention_doc_dialog(doc_id, a) {
    this.attention_required = a;
    this.doc_id = doc_id;
    // ngDialog.open({
    //   template: 'attention_doc_dialog',
    //   className: 'ngdialog-theme-default',
    //   showClose: false,
    //   scope: $scope
    // });
  };
  public attentionDoc(docID, flag) {
    this.httpService.post(environment.urlC + 'change_attention_doc', {
      access_token: this.cookieService.get('access_token'),
      doc_id: docID,
      attention_flag: flag
    }).subscribe((data) => {
      if (data.flag == 1309) {
        this.utilityService.toast('success', 'Attention Raised Successfully', '');
        setTimeout(() => {
          // ngDialog.close({
          //   template: 'attention_doc_dialog',
          //   className: 'ngdialog-theme-default',
          //   scope: $scope
          // });
          location.reload();
        }, 2500)
      }
      if (data.flag == 1310) {
        // $rootScope.openToast('success', 'Attention Withdrawn Successfully', '');
        this.utilityService.toast('success', 'Attention Withdrawn Successfully', '');
        setTimeout(() => {
          // ngDialog.close({
          //   template: 'attention_doc_dialog',
          //   className: 'ngdialog-theme-default',
          //   scope: $scope
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
    this.httpService.post(environment.urlC + 'verify_doc', {
      access_token: this.cookieService.get('access_token'),
      doc_id: docID
    }).subscribe((data) => {
      if (data.flag == 1307) {
        this.utilityService.toast('success', 'Document Verified Successfully', '');
        setTimeout(() => {
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
  }

  public processfile(file) {
    if (!(/image/i).test(file.type)) {
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
  public dataURItoBlob = function (dataURI) {
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
  };
  public viewDetails = function (modalIndex) {
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
