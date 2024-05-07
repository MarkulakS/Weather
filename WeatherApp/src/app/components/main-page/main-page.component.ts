import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';

import { GeocodingServiceService } from 'src/app/service/geocoding-service.service';
import { ApiWeatherService } from 'src/app/service/api-weather.service';
import { ApiCityService } from 'src/app/service/api-city.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent implements OnInit {

  firstLoad = false;

  cityInfo: {
    cityName: string;
    cityFullName: string;
    latitudeGPS: number;
    longitudeGPS: number;
  }[] = []

  inputText = '';
  citiesList: any[] = [];

  weatherInfo: {
    currentTemp: number;
    feelsLike: number;
    localDay: string;
    localTime: string;
    cityFullName: string;
    description: string;
    rain: number;
    uv: number;
    windSpeed: number;
    windDirection: string;
    sunrise: string;
    sunset: string;
    humidity: number;
    humidityStatus: string;
    humidityStatusIcon: string;
    visibility: number;
    visibilityStatus: string;
    visibilityStatusIcon: string;
    air: number;
    airIndex: number;
    airStatus: string;
    airStatusIcon: string;
    weatherCurrentCode: number;
    weatherCurrentIcon: string;
  }[] = [];

  weekInfo: {
    date: string;
    id: number;
    dayName: string;
    dayNameLong: string;
    dayC: number;
    nightC: number;
    weatherCode: string;
    uv: number;
    humidity: number;
    humidityStatus: string;
    humidityStatusIcon: string;
    windSpeed: number;
    sunrise: string;
    sunset: string;
    visibility: number;
    visibilityStatus: string;
    visibilityStatusIcon: string;
  }[] = [];

  weekHighlights: {
    date: string;
    id: number;
    dayName: string;
    dayNameLong: string;
    dayC: number;
    nightC: number;
    weatherCode: string;
    uv: number;
    humidity: number;
    humidityStatus: string;
    humidityStatusIcon: string;
    windSpeed: number;
    sunrise: string;
    sunset: string;
    visibility: number;
    visibilityStatus: string;
    visibilityStatusIcon: string;
  }[] = [];


  constructor(private http: HttpClient, private geocodingService: GeocodingServiceService, 
    private weatherService: ApiWeatherService, private apiCity: ApiCityService) { }

  ngOnInit(): void {
    if(!localStorage.getItem('city')) {
      this.cityInfo.push({
        cityName: 'London',
        cityFullName: 'United Kingdom',
        latitudeGPS: 0,
        longitudeGPS: 0
      })
      localStorage.setItem('city', JSON.stringify(this.cityInfo[0]));
      this.firstLoad = true;
    }else{
      let cityStorage = JSON.parse(localStorage.getItem('city') || '[]')
      this.cityInfo.push({
        cityName: cityStorage.cityName,
        cityFullName: cityStorage.cityFullName,
        latitudeGPS: cityStorage.latitudeGPS,
        longitudeGPS: cityStorage.longitudeGPS
      });
      this.firstLoad = false;
    }

    if(!localStorage.getItem('weekInfo')) {
      this.weatherService.getApiWeather(this.cityInfo[0].cityName);
      this.firstLoad = true;
    }else {
      this.getStorageData();
    }
    // this.getPhoto(this.cityName);
  }

  getStorageData() {
    let tday = JSON.parse(localStorage.getItem('tdayWeather') || '[]');
    let week = JSON.parse(localStorage.getItem('weekInfo') || '[]');

    this.weatherInfo[0] = tday;
    
    setTimeout(() => {
      this.weatherService.progresBarChange(this.weatherInfo[0].uv);
    }, 300);

    for(let i = 0; i < week.length; i++) {
      if(i === 0) {
        this.weekHighlights[0] = week[0];
        setTimeout(() => {
          this.weatherService.progresBar(this.weekHighlights[0].uv);
        }, 300);
      }
      this.weekInfo[i] = week[i];
    }
  }

  changeWeather(checked: any) {
    this.weekHighlights[0] = this.weatherService.changeWeather(checked);
    this.firstLoad = false;
  }

  getLocation() {
    localStorage.removeItem('city');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { 
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude; 
          this.geocodingService.getCityByCoordinates(latitude, longitude).subscribe(
            (data: any) => {
              this.cityInfo = [];
              const fullAddress = data.results[0].formatted;
              const parts = fullAddress.split(',', 3)[1].split(' ', 8);
              this.cityInfo.push({
                cityName: parts.slice(2).toString(),
                cityFullName: fullAddress.split(',', 3)[2],
                latitudeGPS: latitude,
                longitudeGPS: longitude,
              })
              localStorage.setItem('city', JSON.stringify(this.cityInfo[0]));
              setTimeout(() => {
                this.weatherService.getApiWeather(this.cityInfo[0].cityName);
              },300);
              setTimeout(() => {
                this.weatherService.changeWeather(true);
              },500);
            },
            (error) => {
              console.log("Error with download data from GEO_API: "+error);
            }
          )
        },
        (error) => {
          console.log("Error with downloading location: "+error);

// Toast handle error
          // switch(error.code) {
          //   case error.PERMISSION_DENIED:
          //     x.innerHTML = "User denied the request for Geolocation."
          //     break;
          //   case error.POSITION_UNAVAILABLE:
          //     x.innerHTML = "Location information is unavailable."
          //     break;
          //   case error.TIMEOUT:
          //     x.innerHTML = "The request to get user location timed out."
          //     break;
          //   case error.UNKNOWN_ERROR:
          //     x.innerHTML = "An unknown error occurred."
          //     break;
          // }
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  onInput(event: any): void {
    const inputValue = event.target.value.trim();

    if (inputValue.length >= 2) {
      this.getNinjaApi(inputValue).forEach(() => {});
    } else {
      this.citiesList = [];
    } 
  }

  getNinjaApi(query: string): Observable<any> {
    let url = `https://api.api-ninjas.com/v1/city?name=${query}&limit=20`;
    const headers = new HttpHeaders({
      'X-Api-Key': this.apiCity.shareKey()
    })
    const options = {headers};

    return this.http.get(url, options).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((res: any) => {
        if (res) {
          this.citiesList = this.extractCitiesData(res);
          return this.citiesList;
        } else {
          return of([]); // Pusta tablica w przypadku braku danych
        }
      }),
      catchError((error: any) => {
        console.error('Error when downloading data from NinjaApi:', error);
        return of([]); // Obsługa błędów i zwracanie pustej tablicy
      })
    );
  }

  private extractCitiesData(data: any[]): any[] {
    const result: any[] = [];
  
    data.forEach((item: any) => {
      result.push({ name: item.name, country: item.country });
    });
  
    return result;
  }

  chosenCity(city: string) {
    localStorage.removeItem('city');
    this.cityInfo = [];
    this.cityInfo.push({
      cityName: city.split(",", 1).toString(),
      cityFullName: '',
      latitudeGPS: 0,
      longitudeGPS: 0
    })
    localStorage.setItem('city', JSON.stringify(this.cityInfo[0]));
    setTimeout(() => {
      this.weatherService.getApiWeather(this.cityInfo[0].cityName);
    },300 );
    setTimeout(() => {
      this.weatherService.changeWeather(true);
    },500 );
    this.inputText = '';
    this.citiesList = [];
  }
}
