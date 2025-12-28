import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';
import { AlertService } from 'src/app/shared/services/alert.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S3Service {
  getFileName: any;
  mainImage!: any;
  constructor(
    private alertService: AlertService,
  ) { }

  uploadFile(file: File): Observable<any>{
    if (file) {
      return from(new Promise((resolve, reject) => {
        const bucket = new S3({
          accessKeyId: environment.AWS_ACCESS_KEY,
          secretAccessKey: environment.AWS_SECRET_KEY,
          region: environment.AWS_REGION
          // region: 'ap-south-1' // Asia Pacific (Mumbai)
        });
  
        // upload file to the bucket...........
        const params = {
          Bucket: environment.BUCKET_NAME,
          Key: this.getFileName,
          Body: file,
          ACL: 'public-read'
        };
  
        bucket.upload(params, (err: any, data: any) => {
          if (err) {
            this.alertService.error("There was an error uploading your file");
            reject(err);
          } else {
            this.alertService.success("Successfully uploaded file.");
            this.mainImage = data.Location;
            resolve(data);
          }
        });
      }));
    } else {
      this.alertService.error("No file uploaded.");
      return new Observable(); // Return an observable to satisfy the type, but it won't emit any values.
    }
  }

  getObjectUrl(key: string): string {
    return `https://${environment.BUCKET_NAME}.s3.amazonaws.com/${key}`;
  }
}
