import { HttpClient, HttpHeaders } from '@angular/common/http';
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


  constructor(private http: HttpClient, private geocodingService: GeocodingServiceService) { }

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
      this.getApiWeather(this.cityInfo[0].cityName);
    }else {
      this.getStorageData();
    }
    // this.getPhoto(this.cityName);
  }

  changeWeather(checked: any) {
    let val = checked.value;
    let week = JSON.parse(localStorage.getItem('weekInfo') || '[]');

    console.log("first load: "+this.firstLoad);

    if(this.firstLoad) val = '0';

      if(val === '0') {
        this.weekHighlights[0] = week[0];
      }else if(val === '1') {
        this.weekHighlights[0] = week[1];
      }else if(val === '2') {
        this.weekHighlights[0] = week[2];
      }else {
        console.log('Error with checkbox');
      }

      setTimeout(() => {
        this.progresBar(this.weekHighlights[0].uv);
      }, 300);
      this.firstLoad = false;
  }

  getStorageData() {
    let tday = JSON.parse(localStorage.getItem('tdayWeather') || '[]');
    let week = JSON.parse(localStorage.getItem('weekInfo') || '[]');

    this.weatherInfo[0] = tday;
    
    setTimeout(() => {
      this.progresBarChange(this.weatherInfo[0].uv);
    }, 300);

    for(let i = 0; i < week.length; i++) {
      if(i === 0) {
        this.weekHighlights[0] = week[0];
        setTimeout(() => {
          this.progresBar(this.weekHighlights[0].uv);
        }, 300);
      }
      this.weekInfo[i] = week[i];
    }

  }

  // API_NINJA_CITIES = 'https://api.api-ninjas.com/v1/city?name=';
  private NINJA_KEY = 'AIIJBHZf5zCVXIu0l0Qmdw==jFLheXteHMle6enk';

  API_WEATHER = 'https://api.weatherapi.com/v1/forecast.json?key=';
  private API_WEATHER_KEY = '0cecc2efe7ce4f00b06154532240501';
  API_AIR = '&aqi=yes'
  API_DAYS = '&days=7'

  getApiWeather(city: string) {
    this.weekInfo = [];
    this.weatherInfo = [];
    this.resetStorage();
    this.firstLoad = true;

    const URL = this.API_WEATHER + this.API_WEATHER_KEY + '&q=' + city + this.API_AIR + this.API_DAYS;

    this.http.get(URL).subscribe(
      (res: any) => {
        
        this.weatherInfo.push({
          currentTemp: Math.floor(res.current.temp_c),
          feelsLike: Math.floor(res.current.feelslike_c),
          localTime: this.changeFormatDate(res.location.localtime_epoch, 'time'),
          localDay: this.changeFormatDate(res.location.localtime_epoch, 'day'),
          cityFullName: res.location.country,
          description: res.current.condition.text,
          rain: res.current.precip_mm,
          uv: res.current.uv,
          windSpeed: res.current.wind_kph,
          windDirection: res.current.wind_dir,
          sunrise: res.forecast.forecastday[0].astro.sunrise,
          sunset: res.forecast.forecastday[0].astro.sunset,
          humidity: res.current.humidity,
          humidityStatus: this.setHumidityStatus(res.current.humidity)[0].status,
          humidityStatusIcon: this.setHumidityStatus(res.current.humidity)[0].icon,
          visibility: res.current.vis_km,
          visibilityStatus: this.setVisibilityStatus(res.current.vis_km)[0].status,
          visibilityStatusIcon: this.setVisibilityStatus(res.current.vis_km)[0].icon,
          air: res.current.air_quality.co.toFixed(0),
          airIndex: res.current.air_quality["us-epa-index"],
          airStatus: this.setAirStatus(res.current.air_quality["us-epa-index"])[0].status,
          airStatusIcon: this.setAirStatus(res.current.air_quality["us-epa-index"])[0].icon,
          weatherCurrentCode: res.current.condition.code,
          weatherCurrentIcon: this.chooseWeatherIcon(res.current.condition.code)
        })
        if(!localStorage.getItem('tdayWeather')) {
          localStorage.setItem('tdayWeather', JSON.stringify(this.weatherInfo[0]));
        }
        setTimeout(() => {
          this.progresBarChange(this.weatherInfo[0].uv);
        }, 300);

        for(let i = 0; i < res.forecast.forecastday.length; i++) {
          let nameShort, nameLong;
          if(i === 0) { 
            nameShort = 'Tday';
            nameLong = 'Today';
          }else {
            nameShort = this.changeDayName(res.forecast.forecastday[i].date_epoch, 'short');
            nameLong = this.changeDayName(res.forecast.forecastday[i].date_epoch, 'long');
          }

          this.weekInfo.push({
            date: res.forecast.forecastday[i].date,
            id: i,
            dayName: nameShort,
            dayNameLong: nameLong,
            dayC: Math.floor(res.forecast.forecastday[i].day.maxtemp_c),
            nightC: Math.floor(res.forecast.forecastday[i].day.mintemp_c),
            weatherCode: this.chooseWeatherIcon(res.forecast.forecastday[i].day.condition.code),
            uv: res.forecast.forecastday[i].day.uv,
            humidity: res.forecast.forecastday[i].day.avghumidity,
            humidityStatus: this.setHumidityStatus(res.forecast.forecastday[i].day.avghumidity)[0].status,
            humidityStatusIcon: this.setHumidityStatus(res.forecast.forecastday[i].day.avghumidity)[0].icon,
            windSpeed: res.forecast.forecastday[i].day.maxwind_kph,
            sunrise: res.forecast.forecastday[i].astro.sunrise,
            sunset: res.forecast.forecastday[i].astro.sunset,
            visibility: res.forecast.forecastday[i].day.avgvis_km,
            visibilityStatus: this.setVisibilityStatus(res.forecast.forecastday[i].day.avgvis_km)[0].status,
            visibilityStatusIcon: this.setVisibilityStatus(res.forecast.forecastday[i].day.avgvis_km)[0].icon
          })

          if(!localStorage.getItem('day'+i)) {
            localStorage.setItem('day'+i, JSON.stringify(this.weekInfo[i]));
          }
        }
        if(!localStorage.getItem('weekInfo')) {
          localStorage.setItem('weekInfo', JSON.stringify(this.weekInfo));
          this.changeWeather(true);
        }
      },
      (error) => {
        console.error('Error when downloading weather data:', error);
      }
    )
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
                this.getApiWeather(this.cityInfo[0].cityName);
              },300);
              setTimeout(() => {
                this.changeWeather(true);
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

  
  // getPhoto(city: string) {
  //   this.photoService.getReferencesPhotoByName(city).subscribe(
  //     (res: any) => {
  //       console.log("PhotoService: "+res.results[0]);
  //       // console.log("PhotoService: "+res.results[0].photos[0].photo_reference);

  //       this.photoService.getCityPhoto(res.results[0].photos[0].photo_reference).subscribe(
  //         (photoUrl: any) => {
  //           console.log(photoUrl); 
  //         },
  //         (error) => {console.log('Error when dowloading photo from Places API. '+error);}
  //       )
  //     },
  //     (error) => {
  //       console.log('Error when dowloading data from Places API. '+error);
  //     }
  //   )
  // }


  // API_CURRENT_WEATHER = 'http://api.openweathermap.org/data/2.5/weather?q=';
  // API_FORECAST_WEATHER = 'http://api.openweathermap.org/data/2.5/forecast?q=';
  // API_DAYS = '&cnt=1';
  // API_FORECAST_KEY = '&appid=66bcdad6e0d46da6a6d46283f4e3bad9';
  // API_UNITS = '&units=metric'

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
      'X-Api-Key': this.NINJA_KEY
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

  // getCityPhoto(city: string) {
  //   this.http.get(this.API_CITY_ID + city).subscribe(
  //     (res: any) => {
  //       this.photoLink = res._links['city:urban_area'].href;
  //       console.log(res._links['city:urban_area'].href);
  //     },
  //     (error) => {
  //       console.error('Error when downloading data:', error);
  //     }
  //   )
  // }

  resetStorage() {
    localStorage.removeItem('weekInfo');
    localStorage.removeItem('tdayWeather');
    localStorage.removeItem('day0');
    localStorage.removeItem('day1');
    localStorage.removeItem('day2');
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
    setTimeout(() => {
      this.getApiWeather(this.cityInfo[0].cityName);
    },300 );
    setTimeout(() => {
      this.changeWeather(true);
    },500 );
    this.inputText = '';
    this.citiesList = [];
  }

  changeFormatDate(date: number, format: string) {
    const utcDate = new Date(date * 1000);
    let formatedDate;

    if(format === 'time') {
      formatedDate = new Intl.DateTimeFormat('en-US', {
        hour12: true, 
        hour: 'numeric',
        minute: 'numeric'
      }).format(utcDate);
    }else {
      formatedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long'
      }).format(utcDate);
    }

    return formatedDate;
  }

  changeDayName(date: number, length: string) {
    const utcDate = new Date(date * 1000);
    let formattedDay;

    if(length === 'short') {
      formattedDay = new Intl.DateTimeFormat('en-US', {
        weekday: 'short'
      }).format(utcDate);
    }else {
       formattedDay = new Intl.DateTimeFormat('en-US', {
        weekday: 'long'
      }).format(utcDate);
    }

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
    if(code === 1195) {weather = 'heavy-rain';};
    if(code === 1204 || code === 1207) {weather = 'sleet';};
    
    return weather;
  }

  setHumidityStatus(humidity: number) {
    let humidityInfo: {status: string, icon: string}[] = [];

    if(humidity >= 0 && humidity < 40) {
      humidityInfo.push({status: 'Low ', icon: 'no'});
    }else if((humidity >= 40 && humidity < 60) || (humidity >= 80 && humidity < 90)) {
      humidityInfo.push({status: 'Average', icon: 'medium'});
    }else if(humidity >= 60 && humidity < 80) {
      humidityInfo.push({status: 'Normal', icon: 'yes'});
    }else if(humidity >= 90 && humidity <= 100) {
      humidityInfo.push({status: 'High ', icon: 'no'});
    }

    return humidityInfo;
  }

  setVisibilityStatus(visibility: number) {
    let visibilityInfo: {status: string, icon: string}[] = [];

    if(visibility >= 0 && visibility < 4)
    {
      visibilityInfo.push({status: 'Bad', icon: 'no'});
    }else if(visibility >= 4 && visibility < 10) {
      visibilityInfo.push({status: 'Average', icon: 'medium'});
    }
    else if(visibility >= 10) {
      visibilityInfo.push({status: 'Good', icon: 'yes'});
    }

    return visibilityInfo;
  }

  setAirStatus(airId: number) {
    let airInfo: {status: string, icon: string}[]= [];

    if(airId === 1) {
      airInfo.push({status: 'Good', icon: 'yes'});
    }else if(airId === 2) {
      airInfo.push({status: 'Moderate', icon: 'medium'});
    }else if(airId >= 3) {
      airInfo.push({status: 'Unhealty', icon: 'no'});
    }else {
      airInfo.push({status: 'No data', icon: 'no'});
    }

    return airInfo;
  }

  progresBarChange(uv: number) {
    let min = -45;
    let max = 16;
    let color;
    let y = min + (uv/max) *180;
    if(uv <= 2) {
      color = 'lime';
    }else if(uv > 2 && uv <= 5) {
      color = 'yellow';
    }else if(uv > 5 && uv <= 7) {
      color = 'orange';
    }else if(uv > 7 && uv <= 10) {
      color = 'red';
    }else if(uv > 10) {
      color = 'purple';
    }
    if(document.getElementById('progres-1')) {
      document.getElementById('progres-1')!.style.transform = `rotate(${y}deg)`
      document.getElementById('progres-1')!.style.borderColor = `#ddd #ddd ${color} ${color}`;
    }else {
      console.log('Error with getElById progress-1');
    }
  }

  progresBar(uv: number) {
    let min = -45;
    let max = 16;
    let color;
    let y = min + (uv/max) *180;
    if(uv <= 2) {
      color = 'lime';
    }else if(uv > 2 && uv <= 5) {
      color = 'yellow';
    }else if(uv > 5 && uv <= 7) {
      color = 'orange';
    }else if(uv > 7 && uv <= 10) {
      color = 'red';
    }else if(uv > 10) {
      color = 'purple';
    }
    if(document.getElementById('progres-2')){
      document.getElementById('progres-2')!.style.transform = `rotate(${y}deg)`
      document.getElementById('progres-2')!.style.borderColor = `#ddd #ddd ${color} ${color}`;
    }else {
      console.log('Error with getElById progress-2');
    }
  }
}
