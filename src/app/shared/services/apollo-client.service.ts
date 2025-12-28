import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { catchError, Observable } from 'rxjs';
import { map } from 'rxjs';
import {GraphQLRequests} from '../typedefs/grapgql-request.types';
import { query_modules } from '../queries/apollo.queries';
import { ModuleKeyType } from '../interfaces/module-key-type.interface';
import { GeneralResponse } from '../interfaces/general-response.ineterface';
import {AuthService} from "./auth.service";
import {StorageService} from "./storage.service";
import {Router} from "@angular/router";
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class ApolloClientService {
  private module: any;
  private moduleKey!: keyof GraphQLRequests;
  private nullifyResponse:GeneralResponse = {
    code:1000,
    systemCode:"NULLRESPONSE",
    message:"No Response from API",
    error:true,
    data:null
  };
  constructor(
    private apollo:Apollo, 
    private storage: StorageService, 
    private router: Router,
    private alertService: AlertService,

  ) { }

  setModule(module: keyof ModuleKeyType) {
    this.module = query_modules[module];
    this.moduleKey = module;
    return this;
  }

  queryData(params = {}): Observable<GeneralResponse> {      
  // The following will make the module key synchronised for each request
  const thisModuleKey = this.moduleKey;
      return this.apollo.watchQuery<GraphQLRequests>({
          query: this.module,
          variables: params,
          fetchPolicy: 'network-only'
      })
      .valueChanges
      .pipe(
          map(result => {   
            // To address the problem with returning the read-only object from apollo client
            return JSON.parse(JSON.stringify(result.data));
          }),
          catchError(this.handleError<any>('Someting went while parsing result'))
      ).pipe(map(result => {    
          return result ? result[thisModuleKey] : this.nullifyResponse;
      }), catchError(this.handleError<any>('Someting went while parsing result'))
      ).pipe(map(result => {  
        if(result?.error && result?.code === 401) {
          // Logout
          this.logoutOnTokenExpiry();
          //this.logout();
        }
        return result;
        }),
        catchError(this.handleError<any>('Someting went while parsing result')));
  }
  mutateData(data:any): Observable<GeneralResponse> {
    // The following will make the module key synchronised for each request
    const thisModuleKey = this.moduleKey;
    return this.apollo.mutate<GraphQLRequests>({
      mutation: this.module,
      variables: data,
      fetchPolicy:'network-only'
    }).pipe(map(response => {
      // To address the problem with returning the read-only object from apollo client
      return JSON.parse(JSON.stringify(response.data));
    }),
    catchError(this.handleError<any>('Someting went while parsing result'))
    ).pipe(map(res => {
      return res ? res[thisModuleKey] : this.nullifyResponse;
    }),
    catchError(this.handleError<any>('Someting went while parsing result'))
    ).pipe(map(result => {
      if(result.error && result.code === 401) {
        // Logout
        //this.authService.logout();
        //this.logout();
      }
      return result;
    }),
    catchError(this.handleError<any>('Someting went while parsing result')));
  }

  logout() {
    //console.log('logout ----->');
    this.setModule("logout").mutateData({}).subscribe((response:GeneralResponse) => {
      //console.log("Logout response");
      if(response.error) {
        // Sow toaster
        this.alertService.error(response.message);
      } else {
        // this.alertService.success(response.message);
        // Redirect to the auth.
        this.storage.removeLocalItem('authToken');
        this.storage.removeLocalItem('userData');
        this.storage.removeLocalItem('communtityId');
        this.storage.removeLocalItem('refreshToken');
        this.storage.removeLocalItem('_grecaptcha');
        this.router.navigateByUrl('/auth');
      }
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      throw error;
    };
  }

  logoutOnTokenExpiry() 
  {        
          this.alertService.error('Token has been expired');
          this.storage.removeLocalItem('authToken');
          this.storage.removeLocalItem('userData');
          this.storage.removeLocalItem('communtityId');
          this.storage.removeLocalItem('refreshToken');
          this.storage.removeLocalItem('_grecaptcha');
          this.router.navigateByUrl('/auth');
          return false;
  }
}
