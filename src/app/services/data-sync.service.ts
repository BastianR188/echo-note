import { Injectable } from '@angular/core';
import { Label } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataSyncService {

  constructor() { }

  mergeAndUpdateLabels(currentLabels: Label[], newLabels: Label[]): Label[] {
    const mergedLabels = [...currentLabels];
    
    newLabels.forEach(newLabel => {
      const index = mergedLabels.findIndex(label => label.id === newLabel.id);
      if (index !== -1) {
        // Wenn das Label bereits existiert, aktualisieren wir es
        mergedLabels[index] = { ...mergedLabels[index], ...newLabel };
      } else {
        // Wenn das Label noch nicht existiert, fügen wir es hinzu
        mergedLabels.push(newLabel);
      }
    });
  
    // Sortieren der Labels nach Namen (oder einem anderen Kriterium, falls gewünscht)
    mergedLabels.sort((a, b) => a.name.localeCompare(b.name));
  
    return mergedLabels;
  }
  

  
  mergeAndUpdateItems<T extends { id: string; order: number; editAt?: Date | null }>(currentItems: T[], newItems: T[]): T[] {
    const mergedItems = [...currentItems];
    
    newItems.forEach(newItem => {
      const index = mergedItems.findIndex(item => item.id === newItem.id);
      if (index !== -1) {
        mergedItems[index] = newItem;
      } else {
        mergedItems.push(newItem);
      }
    });
  
    mergedItems.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      } else {
        // Sicherstellen, dass editAt existiert und ein gültiges Datum ist
        const dateA = a.editAt instanceof Date ? a.editAt : new Date(0);
        const dateB = b.editAt instanceof Date ? b.editAt : new Date(0);
        return dateB.getTime() - dateA.getTime();
      }
    });
  
    return mergedItems;
  }
  
  
  
}
