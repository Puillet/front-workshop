import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  ngOnInit() {
    const myMap = L.map('map', {zoomControl: false}).setView([47.2173, -1.5534], 11);
 
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(myMap);
  }
}
