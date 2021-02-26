import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import { CookieService } from 'ngx-cookie-service';

declare const jQuery: any;
const $: any = jQuery;
@Component({
  selector: 'app-qudosfave',
  templateUrl: './qudosfave.component.html',
  styleUrls: ['./qudosfave.component.scss']
})
export class QudosfaveComponent implements OnInit {
  Users: any[] = [];
  hideLoadMore: number;
  DisableLoadMore: boolean;
  toBeAdded: any;
  driver_toAdd: any;
  searchuser: any;
  hideNext: number;

  ridePage: number = 0;
  skip: number = 0;
  currentPage: number = 1;


  pop: any = {
    myDate: new Date(),
    isOpen: false
  };

  userDetails: any = {};
  driverDetails: any = {};
  driverID: any;
  captureImage: boolean;
  camConfig: { delay: number; countdown: number; };
  doc: any;
  editDoc: boolean;
  totalItems: number;
  userInProcess: any;
  attention_required: any;
  doc_id: any;
  type: number;
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
    this.captureImage = false;
    this.camConfig = {
      delay: 1,
      countdown: 3,
    };
  }

  ngOnInit(): void {
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
    $('.panel-faq').on('show.bs.collapse', function () {
      $(this).addClass('active');
    });
    // $('#datepicker').datepicker({
    //   uiLibrary: 'bootstrap4'
    // });
    $('.panel-faq').on('hide.bs.collapse', function () {
      $(this).removeClass('active');
    });
    this.initTable(0);
  }
  public onCameraCaptureError(err) {
  }
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
    // this.$broadcast('ngWebcam_capture');
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
    this.initTable(0);

  };
  public checkClear() { }

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
      params.offset = 0;
      this.currentPage = 1;
      this.hideLoadMore = 1;
      //check this 
      params.searchFlag = 1;
      params.searchString = this.searchuser;

    } else if ((searchflag == 1) && !this.searchuser) {
      params.offset = 0;
      this.currentPage = 1;
    }

    this.httpService.post(environment.urlC + 'get_all_driver', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      else data = data;
      console.log(data);
      if (data.flag == 101) {
        // this.showCredentialsAlert();
      }
      if (data.flag == 703) {
        this.totalItems = data.total_drivers;
        this.Users = data.drivers;
      } else {
        this.totalItems = data.total_drivers;
        if ((this.totalItems / 10 + 1) <= this.currentPage) {
          this.hideLoadMore = 1;
        } else {
          this.hideLoadMore = 0;
        }
        this.Users = data.drivers;
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
    }
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);
        this.loadMoreNow();
      }
    }
  }

  public loadMoreNow() {
    var params = {
      web_access_token: this.cookieService.get("web_access_token"),
      limit: 10,
      offset: this.skip
    }
    if (this.searchuser) {
      // params.searchFlag = 1;
      // params.searchString =this.searchuser;
    }

    this.httpService.post(environment.urlC + 'get_all_driver', params).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      if (data.flag == 101) {
        this.router.navigate(["/", "corporate_login"]);
      }
      if (data.flag == 502) {
      } else {
        this.totalItems = data.total_drivers;
        var Users = data.drivers;
        Users.forEach((userData, ind) => {
          this.Users.push(userData);
        });
        // $scope.$apply();
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

  // $scope.minDate=new Date();

  public typeSelect(a) {
    this.doc.docType = a;
  }
  public openAddUser() {
    window.open(environment.vendorBaseURL + 'driverlogin.html', '_blank');
  };
  // $scope.doc = {};
  public closeThisDialog() {
    this.doc = {};
  }
  public searchForUser() {
  }
  public addtoAccount(user) {
    this.driver_toAdd = user.driver_id;
    this.toBeAdded = user.driver_name;
  }
  public addtoAccountConfirmed(driver_id) {
    $('#loading').modal('show');
    this.userInProcess = driver_id;
    this.httpService.post(environment.urlC + 'add_fav_driver', {
      web_access_token: this.cookieService.get('web_access_token'),
      driver_id: driver_id,
      referral_code: '',
    }).subscribe((data) => {
      if (typeof (data) == 'string') data = JSON.parse(data);
      if (data.error) {
        alert(data.error || data.message);
        $('#loading').modal('hide');
        return;
      } else {
        // this.initTable();
        this.initTable(0);
        this.utilityService.toast('success', 'Driver Added Successfully!', '');
        setTimeout(() => {
          $('#loading').modal('hide');
          // $state.go("corporate.myQudosfave");
          // this.router.navigate(["/", "corporate","my-qudos-fave"]);
        }, 20);

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
    this.httpService.post(environment.urlC + '/verify_doc', {
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
    // $scope.$apply();
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
        // console.log(resized);
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
