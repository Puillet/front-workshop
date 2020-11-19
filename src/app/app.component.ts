import {Component, OnInit, ViewChild} from '@angular/core';
import * as L from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, BaseChartDirective, Label} from 'ng2-charts';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat)

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
  estimation: any;
  parkingInput = '';

  lineChartData: ChartDataSets[] = [
    { data: [], label: 'Places occupées' }
  ];
  lineChartLabels: Label[] = [];
  lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgb(235,231,231)',
      borderColor: '#000000',
      pointBackgroundColor: '#000000',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  lineChartLegend = true;
  lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective | undefined;

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.myMap = L.map('map', {zoomControl: false});
    this.myMap.setView([47.21, -1.5534], 13);

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.myMap);

    this.http.get<any>(`https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_parkings-publics-nantes-disponibilites&q=&rows=30`).subscribe(
      res => {
        this.parkings = res?.records;
        res?.records.forEach((element: any) => {
          // Couleur du marqueur
          let color = this.getColor((element?.fields.grp_disponible / element?.fields.grp_exploitation) * 100);
          // Attribution et géolocalisation du marqueur
          if (element?.geometry?.coordinates) {
            L.marker([element.geometry.coordinates[1], element.geometry.coordinates[0]], {
              icon: L.icon({
                iconUrl: '../assets/img/parking' + color + '.svg',
                iconSize: [40, 40],
                shadowSize: [40, 40],
                iconAnchor: [20, 40]
              })
            }).on('click', () => {
              // Ouvrir la popup avec paramètres
              this.openPopup(element);
            }).addTo(this.myMap);
          }
        });
      }
    );
  }

  get filteredParkings(): any [] {
    return this.parkings?.filter((parking: { fields: { grp_nom: string; }; }) => {
      return (parking.fields.grp_nom as string).toLowerCase().includes(this.parkingInput.toLowerCase());
    }) ?? [];
  }

  openPopup(parking: any) {
    this.parkingInput = '';
    this.estimation = '';
    let color = this.getColor((parking?.fields.grp_disponible / parking?.fields.grp_exploitation) * 100);
    this.parking = parking;

    // Zoom sur le marqueur au click
    this.myMap.setView([parking.geometry.coordinates[1] - 0.003, parking.geometry.coordinates[0]], 15);

    // Récupérer données stats
    this.http.get<any>(`http://172.16.7.22:5000/${parking?.fields.idobj}`).subscribe(
      res => {
        this.estimation = res.data.estimate;
        this.lineChartData[0].data = [];
        this.lineChartLabels = [];

        res.data.last_records.reverse().forEach((element: any) => {
          this.lineChartData[0].data?.push(element.nbr_places_occupees);
          const hour = dayjs(element.date, 'DD/MM/YYYY HH:mm:ss').hour();
          this.lineChartLabels.push(hour.toString() + 'h');
        });

        this.chart?.update();
      },
      err => {
        console.log(err);
      });

    // Ouvrir popup
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

  getColor(pourcentage: any) {
    if (pourcentage < 25) {
      return 'C70039';
    } else if (pourcentage > 25 && pourcentage < 75) {
      return 'F9813A';
    } else {
      return '52D88A';
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
