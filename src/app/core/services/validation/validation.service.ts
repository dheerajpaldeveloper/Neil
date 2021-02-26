import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  textLength = 100;
  passwordMinLength = 6;
  passwordMaxLength = 12;
  portNumberLength = 6;
  pinCodeLength = 6;

  name: RegExp = /^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/;
  number: RegExp = /^[0-9]*$/;

  email: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  numberWithTwoDecimals: RegExp = /^[0-9]+(\.[0-9]{1,2})?$/;

  ipAddress: RegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  mobile: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  isMobileValid(value: string | number): string {
    const identity = `${value}`;
    if (!identity.match(/^\d{10}$/) &&
      !identity.match(/^(\+\d{1,3}[- ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {
      return 'Mobile is invalid';
    }
  }

  isEmailValid(value: string): string {
    if (!this.email.test(value)) {
      return 'Email is invalid';
    }
  }

  isIpAddressValid(value: string): string {
    if (!this.ipAddress.test(value)) {
      return 'Ip address is invalid';
    }
  }

  isPasswordValid(value: string): string {
    if (!value) {
      return 'Password is invalid';
    }

    if (value.length < this.passwordMinLength) {
      return `Password is less than ${this.passwordMinLength} characters`;
    }

    if (value.length > this.passwordMaxLength) {
      return `Password is more than ${this.passwordMaxLength} characters`;
    }
  }
}
