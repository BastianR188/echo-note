import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Label, Note, Settings } from '../models/models';
import { DBSchema, IDBPDatabase, openDB } from 'idb';

interface MyDB extends DBSchema {
  userData: {
    key: string;
    value: string;
  };
  notes: {
    key: string;
    value: Note[];
  };
  labels: {
    key: string;
    value: Label[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  STORAGE_KEY = 'memo-flow-';
  dbName = 'MemoFlowDatabase';
  dbVersion = 4;

  private settingsSubject = new BehaviorSubject<any>(null);
  public settings$ = this.settingsSubject.asObservable();

  private async getDB(): Promise<IDBPDatabase<MyDB>> {
    return openDB<MyDB>(this.dbName, this.dbVersion, {
      upgrade(db, oldVersion, newVersion) {
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData');
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes');
        }
        if (!db.objectStoreNames.contains('labels')) {
          db.createObjectStore('labels');
        }
      },
    });
  }
  

  async loadSettings(id: string) {
    try {
      const db = await this.getDB();
      const storedSettings = await db.get('userData', this.STORAGE_KEY + id);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        this.settingsSubject.next(parsedSettings);
      } else {
        // Wenn keine Einstellungen gefunden wurden, verwenden Sie Standardeinstellungen
        console.log('Error no data found, loading data from IndexedDB')
      }
    } catch (error) {
      console.error('Error loading data from IndexedDB:', error);
      // Bei einem Fehler verwenden Sie ebenfalls Standardeinstellungen
    }
  }
  
  getDefaultSettings(): Settings {
    return {
      userId: '',
      password: '',
      darkMode: false,
      noteIds: [],
      labelIds: [],
      autoLog: false
    };
  }
  
  

  async saveSettings(newData: any, id: string) {
    try {
      const db = await this.getDB();
      await db.put('userData', JSON.stringify(newData), this.STORAGE_KEY + id);
      this.settingsSubject.next(newData);
    } catch (error) {
      console.error('Error updating data in IndexedDB:', error);
    }
  }

  async getUserLabels(userId: string): Promise<Label[]> {
    try {
      const db = await this.getDB();
      const storedLabels = await db.get('labels', this.STORAGE_KEY + userId);
      return storedLabels || [];
    } catch (error) {
      console.error('Error retrieving labels from IndexedDB:', error);
      return [];
    }
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    try {
      const db = await this.getDB();
      const storedNotes = await db.get('notes', this.STORAGE_KEY + userId);
      return storedNotes || [];
    } catch (error) {
      console.error('Error retrieving notes from IndexedDB:', error);
      return [];
    }
  }

  async saveUserLabels(userId: string, labels: Label[]) {
    try {
      const db = await this.getDB();
      await db.put('labels', labels, this.STORAGE_KEY + userId);
    } catch (error) {
      console.error('Error saving labels to IndexedDB:', error);
    }
  }

  async saveUserNotes(userId: string, notes: Note[]) {
    try {
      const db = await this.getDB();
      await db.put('notes', notes, this.STORAGE_KEY + userId);
    } catch (error) {
      console.error('Error saving notes to IndexedDB:', error);
    }
  }
}
