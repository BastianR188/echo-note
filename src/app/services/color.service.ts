import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  selectedColor: string = 'white'; // Standardfarbe, falls gewünscht
  isDropdownOpen: boolean = false;
  darkMode: boolean = false;
  private subscriptionDarkMode!: Subscription;

  // constructor(private settingsService: SettingsService) { }
  // ngOnInit() {
  //   this.subscriptionDarkMode = this.settingsService.darkMode$.subscribe(
  //     darkMode => this.darkMode = darkMode
  //   );
  // }

  // ngOnDestroy() {
  //   this.subscriptionDarkMode.unsubscribe();
  // }
  private lightColors = [
    { name: 'Weiß', value: '#ffffff' },
    { name: 'Gebrochenes Weiß', value: '#f5f5f5' },
    { name: 'Hellrot', value: '#ffcccb' },
    { name: 'Hellgrün', value: '#90ee90' },
    { name: 'Hellblau', value: '#add8e6' },
    { name: 'Hellgelb', value: '#ffffe0' },
    { name: 'Hellorange', value: '#ffe4b5' },
    { name: 'Helllila', value: '#e6e6fa' },
    { name: 'Hellrosa', value: '#ffb6c1' },
    { name: 'Hellbraun', value: '#d2b48c' },
    { name: 'Hellgrau', value: '#d3d3d3' },
    { name: 'Helltürkis', value: '#afeeee' },
    { name: 'Beige', value: '#f5f5dc' },
    { name: 'Hellolive', value: '#9acd32' },
    { name: 'Hellindigo', value: '#8a2be2' }
  ];
  private darkColors = [
    { name: 'Schwarz', value: '#333' },
    { name: 'Schwarz', value: '#000000' },
    { name: 'Dunkelrot', value: '#8b0000' },
    { name: 'Dunkelgrün', value: '#006400' },
    { name: 'Dunkelblau', value: '#00008b' },
    { name: 'Dunkelgelb', value: '#ffd700' },
    { name: 'Dunkelorange', value: '#ff8c00' },
    { name: 'Dunkellila', value: '#4b0082' },
    { name: 'Dunkelrosa', value: '#c71585' },
    { name: 'Dunkelbraun', value: '#8b4513' },
    { name: 'Dunkelgrau', value: '#696969' },
    { name: 'Dunkeltürkis', value: '#008080' },
    { name: 'Dunkelbeige', value: '#d2b48c' },
    { name: 'Dunkelolive', value: '#556b2f' },
    { name: 'Dunkelindigo', value: '#191970' }
  ];
  getColor(color: string, darkMode:boolean) {
    const sourceColors = darkMode ? this.lightColors : this.darkColors;
    const targetColors = darkMode ? this.darkColors : this.lightColors;

    const index = sourceColors.findIndex(col => col.value === color);
    if (index !== -1 && index < targetColors.length) {
      return targetColors[index].value;
    }

    // Wenn die Farbe nicht gefunden wurde, suche in der aktuellen Farbliste
    const currentColors = darkMode ? this.darkColors : this.lightColors;
    const newColor = currentColors.find(col => col.value === color);
    if (newColor) {
      return newColor.value
    } 
    return sourceColors[0].value
  }

  getColorPalette(darkMode: boolean) {
    const colors = darkMode ? this.darkColors : this.lightColors;
    return colors.slice(1);  // Gibt alle Farben außer der ersten zurück
  }

}