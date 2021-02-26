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
  selector: "app-documents",
  templateUrl: "./documents.component.html",
  styleUrls: ["./documents.component.scss"],
})
export class DocumentsComponent implements OnInit {
  docs: Array<any> = [];
  hideButton: boolean = true;
  loading: boolean = false;
  verifymsg: string;
  doc: any = {
    expiry_date: new Date()
  };
  type: number = 0;
  docName: string;
  submitText: string;
  editDoc: boolean;

  captureImage: boolean = false;
  totalItems: any;
  documentTypes: any;
  totalTypes: number;
  validate: any;
  doc_id: any;
  attention_required: any;
  showUpdate: number;
  edit_expiry: any;

  ridePage: number = 0;
  skip: number = 0;
  currentPage: number = 1;
  buttonClicked: number = 0;
  pop: any = {
    myDate: new Date(),
    isOpen: false,
  };
  myTrips: Array<any> = [];
  // userDetails: Array<any> = [];
  // driverDetails: Array<any> = [];
  userDetails: any = {};
  driverDetails: any = {};
  submitUpdate: string = "Update";
  driverID: any;
  camConfig: any = {
    delay: 1,
    countdown: 3,
  };
  lastToastRef: any;

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
    $('.panel-faq').on('show.bs.collapse', function () {
      $(this).addClass('active');
    });
    $('.panel-faq').on('hide.bs.collapse', function () {
      $(this).removeClass('active');
    });
    $("#mydocuploado").click(function () {
      $("#afterbordero").css("cssText", "border:1px solid #1f8dc6!important;");
    });
    $("#mydocupload").click(function () {
      $("#afterborder").css("cssText", "border:1px solid #1f8dc6!important;");
    });


    // $.noConflict();
    // $('#datepicker').datepicker({
    //   uiLibrary: 'bootstrap4'
    // });

