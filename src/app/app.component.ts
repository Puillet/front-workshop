import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, BaseChartDirective, Label} from 'ng2-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  myMap: any;
  parkings: any = [];
  parking: any;
  color: any;
  parkingInput = '';

  public lineChartData: ChartDataSets[] = [
    {data: [65, 59, 80, 81, 56, 55, 40], label: 'Places occupées'},
    //{ data: [65, 59, 70, 81, 56, 55, 40], label: 'Places estimées' }
  ];
  public lineChartLabels: Label[] = ['13h', '14h', '15h', '16h', '17h', '18h', '19h'];
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgb(235,231,231)',
      borderColor: '#000000',
      pointBackgroundColor: '#000000',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.myMap = L.map('map', {zoomControl: false});
    this.myMap.setView([47.21, -1.5534], 13);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.myMap);

    return this.http.get<any>(`https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_parkings-publics-nantes-disponibilites&q=&rows=30`)
      .toPromise()
      .then(result => {
        this.parkings = result?.records;
        this.parkingMarkers();
      });
  }

  parkingMarkers() {
    return this.parkings?.map((element: any) => {
      const color = this.parkingColor(element);
      // Attribution et géolocalisation du marqueur
      if (element?.geometry?.coordinates) {
        L.marker([element.geometry.coordinates[1], element.geometry.coordinates[0]], {
          icon: L.icon({
            iconUrl: '../assets/img/parking' + color + '.svg',
            iconSize: [30, 30],
            shadowSize: [30, 30],
            iconAnchor: [15, 30]
          })
        }).on('click', (e) => {
          // Ouvrir la popup avec paramètres
          this.openPopup(e, element, color);
          // Zoom sur le marqueur au click
          this.myMap.setView([element.geometry.coordinates[1] - 0.003, element.geometry.coordinates[0]], 15);
        }).addTo(this.myMap);
      }
    });
  }

  get filteredParkings(): [] {
    return this.parkings?.filter((parking) => {
      return (parking.fields.grp_nom as string).includes(this.parkingInput);
    }) ?? [];
  }

  parkingColor(parking: any) {
    // Couleur du marqueur
    let color: string;
    let pourcentage = ((parking?.fields.grp_disponible / parking?.fields.grp_exploitation) * 100);
    if (pourcentage < 25) {
      color = 'C70039';
    } else if (pourcentage > 25 && pourcentage < 75) {
      color = 'F9813A';
    } else {
      color = '52D88A';
    }

    return color;
  }

  openPopup(e: any, parking: any, color: any) {
    console.log(parking);
    this.parking = parking;
    this.color = color;

    if (window.innerWidth < 1024) {
      const popup = document.getElementById('popup');
      if (popup) {
        popup.style.display = 'block';
      }
      const title = document.getElementById('popupHead');
      if (title) {
        title.style.backgroundColor = '#' + color;
      }
    }
  }

  closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
      popup.classList.remove('expand');
      popup.style.display = 'none';
    }
  }

  expand() {
    const popup = document.getElementById('popup');
    if (popup) {
      popup.classList.add('expand');
    }
  }

  relax() {
    const popup = document.getElementById('popup');
    if (popup) {
      popup.classList.remove('expand');
    }
  }

  location() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        console.log(latitude, longitude);
        this.myMap.setView([latitude, longitude], 17);
        L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl: '../assets/img/ellipse.svg',
            iconSize: [30, 30],
            shadowSize: [30, 30],
          })
        }).addTo(this.myMap);
      });
    }
  }
}
