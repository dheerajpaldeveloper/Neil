import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpService } from "../../../services/http/http.service";
import { environment } from "src/environments/environment";
import { UtilityService } from "./../../../core/services/utility/utility.service";
import * as moment from "moment";
import { CookieService } from 'ngx-cookie-service';
declare const jQuery: any;
const $: any = jQuery;

@Component({
  selector: "app-staff",
  templateUrl: "./staff.component.html",
  styleUrls: ["./staff.component.scss"],
})
export class StaffComponent implements OnInit {
  userInProcess: string;


  ridePage = 0;
  skip: number = 0;
  currentPage: number = 1;
  pop: any = {
    myDate: new Date(),
    isOpen: false
  };
  docs: Array<any> = [];
  // userDetails:Array<any> = [];
  // driverDetails:Array<any> = [];
  userDetails: any = {};
  driverDetails: any = {};
  driverID: any;
  totalItems: number;
  docTypes: any;
  submitText: string = 'Add Document';
  editDoc: boolean;
  validate: any;
  doc_id: any;
  attention_required: any;
  type: number;
  myTrips: any;
  userToAdd: any;
  userMobileToAdd: any;
  otpToAdd: any;

  doc: any = {
    expiry_date: new Date(),
    reminder_before: ''
  };


  constructor(
    private router: Router,
    private httpService: HttpService,
    private utilityService: UtilityService,
    private cookieService: CookieService
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
      this.driverDetails.subtype_id = driverModel.subtype_id;
    } else {
      this.cookieService.delete('access_token');
      this.router.navigate(["/", "corporate_login"]);
    }
  }

  ngOnInit(): void {
    this.initTable();
  }

  deleteStaff(data) { }
  reAddUser(data) { }
  completeUserAdd() { }

  public pageChanged(currentPage) {
    this.currentPage = currentPage;
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);
      }
    }
    this.initTable();
  };

  public initTable() {
    return false;
    // no data required
    let body = {}
    this.httpService.post(environment.urlV + 'get_doc_types', body).subscribe((data) => {
      if (typeof (data) == 'string')
        data = JSON.parse(data);
      this.docTypes = data.doc_types;
      this.httpService.post(environment.urlC + 'corporate_docs', {
        web_access_token: this.cookieService.get("web_access_token"),
      }).subscribe((data) => {
        if (typeof (data) == 'string')
          data = JSON.parse(data);
        else data = data;
        if (data.flag == 101) {
          // this.showCredentialsAlert();
        }
        if (data.flag == 808) {
          this.totalItems = data.driver_docs.length;
          this.docs = data.driver_docs;
        } else {
        }
      });
    });
  }

  loadData() {
    $('.accordion-toggle').addClass('collapsed');
  };

  //   $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
  //     $('.collapse').on('show.bs.collapse', function() {
  //         $('.collapse.in').collapse('hide');
  //         var index = $(this).attr("id");
  //         $scope.arrowKey = true
  //         $cookieStore.put('modalToOpen', index);
  //     });
  // });
  // $scope.minDate=new Date();

  public typeSelect(a) {
    this.doc.docType = a;
  }


  public addEditDocType(doc, type) {

    if (doc.expiry_date === '') {
      this.utilityService.toast('error', 'Select Expiry Date', '');
      return false;
    }

    if (doc.docType === undefined) {
      this.utilityService.toast('error', 'Select Document Type', '');
      return false;
    }

    if (doc.doc_file === undefined) {
      if (doc.capturedImage) {
        doc.doc_file = doc.capturedImage;
      }
      else {
        this.utilityService.toast('error', 'Select Document Type', '');
        return false;
      }
    }
    var form = new FormData();
    form.append('web_access_token', this.cookieService.get("web_access_token"));
    form.append('document_type_id', doc.docType.document_type_id);
    form.append('reminder_before', '30');
    form.append('expiry_date', moment(doc.expiry_date).format('YYYY-MM-DD'));
    form.append('doc_file', doc.doc_file);

    if (type == 0) {
      this.submitText = 'Uploading.....';
      // send header
      // headers: {
      //   'Content-Type': undefined
      // }
      this.httpService.post(environment.urlC + 'upload_corporate_doc', form).subscribe((data) => {
        data = data == 'string' ? data = JSON.parse(data).data : data.data;
        if (data.flag == 1303) {
          this.submitText = 'Add Document';
          this.utilityService.toast('success', 'Document Added Successfully', '');
          $('#document_dialog').modal('hide');
          $('.modal-backdrop').hide();
          this.initTable();
        }
        if (data.flag == 1302) {
          this.submitText = 'Add Document';
          $('#document_dialog').modal('hide');
          this.utilityService.toast('error', 'A valid document of this type already exist for this affiliate.', '');
        }
      })

    } else {
      form.append('doc_id', doc.doc_id);
      // send header
      // headers: {
      //   'Content-Type': undefined
      // }
      this.httpService.post(environment.urlC + 'edit_document', form).subscribe((data) => {
        data = data.data;
        if (data.flag == 1308) {
          this.utilityService.toast('success', 'Document Updated Successfully', '')
          $('#document_dialog_edit').modal('hide');
          $('.modal-backdrop').hide();
          this.initTable();
          this.editDoc = false;
        }
        if (data.flag == 1302) {
          $('#document_dialog_edit').modal('hide');
          this.utilityService.toast('error', 'A valid document of this type already exist for this affiliate.', '')
        }
      })
    }
  }

  public closeThisDialog() {
    this.doc = {};
  }
  public validate_doc_dialog(doc_id, v) {
    this.validate = v;
    this.doc_id = doc_id;
    // ngDialog.open({
    //     template: 'validate_doc_dialog',
    //     className: 'ngdialog-theme-default',
    //     showClose: false,
    //     scope: $scope
    // });
  };

  public validateDoc(docID, flag) {
    this.httpService.post(environment.url + '/valid_invalid_doc', {
      access_token: this.cookieService.get('access_token'),
      doc_id: docID,
      valid_flag: flag
    }).subscribe((data) => {
      if (data.flag == 1305) {
        this.utilityService.toast('success', 'Document Validated Successfully', '');
        setTimeout(() => {
          // ngDialog.close({
          //   template: 'validate_doc_dialog',
          //   className: 'ngdialog-theme-default',
          //   scope: $scope
          // });
          location.reload();
        }, 2500)
      }
      if (data.flag == 1306) {
        this.utilityService.toast('success', 'Document Invalidated Successfully', '');
        setTimeout(() => {
          // ngDialog.close({
          //   template: 'validate_doc_dialog',
          //   className: 'ngdialog-theme-default',
          //   scope: $scope
          // });
          location.reload();
        }, 2500)
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
    this.httpService.post(environment.url + '/change_attention_doc', {
      access_token: this.cookieService.get('access_token'),
      doc_id: docID,
      attention_flag: flag
    }).subscribe((data) => {
      if (data.flag == 1309) {
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
        this.utilityService.toast('success', 'Attention Withdrawn Successfully', '')
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
    this.httpService.post(environment.url + '/verify_doc', {
      access_token: this.cookieService.get('access_token'),
      doc_id: docID
    }).subscribe((data) => {
      if (data.flag == 1307) {
        this.utilityService.toast('success', 'Document Verified Successfully', '');
        setTimeout(() => {
          // ngDialog.close({
          //     template: 'verify_doc_dialog',
          //     className: 'ngdialog-theme-default',
          //     scope: $scope
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
