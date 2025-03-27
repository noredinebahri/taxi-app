import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
declare module 'leaflet-routing-machine';

@Component({
  selector: 'app-simple-map',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="map-container">
      <!-- Search Bar (Google Maps Style) -->
      <div class="search-box">
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5F6368">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <input
          type="text"
          class="search-input"
          placeholder="Search places"
          [(ngModel)]="searchText"
          (input)="getSuggestions()"
          (focus)="showSuggestions = placeSuggestions.length > 0"
        />
        <div class="search-buttons">
          <button *ngIf="searchText" class="clear-button" (click)="clearSearch()">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5F6368">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </button>
          <div class="divider"></div>
          <button class="microphone-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#4285F4">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>
        </div>

        <!-- Search Suggestions -->
        <div class="suggestions-container" *ngIf="showSuggestions && placeSuggestions.length > 0">
          <div class="suggestion-item" *ngFor="let place of placeSuggestions" (click)="selectSuggestion(place)">
            <div class="suggestion-icon">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#5F6368">
                <path d="M0 0h24v24H0V0z" fill="none"/>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <div class="suggestion-details">
              <div class="suggestion-name">{{ place.properties.name || 'No Name' }}</div>
              <div class="suggestion-address">
                {{ place.properties.street || '' }}{{ place.properties.street && place.properties.city ? ', ' : '' }}{{ place.properties.city || '' }}
              </div>
            </div>
            <div class="suggestion-distance" *ngIf="place.distance">
              {{ place.distance.toFixed(1) }} km
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Control Panel -->
      <div class="bottom-controls">
        <div class="control-button find-location" (click)="detectCurrentLocation()">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666666">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </div>
        
        <div class="control-button-group">
          <div class="control-button zoom-in" (click)="zoomIn()">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666666">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
          <div class="control-button zoom-out" (click)="zoomOut()">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#666666">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Taxi Controls Slide Panel -->
      <div class="side-panel" [class.open]="isPanelOpen">
        <div class="panel-handle" (click)="togglePanel()">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5F6368" *ngIf="!isPanelOpen">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5F6368" *ngIf="isPanelOpen">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
          </svg>
        </div>
        
        <div class="panel-content">
          <h2>Find Taxi</h2>
          
          <div class="input-group">
            <label for="radius">Search Radius</label>
            <div class="slider-container">
              <input 
                type="range" 
                id="radius" 
                min="1" 
                max="20" 
                [(ngModel)]="searchRadius"
                (change)="updateSearchCircle()"
              >
              <div class="slider-value">{{ searchRadius }} km</div>
            </div>
          </div>
          
          <button class="action-button" (click)="searchDrivers()">
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#FFFFFF">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
            Find Taxis
          </button>
          
          <button class="secondary-button" (click)="mockDrivers()">
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#1A73E8">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            Demo Mode
          </button>
          
          <button class="clear-button" (click)="clearRoute()">
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#5F6368">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
            Clear Route
          </button>
          
          <!-- Drivers List -->
          <div class="drivers-container" *ngIf="drivers.length > 0">
            <h3>Available Taxis ({{drivers.length}})</h3>
            <div class="driver-list">
              <div class="driver-card" *ngFor="let driver of drivers" (click)="focusOnDriver(driver)">
                <div class="driver-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FF9800">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                </div>
                <div class="driver-info">
                  <div class="driver-name">{{driver.full_name}}</div>
                  <div class="driver-details">
                    <span *ngIf="driver.distance">{{driver.distance}} km away</span>
                    <span *ngIf="driver.vehicle"> • {{driver.vehicle.make}} {{driver.vehicle.model}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="error" class="error-message">
            {{error}}
          </div>
        </div>
      </div>

      <!-- Map Element -->
      <div id="map" class="map"></div>
    </div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      height: 100vh;
      position: relative;
      overflow: hidden;
      font-family: 'Roboto', Arial, sans-serif;
    }

    .map {
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    /* Google-style search box */
    .search-box {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      padding: 0 15px;
      height: 48px;
      z-index: 1000;
    }

    .search-icon {
      margin-right: 12px;
    }

    .search-input {
      flex-grow: 1;
      border: none;
      height: 100%;
      font-size: 16px;
      outline: none;
    }

    .search-buttons {
      display: flex;
      align-items: center;
    }

    .clear-button, .microphone-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .divider {
      width: 1px;
      height: 24px;
      background-color: #e0e0e0;
      margin: 0 8px;
    }

    /* Suggestions dropdown */
    .suggestions-container {
      position: absolute;
      top: 56px;
      left: 0;
      right: 0;
      background: white;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-height: 50vh;
      overflow-y: auto;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      cursor: pointer;
      border-bottom: 1px solid #f1f1f1;
    }

    .suggestion-item:hover {
      background-color: #f8f9fa;
    }

    .suggestion-icon {
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .suggestion-details {
      flex-grow: 1;
    }

    .suggestion-name {
      font-size: 14px;
      color: #202124;
    }

    .suggestion-address {
      font-size: 12px;
      color: #5F6368;
      margin-top: 2px;
    }

    .suggestion-distance {
      font-size: 12px;
      color: #1A73E8;
      font-weight: 500;
      margin-left: 8px;
    }

    /* Bottom controls */
    .bottom-controls {
      position: absolute;
      right: 10px;
      bottom: 92px;
      z-index: 500;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-button {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .control-button:hover {
      background-color: #f8f9fa;
    }

    .control-button-group {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .control-button-group .control-button {
      box-shadow: none;
      border-radius: 0;
      border-bottom: 1px solid #f1f1f1;
    }

    .control-button-group .control-button:last-child {
      border-bottom: none;
    }

    /* Side panel for taxi controls */
    .side-panel {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: white;
      width: 350px;
      z-index: 1000;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    .side-panel.open {
      transform: translateX(0);
    }

    .panel-handle {
      position: absolute;
      right: -40px;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 0 8px 8px 0;
      box-shadow: 2px 0 6px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .panel-content {
      padding: 20px;
      height: 100%;
      overflow-y: auto;
    }

    .panel-content h2 {
      font-size: 20px;
      color: #202124;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-group label {
      display: block;
      font-size: 14px;
      color: #5F6368;
      margin-bottom: 8px;
    }

    .slider-container {
      display: flex;
      align-items: center;
    }

    .slider-container input[type="range"] {
      flex-grow: 1;
      height: 2px;
      -webkit-appearance: none;
      background: #dadce0;
      outline: none;
    }

    .slider-container input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #1A73E8;
      cursor: pointer;
    }

    .slider-value {
      margin-left: 16px;
      font-size: 14px;
      color: #5F6368;
      width: 50px;
    }

    .action-button {
      background-color: #1A73E8;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0 24px;
      height: 40px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 12px;
    }

    .action-button svg {
      margin-right: 8px;
    }

    .action-button:hover {
      background-color: #1765cc;
    }

    .secondary-button {
      background-color: #e8f0fe;
      color: #1A73E8;
      border: none;
      border-radius: 4px;
      padding: 0 24px;
      height: 40px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 12px;
    }

    .secondary-button svg {
      margin-right: 8px;
    }

    .secondary-button:hover {
      background-color: #d4e4fc;
    }

    .clear-button {
      background-color: transparent;
      color: #5F6368;
      border: 1px solid #dadce0;
      border-radius: 4px;
      padding: 0 24px;
      height: 40px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin-bottom: 12px;
    }

    .clear-button svg {
      margin-right: 8px;
    }

    .clear-button:hover {
      background-color: #f8f9fa;
    }

    /* Drivers list */
    .drivers-container {
      margin-top: 20px;
    }

    .drivers-container h3 {
      font-size: 16px;
      color: #202124;
      margin-top: 0;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .driver-list {
      max-height: calc(100vh - 350px);
      overflow-y: auto;
    }

    .driver-card {
      display: flex;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      border: 1px solid transparent;
    }

    .driver-card:hover {
      border-color: #dadce0;
      background-color: #f1f3f4;
    }

    .driver-icon {
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .driver-info {
      flex-grow: 1;
    }

    .driver-name {
      font-size: 14px;
      font-weight: 500;
      color: #202124;
    }

    .driver-details {
      font-size: 12px;
      color: #5F6368;
      margin-top: 4px;
    }

    .error-message {
      margin-top: 20px;
      padding: 12px;
      background-color: #fce8e6;
      color: #c5221f;
      border-radius: 4px;
      font-size: 14px;
    }

    /* Make leaflet controls match Google Maps style */
    :host ::ng-deep .leaflet-control-container .leaflet-control {
      border-radius: 8px !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
      border: none !important;
    }

    :host ::ng-deep .leaflet-control-attribution {
      background: rgba(255, 255, 255, 0.8) !important;
      padding: 2px 8px !important;
      font-size: 10px !important;
      color: #666 !important;
    }

    /* Hide the routing panel */
    :host ::ng-deep .leaflet-routing-container, 
    :host ::ng-deep .leaflet-routing-alternatives-container {
      display: none !important;
    }
  `]
})
export class SimpleMapComponent implements AfterViewInit {
  map!: L.Map;
  routingControl: L.Routing.Control | null = null;

  userCurrentPosition: GeolocationPosition | null = null;
  userMarker: L.Marker | null = null;
  driverMarkers: L.Marker[] = [];
  searchCircle: L.Circle | null = null;
  userCity = 'Casablanca';

  userLatitude = 33.5731;   // Default: Casablanca
  userLongitude = -7.5898;
  searchRadius = 10;       // Default 10km radius
  distanceKm = 10;
  places: any[] = [];
  placeSuggestions: any[] = [];
  showSuggestions: boolean = false;
  searchText = '';
  isPanelOpen = false;
  private searchTimeout: any;

  drivers: any[] = [];
  error = '';
  selectedPlace: any = null;
  placeMarkers: L.Marker[] = [];

  // Custom SVG for taxi marker
  private taxiSvg = `
    <svg width="32" height="32" viewBox="0 0 512 512" fill="#FF9800" xmlns="http://www.w3.org/2000/svg">
      <path d="M152 64l24-24h160l24 24h48c17.7 0 32 14.3 32 32v64l16 16v192h-48l-16 64H96l-16-64H32V176l16-16V96c0-17.7 14.3-32 32-32h72zm32 32v32h144V96H184zm240 224v-48H88v48h336zm-64 80l8-32H104l8 32h248z"/>
    </svg>
  `;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    // Initialize the map with Google Maps-like style
    this.map = L.map('map', {
      zoomControl: false,  // Disable default zoom control
      attributionControl: true
    }).setView([this.userLatitude, this.userLongitude], 13);
    
    // Use a clean map style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);
    
    // Automatically detect user location on startup
    this.detectCurrentLocation();
  }

  togglePanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
  }

  clearSearch(): void {
    this.searchText = '';
    this.showSuggestions = false;
    this.clearPlaceMarkers();
  }

  zoomIn(): void {
    this.map.zoomIn();
  }

  zoomOut(): void {
    this.map.zoomOut();
  }

  detectCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.error = 'Geolocation is not supported by this browser.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userCurrentPosition = position;
        this.userLatitude = position.coords.latitude;
        this.userLongitude = position.coords.longitude;
        this.updateUserLocation();
        this.map.setView([this.userLatitude, this.userLongitude], 15);
        // Optional: automatically search for drivers near the user
        this.mockDrivers();
      },
      (err) => {
        console.error('Error getting location:', err);
        this.error = 'Could not detect your location. Error: ' + err.message;
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }

  getSuggestions(): void {
    // Delay the search slightly to avoid making too many requests while typing
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchForSuggestions();
    }, 300);
  }

  searchForSuggestions(): void {
    if (!this.searchText || this.searchText.length < 2) {
      this.showSuggestions = false;
      return;
    }

    // Use Photon API for place suggestions
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(this.searchText)}&lat=${this.userLatitude}&lon=${this.userLongitude}&limit=10&lang=fr`;

    this.http.get(url).subscribe(
      (response: any) => {
        if (response && response.features && response.features.length > 0) {
          // Filter out highways and roads
          let features = response.features.filter((feature: any) => {
            const properties = feature.properties;
            // Only include non-road features
            return !properties.highway && properties.type !== 'street';
          });

          // Calculate distance for each place
          features = features.map((feature: any) => {
            const coordinates = feature.geometry.coordinates;
            const lng = coordinates[0];
            const lat = coordinates[1];
            
            const distance = this.calculateDistance(
              this.userLatitude, 
              this.userLongitude,
              lat,
              lng
            );
            
            return {
              ...feature,
              distance: distance
            };
          });

          // Sort by distance
          features.sort((a: any, b: any) => a.distance - b.distance);

          this.placeSuggestions = features;
          this.showSuggestions = features.length > 0;
        } else {
          this.showSuggestions = false;
        }
      },
      error => {
        console.error('Error searching places:', error);
        this.showSuggestions = false;
      }
    );
  }

  selectSuggestion(place: any): void {
    this.searchText = place.properties.name || 'Selected Place';
    this.showSuggestions = false;
    this.selectedPlace = place;
    
    // Clear existing place markers
    this.clearPlaceMarkers();
    
    // Get coordinates
    const coordinates = place.geometry.coordinates;
    const lng = coordinates[0];
    const lat = coordinates[1];
    
    // Add marker for the selected place
    const placeIcon = L.divIcon({
      html: `
        <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#DB4437">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
      `,
      className: 'place-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
    
    const placeMarker = L.marker([lat, lng], { icon: placeIcon })
      .addTo(this.map)
      .bindPopup(`
        <div class="place-popup" style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">${place.properties.name || 'Selected Place'}</h3>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #5F6368;">
            ${place.properties.street || ''} ${place.properties.city || ''}
          </p>
          <p style="margin: 0; font-size: 14px; color: #1A73E8;">
            ${place.distance.toFixed(2)} km from your location
          </p>
          <div style="margin-top: 12px;">
            <button 
              style="background: #1A73E8; color: white; border: none; border-radius: 4px; padding: 8px 16px; font-size: 14px; cursor: pointer; width: 100%;">
              Directions
            </button>
          </div>
        </div>
      `);
    
    this.placeMarkers.push(placeMarker);
    
    // Center map on the selected place
    this.map.setView([lat, lng], 16);
    
    // If user location is available, create a route
    if (this.userMarker) {
      this.createRouteToPlace(lat, lng, place.properties.name || 'Selected Place');
    }
  }

  clearPlaceMarkers(): void {
    this.placeMarkers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.placeMarkers = [];
  }

  createRouteToPlace(lat: number, lng: number, placeName: string): void {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }

    this.routingControl = L.Routing.control({
      waypoints: [
        L.latLng(this.userLatitude, this.userLongitude),
        L.latLng(lat, lng)
      ],
      show: false,
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        extendToWaypoints: true,
        missingRouteTolerance: 10,
        styles: [{ color: '#4285F4', weight: 5, opacity: 0.8 }]
      }
    }).addTo(this.map);

    this.routingControl.on('routesfound', (e: any) => {
      const route = e.routes[0];
      const distance = route.summary.totalDistance / 1000;
      const estimatedTimeMinutes = Math.round(route.summary.totalTime / 60);
      
      // Google Maps style info card
      const routeInfoCard = L.DomUtil.create('div', 'route-info-card');
      routeInfoCard.innerHTML = `
        <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); min-width: 200px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#1A73E8" style="margin-right: 8px;">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <strong style="font-size: 14px;">${placeName}</strong>
          </div>
          <div style="font-size: 20px; font-weight: 500; color: #202124; margin-bottom: 4px;">
            ${estimatedTimeMinutes} min
          </div>
          <div style="font-size: 14px; color: #5F6368;">
            ${distance.toFixed(1)} km via fastest route
          </div>
        </div>
      `;
      
      // Add route information to the side panel instead of a popup
      const infoContainer = document.querySelector('.panel-content');
      if (infoContainer) {
        const existingInfo = infoContainer.querySelector('.route-info-card');
        if (existingInfo) {
          infoContainer.removeChild(existingInfo);
        }
        infoContainer.prepend(routeInfoCard);
        
        // Open the panel to show the route info
        this.isPanelOpen = true;
      }
    });
  }
  
  searchPlaces(): void {
    if (!this.searchText || this.searchText.length < 2) {
      this.error = "Please enter at least 2 characters to search";
      return;
    }
    
    // Clear any existing place markers
    this.clearPlaceMarkers();
    
    // Use Photon API which works well for place search and sorts by proximity
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(this.searchText)}&lat=${this.userLatitude}&lon=${this.userLongitude}&limit=20&lang=fr`;
    
    this.http.get(url).subscribe(
      (response: any) => {
        if (response && response.features && response.features.length > 0) {
          // Filter out highways and roads
          let places = response.features.filter((feature: any) => {
            const properties = feature.properties;
            // Only include non-road features
            return !properties.highway && properties.type !== 'street';
          });
          
          // Calculate distance for each place
          places = places.map((place: any) => {
            const coordinates = place.geometry.coordinates;
            const lng = coordinates[0];
            const lat = coordinates[1];
            
            const distance = this.calculateDistance(
              this.userLatitude, 
              this.userLongitude,
              lat,
              lng
            );
            
            return {
              ...place,
              distance: distance
            };
          });
          
          // Sort by distance
          places.sort((a: any, b: any) => a.distance - b.distance);
          
          if (places.length > 0) {
            this.places = places;
            
            // Create custom place icon
            const placeIcon = L.divIcon({
              html: `
                <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
                  <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#DB4437">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </div>
              `,
              className: 'place-marker',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32]
            });
            
            places.forEach((place: any) => {
              const coordinates = place.geometry.coordinates;
              const lng = coordinates[0];
              const lat = coordinates[1];
              
              // Create a marker for this place
              const placeMarker = L.marker([lat, lng], { icon: placeIcon })
                .addTo(this.map)
                .bindPopup(`
                  <div class="place-popup" style="padding: 10px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px;">${place.properties.name || 'Unknown Place'}</h3>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #5F6368;">
                      ${place.properties.street ? place.properties.street + ', ' : ''}${place.properties.city || ''}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #1A73E8;">
                      ${place.distance.toFixed(2)} km from your location
                    </p>
                    <div style="margin-top: 12px;">
                      <button
                        onclick="document.dispatchEvent(new CustomEvent('getDirections', {detail: {lat: ${lat}, lng: ${lng}, name: '${place.properties.name || 'Selected Place'}'}}))"
                        style="background: #1A73E8; color: white; border: none; border-radius: 4px; padding: 8px 16px; font-size: 14px; cursor: pointer; width: 100%;">
                        Directions
                      </button>
                    </div>
                  </div>
                `);
              
              this.placeMarkers.push(placeMarker);
            });
            
            // Fit the map to show all place markers
            if (this.placeMarkers.length > 0) {
              const group = L.featureGroup(this.placeMarkers);
              this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }
          } else {
            this.error = `No places found matching "${this.searchText}". Try a different search term.`;
            this.places = [];
          }
        } else {
          this.error = `No places found matching "${this.searchText}". Try a different search term.`;
          this.places = [];
        }
      },
      error => {
        console.error('Error searching places:', error);
        this.error = 'Failed to search places. Please try again.';
      }
    );
  }

   
   updateUserLocation(): void {
     if (this.userMarker) {
       this.map.removeLayer(this.userMarker);
     }
     
     // Create Google Maps style blue dot for user location
     const userIcon = L.divIcon({
       html: `
         <div style="
           background-color: #4285F4;
           width: 16px;
           height: 16px;
           border-radius: 50%;
           border: 3px solid white;
           box-shadow: 0 0 3px rgba(0,0,0,0.3);
         "></div>
       `,
       className: 'user-location-marker',
       iconSize: [22, 22],
       iconAnchor: [11, 11]
     });
 
     this.userMarker = L.marker([this.userLatitude, this.userLongitude], { icon: userIcon })
       .addTo(this.map);
 
     this.updateSearchCircle();
   }
 
   updateSearchCircle(): void {
     if (this.searchCircle) {
       this.map.removeLayer(this.searchCircle);
     }
     this.searchCircle = L.circle([this.userLatitude, this.userLongitude], {
       radius: this.searchRadius * 1000,
       color: '#4285F4',
       fillColor: '#4285F4',
       fillOpacity: 0.08,
       weight: 1
     }).addTo(this.map);
   }
 
   searchDrivers(): void {
     this.error = '';
     this.clearDriverMarkers();
     this.updateUserLocation();
 
     // In a real app, you would call your API here
     // For now, we're just using mock data
     this.mockDrivers();
   }
 
   clearDriverMarkers(): void {
     this.driverMarkers.forEach(marker => this.map.removeLayer(marker));
     this.driverMarkers = [];
   }
 
   addDriverMarkers(): void {
     // Create a Google Maps style taxi icon
     const taxiIcon = L.divIcon({
       html: `
         <div style="background-color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
           <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FF9800">
             <path d="M0 0h24v24H0V0z" fill="none"/>
             <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
           </svg>
         </div>
       `,
       className: 'taxi-icon',
       iconSize: [36, 36],
       iconAnchor: [18, 18]
     });
 
     this.drivers.forEach(driver => {
       const marker = L.marker([driver.latitude, driver.longitude], { icon: taxiIcon })
         .addTo(this.map)
         .bindPopup(`
           <div style="padding: 10px; min-width: 200px;">
             <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #202124;">${driver.full_name}</h3>
             <p style="margin: 0 0 5px 0; font-size: 14px; color: #5F6368;">
               ${driver.distance} km away
             </p>
             ${driver.vehicle
               ? `<p style="margin: 0 0 12px 0; font-size: 14px; color: #5F6368;">
                   ${driver.vehicle.make} ${driver.vehicle.model} • ${driver.vehicle.vehicle_type}
                 </p>`
               : ''
             }
             <button style="background: #1A73E8; color: white; border: none; border-radius: 4px; padding: 8px 16px; font-size: 14px; cursor: pointer; width: 100%;">
               Request Ride
             </button>
           </div>
         `);
       this.driverMarkers.push(marker);
     });
 
     if (this.driverMarkers.length > 0) {
       const group = new L.FeatureGroup([this.userMarker!, ...this.driverMarkers]);
       this.map.fitBounds(group.getBounds(), { padding: [100, 100] });
     }
   }
 
   focusOnDriver(driver: any): void {
     const index = this.drivers.findIndex(d => d.driver_id === driver.driver_id);
     if (index >= 0 && index < this.driverMarkers.length) {
       const marker = this.driverMarkers[index];
       this.map.setView([driver.latitude, driver.longitude], 15);
       marker.openPopup();
       this.createRouteToDriver(driver);
     }
   }
 
   createRouteToDriver(driver: any): void {
     if (this.routingControl) {
       this.map.removeControl(this.routingControl);
       this.routingControl = null;
     }
 
     this.routingControl = L.Routing.control({
       waypoints: [
         L.latLng(this.userLatitude, this.userLongitude),
         L.latLng(driver.latitude, driver.longitude)
       ],
       show: false,
       routeWhileDragging: false,
       addWaypoints: false,
       lineOptions: {
         extendToWaypoints: true,
         missingRouteTolerance: 10,
         styles: [{ color: '#4285F4', weight: 5, opacity: 0.8 }]
       }
     }).addTo(this.map);
 
     this.routingControl.on('routesfound', (e: any) => {
       const route = e.routes[0];
       const distance = route.summary.totalDistance / 1000;
       const estimatedTimeMinutes = Math.round(route.summary.totalTime / 60);
       
       // Google Maps style info card
       const routeInfoCard = L.DomUtil.create('div', 'route-info-card');
       routeInfoCard.innerHTML = `
         <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); min-width: 200px;">
           <div style="display: flex; align-items: center; margin-bottom: 8px;">
             <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#FF9800" style="margin-right: 8px;">
               <path d="M0 0h24v24H0V0z" fill="none"/>
               <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
             </svg>
             <strong style="font-size: 14px;">Taxi to ${driver.full_name}</strong>
           </div>
           <div style="font-size: 20px; font-weight: 500; color: #202124; margin-bottom: 4px;">
             ${estimatedTimeMinutes} min
           </div>
           <div style="font-size: 14px; color: #5F6368;">
             ${distance.toFixed(1)} km • Arrives in ${estimatedTimeMinutes} min
           </div>
           <button 
             style="background: #1A73E8; color: white; border: none; border-radius: 4px; padding: 8px 16px; font-size: 14px; cursor: pointer; width: 100%; margin-top: 12px;">
             Request Ride
           </button>
         </div>
       `;
       
       // Add route information to the side panel
       const infoContainer = document.querySelector('.panel-content');
       if (infoContainer) {
         const existingInfo = infoContainer.querySelector('.route-info-card');
         if (existingInfo) {
           infoContainer.removeChild(existingInfo);
         }
         infoContainer.prepend(routeInfoCard);
         
         // Open the panel to show the route info
         this.isPanelOpen = true;
       }
     });
   }
 
   clearRoute(): void {
     if (this.routingControl) {
       this.map.removeControl(this.routingControl);
       this.routingControl = null;
     }
     
     // Also remove any route info card from the panel
     const infoContainer = document.querySelector('.panel-content');
     if (infoContainer) {
       const existingInfo = infoContainer.querySelector('.route-info-card');
       if (existingInfo) {
         infoContainer.removeChild(existingInfo);
       }
     }
   }
 
   mockDrivers(): void {
     this.error = '';
     this.clearDriverMarkers();
     this.updateUserLocation();
 
     const testDrivers = [
       {
         driver_id: "DRV-002",
         full_name: "Fatima Benani",
         email: "fatima.b@example.com",
         phone_number: "+212622222222",
         latitude: this.userLatitude + 0.003,  // ~300m north
         longitude: this.userLongitude + 0.002, // ~200m east
         is_available: true,
         vehicle: { 
           make: "Honda", 
           model: "Accord", 
           vehicle_type: "SEDAN",
           year: 2021,
           license_plate: "B-222-33",
           passenger_capacity: 4
         }
       },
       {
         driver_id: "DRV-003",
         full_name: "Karim Tazi",
         email: "karim.t@example.com",
         phone_number: "+212633333333",
         latitude: this.userLatitude - 0.002,  // ~200m south
         longitude: this.userLongitude - 0.001, // ~100m west
         is_available: true,
         vehicle: { 
           make: "Hyundai", 
           model: "Tucson", 
           vehicle_type: "SUV",
           year: 2023,
           license_plate: "C-333-44",
           passenger_capacity: 5
         }
       },
       {
         driver_id: "DRV-004",
         full_name: "Nadia Chaoui",
         email: "nadia.c@example.com",
         phone_number: "+212644444444",
         latitude: this.userLatitude + 0.005,  // ~500m north
         longitude: this.userLongitude - 0.004, // ~400m west
         is_available: true,
         vehicle: { 
           make: "Mercedes", 
           model: "E-Class", 
           vehicle_type: "LUXURY",
           year: 2023,
           license_plate: "D-444-55",
           passenger_capacity: 4
         }
       }
     ];
 
     this.drivers = testDrivers.map(driver => {
       const distance = this.calculateDistance(
         this.userLatitude, 
         this.userLongitude,
         driver.latitude,
         driver.longitude
       );
       return {
         ...driver,
         distance: parseFloat(distance.toFixed(2))
       };
     });
 
     // Sort drivers by distance
     this.drivers.sort((a, b) => a.distance - b.distance);
     
     console.log('Mock drivers:', this.drivers);
     this.addDriverMarkers();
     
     // Open the side panel to show available taxis
     this.isPanelOpen = true;
   }
   
   calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
     const R = 6371;
     const dLat = this.deg2rad(lat2 - lat1);
     const dLon = this.deg2rad(lon2 - lon1);
     const a = 
       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
       Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
       Math.sin(dLon / 2) * Math.sin(dLon / 2);
     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     return R * c;
   }
 
   deg2rad(deg: number): number {
     return deg * (Math.PI / 180);
   }
   
   // Close dropdown when clicking outside
   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent): void {
     const target = event.target as HTMLElement;
     if (!target.closest('.search-input') && !target.closest('.suggestions-container')) {
       this.showSuggestions = false;
     }
   }
   
   // Listen for custom events (for getting directions from popup buttons)
   @HostListener('document:getDirections', ['$event'])
   onGetDirections(event: CustomEvent): void {
     const {lat, lng, name} = event.detail;
     if (lat && lng) {
       this.createRouteToPlace(lat, lng, name || 'Selected Place');
     }
   }
 }