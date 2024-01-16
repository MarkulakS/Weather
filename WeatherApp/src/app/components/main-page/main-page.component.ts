import { HttpClient, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GeocodingServiceService } from 'src/app/service/geocoding-service.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})

export class MainPageComponent implements OnInit {

  inputText = '';
  citiesList: any[]= [];
  cityName = '' || 'London';
  cityFullName = '';
  cityId = '' || '2643743';
  photoLink = '';
  latituteGPS = 0;
  longitudeGPS = 0;

  currentTemp = 0;
  feelsLike = 0;
  localDay = '' || '?';
  localTime = 0 || '?';
  description = '' || '?';
  rain = 0 || '?';
  uv = 0 || '?';
  windSpeed = 0 || '?';
  windDirection = '' || '?';
  sunrise = '' || '?';
  sunset = '' || '?';
  humidity = 0 || '?';
  visibility = 0 || '?';
  minTemp = 0 || '?';
  air = 0 || '?';
  airIndex = 0 || '?';
  weatherCurrentCode = 0;
  weatherCurrentIcon = 'sun';
  forecastCode = 0;

  weekInfo: {
    day: string;
    img: string;
    dayC: number;
    nightC: number;
    // weatherId: number;
  }[] = [];

  constructor(private http: HttpClient, private geocodingService: GeocodingServiceService) { }

  ngOnInit(): void {
    this.getApiWeather(this.cityName);
    this.getCitiesApi('Lo');
    // this.getCityPhoto(this.cityId);
  }

  API_CITIES = 'https://api.teleport.org/api/cities/?search=';
  API_NINJA_CITIES = 'https://api.api-ninjas.com/v1/city?name=';
  private NINJA_KEY = 'AIIJBHZf5zCVXIu0l0Qmdw==G7KinKq6myjl6To8';

  API_WEATHER = 'http://api.weatherapi.com/v1/forecast.json?key=';
  private API_WEATHER_KEY = '0cecc2efe7ce4f00b06154532240501';
  API_AIR = '&aqi=yes'
  API_DAYS = '&days=7'

