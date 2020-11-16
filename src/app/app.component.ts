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

    var myIcon = L.icon({
      iconUrl: '../assets/img/ellipse.svg',
      iconSize: [38, 95],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
  });

    L.marker([47.2173, -1.5534], {icon: myIcon}).on('click', this.openPopup).addTo(myMap);
  }

  closePopup() {
    const popup = document.getElementById('popup');
    if(popup) {
      popup.style.display = 'none';
    }
  }

  openPopup() {
    const popup = document.getElementById('popup');
    if(popup) {
      popup.style.display = 'block';
    }
  }
}
