import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.split('/').pop() === "graphql") {
      return next.handle(request);
    }
    const authToken = localStorage.getItem('authToken');
    
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Unauthorized request');
        }
        return throwError(() => error);
      })
    );
  }
}