  getApiWeather(city: string) {
    this.weekInfo = [];

    const URL = this.API_WEATHER + this.API_WEATHER_KEY + '&q=' + city + this.API_AIR + this.API_DAYS;

    this.http.get(URL).subscribe(
      (res: any) => {
        console.log(res);
        this.currentTemp = Math.floor(res.current.temp_c);
        this.feelsLike = Math.floor(res.current.feelslike_c);
        this.localTime = this.changeFormatDate(res.location.localtime_epoch);
        this.description = res.current.condition.text;
        this.rain = res.current.precip_mm;
        this.uv = res.current.uv;
        this.windSpeed = res.current.wind_kph;
        this.windDirection = res.current.wind_dir;
        this.humidity = res.current.humidity;
        this.visibility = res.current.vis_km;
        this.air = res.current.air_quality.co.toFixed(0);
        this.airIndex = res.current.air_quality['"us-epa-index"'];
        this.sunrise = res.forecast.forecastday[0].astro.sunrise;
        this.sunset = res.forecast.forecastday[0].astro.sunset;
        this.weatherCurrentCode = res.current.condition.code;
        this.weatherCurrentIcon = this.chooseWeatherIcon(this.weatherCurrentCode);
        // pobrac id chmur

        for(let i=0; i<=6; i++) {
          let name = this.changeDayName(res.forecast.forecastday[i].date_epoch);
          let img_src = '/assets/icons-colour/sun.png';
          // let code = res.forecast[i].condition.code;
          // przerzucic do funkcji ktora wybiera ktory img wyswietlic
          let dayC = Math.floor(res.forecast.forecastday[i].day.maxtemp_c);
          let nightC = Math.floor(res.forecast.forecastday[i].day.mintemp_c);

          this.weekInfo.push({
            day: name,
            img: img_src,
            dayC: dayC,
            nightC: nightC,
            // weatherId: weatherId          
          })
        }
      },
      (error) => {
        console.error('Error when downloading data:', error);
      }
    )
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { 
          // console.log("Got position", position.coords);
          this.latituteGPS = position.coords.latitude; 
          this.longitudeGPS = position.coords.longitude;
          this.geocodingService.getCityByCoordinates(this.latituteGPS, this.longitudeGPS).subscribe(
            (data: any) => {
              const fullAddress = data.results[0].formatted;
              const parts = fullAddress.split(',', 3)[1].split(' ', 8);
              this.cityName = parts.slice(2).toString();
              this.getApiWeather(this.cityName);
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

  // API_CURRENT_WEATHER = 'http://api.openweathermap.org/data/2.5/weather?q=';
  // API_FORECAST_WEATHER = 'http://api.openweathermap.org/data/2.5/forecast?q=';
  // API_DAYS = '&cnt=1';
  // API_FORECAST_KEY = '&appid=66bcdad6e0d46da6a6d46283f4e3bad9';
  // API_UNITS = '&units=metric'
  API_CITY_ID = 'https://api.teleport.org/api/cities/geonameid:';

  onInput(event: any): void {
    const inputValue = event.target.value.trim();

    if (inputValue.length >= 2) {
      this.getCities(inputValue).forEach(el => {
        // console.log(el);
        // console.log(this.citiesList);
      });
    } else {
      this.citiesList = [];
    } 
  }

  getCitiesApi(query: string){
    const headers = new HttpHeaders({
      'X-Api-Key': this.NINJA_KEY
    });
    const options = {headers};
    this.http.get(`https://api.api-ninjas.com/v1/city?name=${query}`, options).subscribe(
      (data) => {console.log(data)},
      error => {
        console.error('Błąd podczas pobierania danych:', error);
      });
  }

  getCities(query: string): Observable<any> {
    return this.http.get(this.API_CITIES + query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((res: any) => {
        console.log(res);
        if (res._embedded && res._embedded['city:search-results']) {
          // this.citiesList = this.extractCitiesData(res._embedded['city:search-results'].name);
          // console.log(this.extractCitiesData(res._embedded['city:search-results'].forEach((el:any) => el.name)));
          this.citiesList = this.extractCitiesData(res._embedded['city:search-results']);
          return this.citiesList;
        } else {
          return of([]); // Pusta tablica w przypadku braku danych
        }
      }),
      catchError((error: any) => {
        console.error('Error when downloading data:', error);
        return of([]); // Obsługa błędów i zwracanie pustej tablicy
      })
    );
  }

  private extractCitiesData(data: any[]): any[] {
    const result: any[] = [];
  
    data.forEach((item: any) => {
      result.push({ name: item.matching_full_name });
    });
  
    return result;
  }

  getCityPhoto(city: string) {
    this.http.get(this.API_CITY_ID + city).subscribe(
      (res: any) => {
        this.photoLink = res._links['city:urban_area'].href;
        console.log(res._links['city:urban_area'].href);
      },
      (error) => {
        console.error('Error when downloading data:', error);
      }
    )
  }

  chosenCity(city: string) {
    this.cityFullName = city;
    this.cityName = city.split(",", 1).toString();
    this.getApiWeather(this.cityName);
    this.inputText = '';
    this.citiesList = [];
  }

  changeFormatDate(date: number) {
    const utcDate = new Date(date * 1000);
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour12: true, 
      hour: 'numeric',
      minute: 'numeric'
    }).format(utcDate);

    const formattedDay = new Intl.DateTimeFormat('en-US', {
      weekday: 'long'
    }).format(utcDate);
    this.localDay = formattedDay;

    return formattedTime;
  }

  changeDayName(date: number) {
    const utcDate = new Date(date * 1000);

    const formattedDay = new Intl.DateTimeFormat('en-US', {
      weekday: 'short'
    }).format(utcDate);

    return formattedDay;
  }

  chooseWeatherIcon(code: number) {
    let weather = '';
    if(code === 1000) {weather = 'sun';};
    if(code === 1003) {weather = 'partly-cloudy';};
    if(code === 1006 || code === 1009) {weather = 'clouds';};
    if(code === 1030 || code === 1135 || code === 1147) {weather = 'mist';};
    if(code === 1063 || code === 1192 || code === 1240 || code === 1243 || code === 1246) {weather = 'patchy-rain';};
    if(code === 1066 || code === 1210 || code === 1216 || code === 1222 || code === 1255 || code === 1258 || code === 1261 || code === 1264) {weather = 'patchy-snow';};
    if(code === 1069 || code === 1249 || code === 1252) {weather = 'patchy-snow-rain';};
    if(code === 1072 || code === 1168 || code === 1171 || code === 1198 || code === 1201) {weather = 'snow-storm';};
    if(code === 1087 || code === 1273) {weather = 'stormy-weather';};
    if(code === 1276) {weather = 'storm';};
    if(code === 1282) {weather = 'stormy-snow';};
    if(code === 1279) {weather = 'stormy-sun-snow';};
    if(code === 1114 || code === 1117 || code === 1213 || code === 1219  || code === 1225  || code === 1237) {weather = 'snow';};
    if(code === 1150 || code === 1153 || code === 1180 || code === 1183 || code === 1186 || code === 1189) {weather = 'rain';};
    if(code === 1195) {weather = 'heavy-reain';};
    if(code === 1204 || code === 1207) {weather = 'sleet';};
    
    console.log("Weather: "+weather);
    return weather;
  }
}
