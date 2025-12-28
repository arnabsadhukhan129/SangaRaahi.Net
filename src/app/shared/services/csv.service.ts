import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CsvService {
    constructor(private http: HttpClient) {}

    eventExcelUrl = environment.excelURL + '/' + 'generate-excel' + '/';
    memberExportUrl = environment.excelURL + '/' + 'generate-excel-member' + '/';
    taskExportUrl = environment.excelURL + '/' + 'generate-excel-task' + '/';
    supplierExportUrl = environment.excelURL + '/' + 'generate-excel-supplier' + '/';
    paymentExportUrl = environment.excelURL + '/' + 'generate-excel-payment' + '/';
    memberFamilyUrl = environment.excelURL + '/' + 'generate-excel-familymember' + '/';
    groupUrl = environment.excelURL + '/' + 'generate-excel-group' + '/';
    importUrl = environment.excelURL + '/' + 'import-file';
    supplierLogsUrl = environment.excelURL + '/' + 'generate-excel-supplier-log' + '/';
    token = localStorage.getItem('authToken');

    getLogsReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.supplierLogsUrl + '?' + 'supplierId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    getReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.eventExcelUrl + '?' + 'communityId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    getMemberReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.memberExportUrl + '?' + 'communityId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    getMemberFamilyWiseReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.memberFamilyUrl + '?' + 'communityId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    getMemberGroupWiseReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.groupUrl + '?' + 'communityId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    getTaskReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.taskExportUrl + '?' + 'eventId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    getSupplierReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.supplierExportUrl + '?' + 'eventId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    getPaymentReq(param: any): Observable<HttpResponse<Blob>> {
        const url = this.paymentExportUrl + '?' + 'eventId=' + param;
        // return this.http.get(url, { observe: 'response', responseType: 'blob' });
        return this.http.get(url, {
            observe: 'response',
            responseType: 'blob',
            headers: {
            'Authorization': `Bearer ${this.token}` // use 'Bearer' if your backend expects it
            }
        });
    }

    importFilePost(params:any): Observable<any>{
        return this.http.post(this.importUrl, params);
    }
}