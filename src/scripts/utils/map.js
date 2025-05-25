import { map, tileLayer, marker, icon, popup } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MAP_SERVICE_API_KEY } from '../config';

export default class Map {
  #zoom = 5;
  #map = null;

  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
   * Reference of using this static method:
   * https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   * */
  static async build(selector, options = {}) {
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    // const jakartaCoordinate = [-6.2, 106.816666];
    const pontianakCoordinate = [-0.026510995211146818, 109.34283536071001];

    // Using Geolocation API
    if ('locate' in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error('build: error:', error);

        return new Map(selector, {
          ...options,
          center: pontianakCoordinate,
        });
      }
    }

    return new Map(selector, {
      ...options,
      center: pontianakCoordinate,
    });
  }

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    const tileOsm = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [tileOsm],
      ...options,
    });

    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.#map.invalidateSize(); // Mengatur ulang ukuran peta
      }, 200); // delay kecil agar resize smooth
    });
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(L.latLng(coordinate), this.#zoom);
      return;
    }
    this.#map.setView(L.latLng(coordinate), zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  createIcon(options = {}) {
    return icon({
      iconUrl: markerIcon, // Gambar marker untuk ikon
      iconRetinaUrl: markerIcon2x, // Gambar marker 2x resolusi tinggi
      shadowUrl: markerShadow, // Gambar bayangan marker
      ...options, // Menambahkan opsi tambahan yang diteruskan dari luar
    });
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }

    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    if (popupOptions && typeof popupOptions === 'object' && 'content' in popupOptions) {
      newMarker.bindPopup(popupOptions.content);
    }

    newMarker.addTo(this.#map);

    this.#map.fitBounds([coordinates], { padding: [50, 50] });
    return newMarker;
  }

  static async getPlaceNameByCoordinate(lat, lon) {
    const API_KEY = MAP_SERVICE_API_KEY;
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${API_KEY}`,
      );
      const result = await response.json();

      if (result.features && result.features.length > 0) {
        const place = result.features[0].place_name;
        return place.split(',').slice(0, 2).join(',').trim();
      }

      return `${lat}, ${lon}`;
    } catch (error) {
      console.error('Gagal mendapatkan nama lokasi:', error);
      return `${lat}, ${lon}`;
    }
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }
}
