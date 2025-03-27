// In your Angular service or component:
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverpassService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private http: HttpClient) {}

  searchOverpass(searchText: string, city: string, lat: number, lng: number, distanceKm: number) {
    // distance in meters
    const distanceMeters = distanceKm * 1000;

    // For partial match, remove ^ and $
    // For exact match, use e.g. ["name"~"^Cafe Starbucks$", i]
    const query = `
[out:json];
(
  node["name"~"${searchText}", i]["addr:city"="${city}"](around:${distanceMeters},${lat},${lng});
  way["name"~"${searchText}", i]["addr:city"="${city}"](around:${distanceMeters},${lat},${lng});
  relation["name"~"${searchText}", i]["addr:city"="${city}"](around:${distanceMeters},${lat},${lng});
);
out center;
`;

    return this.http.post(this.overpassUrl, query, {
      // Overpass returns JSON if we specify [out:json];
      // We can tell HttpClient we expect JSON
      responseType: 'json'
    });
  }
}