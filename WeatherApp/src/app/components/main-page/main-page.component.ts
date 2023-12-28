import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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

}
