import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ApiCityService {

  private NINJA = 'AIIJBHZf5zCVXIu0l0Qmdw==jFLheXteHMle6enk';

  constructor() { }

  shareKey() {
    return this.NINJA;
  }
  
}
