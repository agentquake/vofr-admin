import { Component } from '@angular/core';
import { RecapService } from '../../services/recap.service';
import { FileUploader } from 'ng2-file-upload';
import { interval, Observable } from 'rxjs';


const URL = 'http://107.150.52.213/node/recapapi/v1/api/upload';

@Component({
  selector: 'app-recap',
  styleUrls: ['./recap.component.scss'],
  templateUrl: './recap.component.html',
})

export class RecapComponent {
  uploader: FileUploader;
  isCreated: boolean = false;
  message: string;
  images: string[];
  link: string;
  progress: number;
  uploaded: number;
  constructor(private service: RecapService) {
    this.uploader = new FileUploader({ url: URL, itemAlias: 'photo' });
    this.images = [];
    this.message = '';
    this.link = '';
    this.uploaded = 0;
    this.progress = -1;
    this.uploader.onSuccessItem = (item, response) => this.images.push(response);
  }
  removeAll() {
    this.uploader.clearQueue();
    this.service.deleteImages(this.images).subscribe(res => {
      console.log(res);
    });
    this.images = [];
  }
  process() {
    this.message = 'Create scene...'
    this.service.createScene().subscribe(res => {
      if (res.success == true) {
        var token = res.token;
        var sceneId = res.sceneId;
        this.images.forEach(image => {
          this.service.addImage(token, sceneId, image).subscribe(res => {
            if (res.success == true) {
              this.uploaded++;
              this.message = 'Add images...(' + this.uploaded + '/' + this.images.length + ')'
              if (this.uploaded == this.images.length) {
                this.message = 'Start process...'
                this.service.startProcess(token, sceneId).subscribe(res => {
                  if (res.success == true) {
                    var sub = interval(1000).subscribe(x => {
                      this.service.checkProgress(token, sceneId).subscribe(res => {
                        if (res.completed == true) {
                          this.progress = 100;
                          this.message = "Successful";
                          this.link = res.link;
                          sub.unsubscribe();
                        } else {
                          if (res.error) {
                            this.message = "Error - Please try again!";
                            sub.unsubscribe();
                          } else {
                            this.message = "Processing..." + res.progress + "%"
                            this.progress = res.progress;
                          }
                        }
                      })
                    })
                  } else {
                    this.message = res.error.msg;
                  }
                })
              }
            } else {
              this.message = res.error.msg;
            }
          })
        });
      } else {
        this.message = res.error.msg;
      }
    })
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.service.deleteImages(this.images).subscribe(res => {
      console.log(res);
    })
  }
}
