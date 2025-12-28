import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/services/loader.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ApolloClientService } from 'src/app/shared/services/apollo-client.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CommunityService } from 'src/app/shared/services/community.service';
import { PaymentService } from 'src/app/shared/services/payment.service';

@Component({
  selector: 'app-redirct-link',
  templateUrl: './redirct-link.component.html',
  styleUrls: ['./redirct-link.component.css']
})
export class RedirctLinkComponent implements OnInit {
  private paymentIdSubscriber!: Subscription;
  payId: any;
  constructor(
    private authService: AuthService,
    private loaderService: LoaderService,
    private apolloClient: ApolloClientService,
    private alertService: AlertService,
    private communityService: CommunityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private paymentService: PaymentService
  ){}
  ngOnInit(): void {
    this.paymentIdSubscriber = this.activatedRoute.paramMap.subscribe({
      next: (params: any ) => {
        this.payId = params.get('id');
        console.log("payment Id======", this.payId);
        
      },
      error: (err: any) => { }
    });
    this.redirectToDashboard();
  }

  redirectToDashboard(){
    const params = {
      accountId: this.payId
    };
    this.loaderService.show();
    this.paymentService.paymentDashboardUrl(params).subscribe({
        next: (response) => {
          this.loaderService.hide();
          this.alertService.error(response.message);
          this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          this.loaderService.hide();
          this.alertService.error(error.error.message);
          this.router.navigateByUrl('/dashboard');
        }
      });
  }
}