    // $(function () {
    //   $('#date').combodate({
    //     firstItem: "name",
    //   });
    // });
    // $("#date").combodate({
    //   firstItem: "name",
    // });
    // $("#edate").combodate({
    //   firstItem: "name",
    // });
    this.initTable()
  }


  public onCameraCaptureError() { }

  public onCameraCaptureComplete(src) {
    this.doc.capturedImage = src[0];
    this.captureImage = false;
  }

  public onCameraLoad() {
    $("#ng-webcam-counter").css("visibility", "hidden");
  }
  public takePicture() {
    $("#ng-webcam-counter").css("visibility", "unset");
    this.doc.capturedImage = undefined;
    // this.$broadcast('ngWebcam_capture');
  }
  public cameraOn() {
    // this.$broadcast('ngWebcam_on');
  }
  public cameraOff() {
    // this.$broadcast('ngWebcam_off');
  }
  public navigateBack() {
    this.doc = {};
    this.captureImage = false;
    this.editDoc = false;
  }

  public editDocument(doc) {
    this.submitUpdate = "Update";
    if (!this.editDoc) {
      this.editDoc = true;
      return;
    }
    this.addEditDocType(doc, 1);
  }

  public logout() {
    $(".modal").modal("hide");
    // $cookieStore.remove('access_token');
    this.cookieService.delete("access_token");
    this.router.navigate(["/", "corporate_login"]);
  }


  // $scope.status = {
  //   isCustomHeaderOpen: false
  // };

  public pageChanged(currentPage) {
    this.currentPage = currentPage;
    // check this for loop
    for (var i = 1; i <= this.totalItems / 10 + 1; i++) {
      if (this.currentPage == i) {
        this.skip = 10 * (i - 1);
      }
    }
    //   for (var i = 1; i <= $scope.totalItems / 10 + 1; i++) {
    //     if ($scope.currentPage == i) {
    //         $scope.skip = 10 * (i - 1);

    //         //$scope.$apply();
    //     }
    // }
    this.initTable();
  }
  public initTable() {
    let data = {};
    this.httpService
      .post(environment.urlC + "get_doc_types", data)
      .subscribe((data) => {
        if (typeof data == "string") data = JSON.parse(data);
        this.documentTypes = data.doc_types;
        this.totalTypes = this.documentTypes.length;

        this.httpService
          .post(environment.urlC + "corporate_docs", {
            web_access_token: this.cookieService.get("web_access_token"),
          })
          .subscribe((data) => {
            if (typeof data == "string") {
              data = JSON.parse(data);
            } else {
              data = data;
            }
            if (data.flag == 101) {
              // this.showCredentialsAlert();
            }
            if (data.flag == 808) {
              this.totalItems = data.driver_docs.length;
              this.docs = data.driver_docs;
              // $scope.$apply();
            }
          });
      });
  }
  // $scope.initTable();
  public onClose() {
    this.loading = false
  }
  public loadData() {
    $(".accordion-toggle").addClass("collapsed");
  }
  // $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
  //   $('.collapse').on('show.bs.collapse', function() {
  //       $('.collapse.in').collapse('hide');
  //       var index = $(this).attr("id");
  //       $scope.arrowKey = true
  //       $cookieStore.put('modalToOpen', index);
  //   });

  // });

  // $scope.minDate=new Date();

  public typeSelect(a) {
    // doc.docType = a;
    this.doc.docType = a;
  }

  // $scope.doc = {};
  // $scope.doc.expiry_date = new Date();
  // $scope.doc.reminder_before = '';
  // $scope.submitText = 'Add Document';

  public addEditDocType(doc, type) {

    if (this.lastToastRef?.toastId) {
      this.utilityService.removeToast(this.lastToastRef?.toastId);
    }
    if (doc.expiry_date === "") {
      this.lastToastRef = this.utilityService.toast("error", "Select Expiry Date");
      return false;
    } else {
      var givendate = new Date(doc.expiry_date);
      var givenmilliseconds = givendate.getTime();
      var nowdate = new Date();
      var nowmilliseconds = nowdate.getTime();

      if (nowmilliseconds >= givenmilliseconds) {
        this.lastToastRef = this.utilityService.toast("error", "Please select a valid date");
        return false;
      }
    }

    if (doc.docType === undefined) {
      this.lastToastRef = this.utilityService.toast("error", "Select Document Type");
      return false;
    }
    if (doc.doc_file === undefined) {
      if (doc.capturedImage) {
        doc.doc_file = doc.capturedImage;
      } else {
        if (type == 0) {
          this.lastToastRef = this.utilityService.toast(
            "error",
            "Please select document to upload",
            ""
          );
          return false;
        }
      }
    }

    const payload = {
      "web_access_token": this.cookieService.get("web_access_token"),
      "document_type_id": doc.docType,
      "reminder_before": "30",
      "expiry_date": moment(doc.expiry_date).format("YYYY-MM-DD")
    }

    if (type == 1) {
      if (doc.doc_file !== undefined) {
        payload["doc_file"] = doc.doc_file;
      } else {
        payload["doc_file"] = "";
      }
    } else {
      payload["doc_file"] = doc.doc_file;
    }


    if (type == 0) {
      this.submitText = "Uploading.....";

      if (this.buttonClicked === 1) {
        return false;
      } else {
        this.loading = true;
        this.buttonClicked = 1;
        this.httpService
          .fileUpload(environment.urlC + "upload_corporate_doc", payload)
          .subscribe((data) => {
            if (data.flag == 1303) {
              this.submitText = "Add Document";
              this.buttonClicked = 0;
              this.utilityService.alert(
                "success",
                "Document Added Successfully",
                ""
              );
              $("#document_dialog").modal("hide");
              $(".modal-backdrop").hide();
              setTimeout(() => {
                this.initTable()
                // location.reload();
              }, 200);
              this.loading = false;
            }
            if (data.flag == 1302) {
              this.buttonClicked = 0;
              this.submitText = "Add Document";
              $("#document_dialog").modal("hide");
              this.loading = false;
              this.utilityService.alert(
                "error",
                "A valid document of this type already exist for this corporate.",
                ""
              );
            }
          });
      }
    } else {
      if (this.buttonClicked === 1) {
        return false;
      } else {
        this.loading = true;
        this.buttonClicked = 1;
        payload["doc_id"] = doc.doc_id;
        this.httpService
          .fileUpload(environment.urlC + "edit_corporate_doc", payload)
          .subscribe((data) => {
            // data = data.data;
            this.buttonClicked = 0;
            if (data.flag == 1308) {
              this.utilityService.toast(
                "success",
                "Document Updated Successfully",
                ""
              );
              $("#document_dialog_edit").modal("hide");
              $(".modal-backdrop").hide();

              this.editDoc = false;

              $(".modal-backdrop").hide();

              setTimeout(() => {
                this.initTable()
                // location.reload();
              }, 200);
              this.loading = false;
            }
            if (data.flag == 1302) {
              $("#document_dialog_edit").modal("hide");
              this.loading = false;
              this.utilityService.toast(
                "error",
                "A valid document of this type already exist for this corporate.",
                ""
              );
            }
          });
      }
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
  }
  public validateDoc(docID, flag) {
    this.httpService
      .post(environment.url + "/valid_invalid_doc", {
        access_token: this.cookieService.get("access_token"),
        doc_id: docID,
        valid_flag: flag,
      })
      .subscribe((data) => {
        if (data.flag == 1305) {
          // $rootScope.openToast('success', 'Document Validated Successfully', '');
          this.utilityService.toast(
            "success",
            "Document Validated Successfully",
            ""
          );
          setTimeout(() => {
            // ngDialog.close({
            //     template: 'validate_doc_dialog',
            //     className: 'ngdialog-theme-default',
            //     scope: $scope
            // });
            location.reload();
          }, 2500);
        }
        if (data.flag == 1306) {
          // $rootScope.openToast('success', 'Document Invalidated Successfully', '');
          this.utilityService.toast(
            "success",
            "Document Invalidated Successfully",
            ""
          );

          setTimeout(() => {
            // ngDialog.close({
            //     template: 'validate_doc_dialog',
            //     className: 'ngdialog-theme-default',
            //     scope: $scope
            // });
            location.reload();
          }, 2500);
        }
      });
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
  }
  public attentionDoc(docID, flag) {
    this.httpService
      .post(environment.url + "/change_attention_doc", {
        access_token: this.cookieService.get("access_token"),
        doc_id: docID,
        attention_flag: flag,
      })
      .subscribe((data) => {
        if (data.flag == 1309) {
          // $rootScope.openToast('success', 'Attention Raised Successfully', '');
          this.utilityService.toast(
            "success",
            "Attention Raised Successfully",
            ""
          );
          setTimeout(() => {
            // ngDialog.close({
            //     template: 'attention_doc_dialog',
            //     className: 'ngdialog-theme-default',
            //     scope: $scope
            // });
            location.reload();
          }, 2500);
        }
        if (data.flag == 1310) {
          // $rootScope.openToast('success', 'Attention Withdrawn Successfully', '');
          this.utilityService.toast(
            "success",
            "Attention Withdrawn Successfully",
            ""
          );
          setTimeout(() => {
            // ngDialog.close({
            //     template: 'attention_doc_dialog',
            //     className: 'ngdialog-theme-default',
            //     scope: $scope
            // });
            location.reload();
          }, 2500);
        }
      });
  }
  public verify_doc_dialog(doc_id) {
    this.doc_id = doc_id;
    // ngDialog.open({
    //     template: 'verify_doc_dialog',
    //     className: 'ngdialog-theme-default',
    //     showClose: false,
    //     scope: $scope
    // });
  }
  public verify(docID) {
    this.httpService
      .post(environment.url + "/verify_doc", {
        access_token: this.cookieService.get("access_token"),
        doc_id: docID,
      })
      .subscribe((data) => {
        if (data.flag == 1307) {
          // $rootScope.openToast('success', 'Document Verified Successfully', '');
          this.utilityService.toast(
            "success",
            "Document Verified Successfully",
            ""
          );
          setTimeout(() => {
            // ngDialog.close({
            //     template: 'verify_doc_dialog',
            //     className: 'ngdialog-theme-default',
            //     scope: $scope
            // });
            location.reload();
          }, 2500);
        }
      });
  }

  public launchChildRegisterModal = () => {
    $('#date').combodate({
      firstItem: "name",
    });
  };

  public addDocDialog() {
    // this.launchChildRegisterModal();
    this.submitText = "Add Documents"
    this.submitUpdate = "Add Document"
    this.type = 0;
    this.doc.expiry_date = "";
    this.doc.document_url = "";
    this.doc.doc_id = "";

    this.type = 0;
    this.doc.expiry_date = "";
    this.doc.doc_id = "";
    this.doc.document_url = "";
    this.doc.doc_file_name = "";

    // delete this.doc.doc_file;
  };

  // $scope.showUpdate = 1;

  public viewDocDialog(doc, edit) {
    this.editDoc = edit;
    this.doc.expiry_date = "";
    this.doc.expiry_date = new Date(doc.expiry_date);
    // $('[name="edate"]').combodate(
    //   "setValue",
    //   this.convertDate(doc.expiry_date)
    // );
    this.doc.reminder_before = doc.reminder_before;
    this.doc.document_url = doc.document_url;
    this.doc.doc_id = doc.doc_id;
    this.showUpdate = 0;
    this.documentTypes.forEach((x) => {
      if (x.document_type_id == doc.document_type_id) {
        this.doc.docTypeName = doc.document_name;
        this.doc.document_type_id = doc.document_type_id;
        this.doc.docType = x;
        return;
      }
    });
    // $.each($scope.documentTypes,function(i,x){
    // if(x.document_type_id == doc.document_type_id){
    //   $scope.doc.docTypeName =  doc.document_name ;
    //   $scope.doc.document_type_id =  doc.document_type_id ;
    //   $scope.doc.docType = x;
    //   return;
    // }
    // });

    this.doc.doc_file_name = "";
    // delete this.doc.doc_file;
  }

  public pad(s) {
    return s < 10 ? "0" + s : s;
  }

  public convertDate(inputFormat) {
    var d = new Date(inputFormat);
    return [
      this.pad(d.getMonth() + 1),
      this.pad(d.getDate()),
      d.getFullYear(),
    ].join("/");
  }

  public viewDocEditDialog(doc, edit) {
    this.editDoc = edit;
    this.doc.expiry_date = "";
    this.edit_expiry = new Date(doc.expiry_date);
    this.edit_expiry = this.edit_expiry.toDateString();

    // $('[name="edate"]').combodate(
    //   "setValue",
    //   this.convertDate(doc.expiry_date)
    // );
    this.doc.expiry_date = new Date(doc.expiry_date);
    this.doc.reminder_before = doc.reminder_before;
    this.doc.document_url = doc.document_url;
    this.doc.doc_id = doc.doc_id;
    this.showUpdate = 1;

    this.documentTypes.forEach((x) => {
      if (x.document_type_id == doc.document_type_id) {
        this.doc.docTypeName = doc.document_name;
        this.doc.document_type_id = doc.document_type_id;
        this.doc.docType = x;
        return;
      }
    });
    // $.each($scope.documentTypes,function(i,x){
    // if(x.document_type_id == doc.document_type_id){
    //   $scope.doc.docTypeName =  doc.document_name ;
    //   $scope.doc.document_type_id =  doc.document_type_id ;
    //   $scope.doc.docType = x;
    //   return;
    // }
    // });
    this.doc.doc_file_name = "";
    // delete this.doc.doc_file;
  }

  public file_to_upload(files) {
    this.processfile(files[0]);
    var reader = new FileReader();
    reader.onload = (e) => {
      this.doc.document_url = e.target.result
    }
    reader.readAsDataURL(files[0]);
    this.doc.doc_file_name = files[0].name;
    // this.$apply();
  }

  public processfile(file) {
    if (!/image/i.test(file.type)) {
      // $rootScope.openToast('error', "File " + file.name + " is not an image.", '');
      this.utilityService.toast(
        "error",
        "File " + file.name + " is not an image.",
        ""
      );
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
      };
    };
  }

  public resizeMe(img) {
    var canvas = document.createElement("canvas");

    var width = img.width;
    var height = img.height;
    var max_width = 1024;
    var max_height = 720;
    // calculate the width and height, constraining the proportions
    if (width > height) {
      if (width > max_width) {
        //height *= max_width / width;
        height = Math.round((height *= max_width / width));
        width = max_width;
      }
    } else {
      if (height > max_height) {
        //width *= max_height / height;
        width = Math.round((width *= max_height / height));
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
    var byteString = atob(dataURI.split(",")[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {
      type: "image/jpeg",
    });
    this.doc.doc_file = blob;
  }
  public viewDetails(modalIndex) {
    var tripDetails = this.myTrips[modalIndex];

    localStorage.setItem("userTripDetails", JSON.stringify(tripDetails));
    // $state.go("affiliate.rideDetails");
    this.router.navigate(["/", "corporate_login"]);
  }

  public rotateImage(id) {
    if (
      $(".table:nth-child(" + id + ") .displayArrow").hasClass(
        ".collapse_dark_arrow"
      )
    ) {
      $(".table:nth-child(" + id + ") .displayArrow").removeClass(
        ".collapse_dark_arrow"
      );
    } else {
      $(".table:nth-child(" + id + ") .displayArrow").addClass(
        ".collapse_dark_arrow"
      );
    }
  }

  public onFilePicker() {
    $('#mydocupload').click();
  }

  public onFilePickerInput($event) {
    console.log('file picke event called;')
  }

  public viewDocument(url: string) {
    window.open(url);
  }
}
