import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    constructor(private http: HttpClient) {}
    paymentAccountCreate = environment.excelURL + '/payment/create/account';
    accountUrl = environment.excelURL +  '/payment/dashboard';
    refundableUrl = environment.excelURL + '/payment/payment-refund';

    paymentAccountCreatePost(params:any): Observable<any>{
        return this.http.post(this.paymentAccountCreate, params);
    }

    paymentDashboardUrl(params: any): Observable<any> {
        // Create HttpParams object to add query parameters
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
          httpParams = httpParams.append(key, params[key]);
        });
    
        // Make the POST request with query parameters
        return this.http.get(this.accountUrl, { params: httpParams });
    }
    
    refundableAmount(params: any): Observable<any>{
      return this.http.post(this.refundableUrl, params);
    }
}