import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {

  private API_KEY = 'AIzaSyALne_qlDXLOGyn9LcxY06wdEIBnbKtcKE';

  constructor(private http: HttpClient) { }

  getReferencesPhotoByName(cityName: string): Observable<any> {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${cityName}&fields=photos&key=${this.API_KEY}`;
    return this.http.get(url);
  }

  getCityPhoto(photoRef: string) {
    const url = `https://maps.googleapis.com/maps/api/place/photo?&photo_reference=${photoRef}&key=${this.API_KEY}`;
    return this.http.get(url);
  }


}
