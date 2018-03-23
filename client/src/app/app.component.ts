import { Component } from '@angular/core';
import {IcoDataService} from "./services/ico/ico-data.service";
import {Observable} from "rxjs/Observable";
import {Ico} from "../../../shared/Ico.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  icos: Observable<Ico[]>;
  updating = false;

  constructor(private icoDataService: IcoDataService) {
    this.icos = icoDataService.getIcos()
  }

  update() {
    this.updating = true;
    this.icoDataService.update().subscribe(res => {
      this.updating = false;
      if (res.success) {
        this.icos = this.icoDataService.getIcos()
      } else {
        console.error('Failed to update icos');
      }
    });
  }

}
