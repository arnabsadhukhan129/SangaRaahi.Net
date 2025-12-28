import { Component } from '@angular/core';
import { S3Service } from 'src/app/shared/services/s3.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import * as S3 from 'aws-sdk/clients/s3';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-pratice',
  templateUrl: './pratice.component.html',
  styleUrls: ['./pratice.component.css']
})
export class PraticeComponent {
  selectedFiles: any;
  uploadedImages: any;

  constructor(
    private s3Service: S3Service,
    private alertService: AlertService,
  ){}

  onFileSelected(event: any): void {
  this.selectedFiles = event.target.files;
  console.log("selectedFiles----->", this.selectedFiles);
  
  this.uploadedImages = []; // Clear previous uploads when new files are selected
}

async uploadImages(): Promise<void> {
  console.log("selectedFiles...", this.selectedFiles);
  
  if (this.selectedFiles && this.selectedFiles.length > 0) {
    const bucket = new S3({
      accessKeyId: environment.AWS_ACCESS_KEY,
      secretAccessKey: environment.AWS_SECRET_KEY,
      region: environment.AWS_REGION
      // region: 'ap-south-1' // Asia Pacific (Mumbai)
    });

    for (const file of this.selectedFiles) {
      const params = {
        Bucket: environment.BUCKET_NAME,
        Key: file.name, // Use the file name as the key
        Body: file,
        ACL: 'public-read'
      };

      try {
        const data = await bucket.upload(params).promise();
        this.alertService.success("Successfully uploaded");
        this.uploadedImages.push(data.Location);
      } catch (err) {
        console.error("Error uploading file", err);
        this.alertService.error("There was an error uploading your file");
      }
    }
  } else {
    this.alertService.error("No file uploaded.");
  }
}
}

