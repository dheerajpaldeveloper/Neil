import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ToastrConfig, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

declare const jQuery: any;
const $: any = jQuery;

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

 private _showNewRideButton = false;
 private _newRideButtonShowSubject = new Subject<boolean>();
 newRideButtonChanges = this._newRideButtonShowSubject.asObservable();

  toastConfig = {
    closeButton: true
  }

  constructor(private toastr: ToastrService) { }

  public toast(type: 'success' | 'error' | 'warning' | 'info', msg: string, title: string = '') {
    return this.toastr[type](title, msg, this.toastConfig);
  }

  public clearToast(toastId? : number){
    if(toastId){
      this.toastr.clear(toastId);
    }
    else{
      this.toastr.clear();
    }
  }

  public removeToast(toastId:number){
    this.toastr.remove(toastId);
  }

  public alert(type: 'success' | 'error' | 'warning' | 'info', title: string, text?: string,
    options: {
      width?: number,
      height?: number,
      timer?: number,
      showConfirmButton?: boolean
    } = {width: 420}) {
    const config: any = {
      icon: type,
      title: title,
      showConfirmButton: true,
      timeOut: 45000000
    }

    if (options) {
      if (options.height) {
        config.height = options.height
      }

      if (options.width) {
        config.width = options.width
      }

      if (options.showConfirmButton !== undefined) {
        config.showConfirmButton = options.showConfirmButton
      }

      if (options.timer) {
        config.timer = options.timer
      }
    }

    Swal.fire(config);
  }

  /******************* confirmation dialog box (returns a promise) ********************/
  public async confirm(title: string, text?: string): Promise<SweetAlertResult> {
    const result: SweetAlertResult = await Swal.fire({
      title: `${'Are You Sure You Want To'} ${title}?`,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1f8dc6',
      cancelButtonColor: 'black',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',

      animation: true,
      allowOutsideClick: false
    });
    return result;
  }

  public openNav() {
    $('#mySidenav').show();
    var w = window.innerWidth;
    if (w > 500) {
      $('#mySidenav').css('width', '500px');
    }
    else {
      $('#mySidenav').css('width', '100%');
    }
  }

  public closeNav() {
    $('#mySidenav').css('width', '0px');
  }

  /*public openNav() {
  document.getElementById("editinfo").style.display = "none";
  }*/

  public editnav() {
    $('#slide').css('display', 'none');
    $('#editinfo').css('display', 'block');
  }

  public backnav() {
    $('#slide').css('display', 'block');
    $('#editinfo').css('display', 'none');
  }

  public openmenu() {
    $('#mynav').css('width', '100%');
    $('#backarrow').toggle();
    $('.navbar-toggler').toggle();
    //document.getElementById("mynavinfo").style.display = "hidden";
  }

  public closemenu(): void {
    $('#mynav').css('width', '0px');
    $('#backarrow').toggle();
    $('.navbar-toggler').toggle();
  }

  showNewRideButton(show: boolean):boolean {
    this._showNewRideButton = !!show;
    this._newRideButtonShowSubject.next(this._showNewRideButton);
    return this._showNewRideButton;
  }

}
