import { Component } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  parkings: any;
  parking: any;
  color: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    const myMap = L.map('map', {zoomControl: false}).setView([47.21, -1.5534], 13);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map'
    }).addTo(myMap);

    let promise = new Promise((resolve, reject) => {
      this.http.get<any>(`https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_parkings-publics-nantes-disponibilites&q=&rows=30`)
        .toPromise()
        .then(
          res => {
            console.log(res.records);
            this.parkings = res?.records;
            this.parkings.forEach((element: any) => {
              // Couleur du marqueur
              let color: string;
              if(element?.fields.grp_disponible < 50) {
                color = 'C70039';
              } else if(element?.fields.grp_disponible > 50 && element?.fields.grp_disponible < 100) {
                color = 'F9813A';
              } else {
                color = '52D88A';
              }

              // Attribution et géolocalisation du marqueur
              if(element?.geometry?.coordinates) {
                L.marker([element.geometry.coordinates[1], element.geometry.coordinates[0]], {
                  icon: L.icon({
                    iconUrl: '../assets/img/ellipse'+color+'.svg',
                    iconSize: [30, 30],
                    shadowSize: [30, 30],
                  })}).on('click', (e) => { this.openPopup(e, element, color) }).addTo(myMap);
              }
            });
          },
          msg => { reject(msg) }
        );
    });
    return promise;
  }

  openPopup(e: any, parking: any, color: any) {
    console.log(parking);
    this.parking = parking;
    this.color = color;
    const popup = document.getElementById('popup');
    if(popup) {
      popup.style.display = 'block';
    }
    const title = document.getElementById('popupHead');
    if(title) {
      title.style.backgroundColor = '#'+color;
    }
  }

  closePopup() {
    const popup = document.getElementById('popup');
    if(popup) {
      popup.classList.remove('expand');
      popup.style.display = 'none';
    }
  }

  expand() {
    const popup = document.getElementById('popup');
    if(popup) {
      popup.classList.add('expand');
    }
  }

  relax() {
    const popup = document.getElementById('popup');
    if(popup) {
      popup.classList.remove('expand');
    }
  }
}
