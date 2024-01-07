import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingServiceService {

  private API_KEY = 'a54b27779f8046d8922ccfeda49f0f04';

  constructor(private http: HttpClient) { }

  getCityByCoordinates(latitude: number, longitude: number): Observable<any> {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${this.API_KEY}`;
    return this.http.get(url);
  }
}
