import { Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';

let socket: any;

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  // private socket;

  constructor() { }

  public connect(): void {
    socket = io(environment.SocketURL);
  }

  public on(eventName): Observable<any> {
    const subject = new Subject();

    socket.on(eventName, (data) => {
      subject.next(data);
    });

    return subject.asObservable();
  }

  public emit(eventName, value): void {
    socket.emit(eventName, value);
  }
}
