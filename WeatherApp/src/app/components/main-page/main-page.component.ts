import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  inputText = '';
  citiesList: any[]= [];
  cityName: string[] = [];
  cityFullName: string = '';
  cityId: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // this.fetchCitiesData();
  }

  dailyInfo = [
    { day: 'Sun', img: '/assets/icons-colour/sun.png', dayC: '15', nightC: '3' },
    { day: 'Mon', img: '/assets/icons-colour/clouds.png', dayC: '12', nightC: '7' },
    { day: 'Tue', img: '/assets/icons-colour/rain-cloud.png', dayC: '9', nightC: '7' },
    { day: 'Wed', img: '/assets/icons-colour/rain.png', dayC: '8', nightC: '-1' },
    { day: 'Thu', img: '/assets/icons-colour/sun.png', dayC: '5', nightC: '-2' },
    { day: 'Fri', img: '/assets/icons-colour/storm.png', dayC: '4', nightC: '-4' },
    { day: 'Sat', img: '/assets/icons-colour/partly-cloudy.png', dayC: '3', nightC: '-3' }
  ]

  API_CITIES = 'https://api.teleport.org/api/cities/?search=';

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

  getCities(query: string): Observable<any> {
    return this.http.get(this.API_CITIES + query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((res: any) => {
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
        console.error('Błąd w czasie pobierania danych:', error);
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

  chosenCity(city: string) {
    console.log("Wybrane miasto: " + city);
    this.cityFullName = city;
    this.cityName = city.split(",", 1);
    this.inputText = '';
    this.citiesList = [];
  }

}
