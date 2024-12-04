import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Settings } from '../models/models';
import { OfflineStorageService } from './offline-storage.service';

interface MyDB extends DBSchema {
  userData: {
    key: string;
    value: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  STORAGE_KEY = 'memo-flow-';
  dbName = 'MemoFlowDatabase';
  dbVersion = 4;

  constructor(private router: Router, private offlineService: OfflineStorageService) { }

  private async getDB(): Promise<IDBPDatabase<MyDB>> {
    return openDB<MyDB>(this.dbName, this.dbVersion, {
      upgrade(db, oldVersion, newVersion) {
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData');
        }
      },
    });
  }

  async autoLoad(): Promise<void> {
    try {
      const db = await this.getDB();
      const savedSettingsString = await db.get('userData', this.STORAGE_KEY + 'autoLogin');

      if (savedSettingsString) {
        const savedSettings: Settings = JSON.parse(savedSettingsString);
        if (savedSettings.autoLog === true) {
          if (savedSettings.userId && savedSettings.password) {
            await this.login(savedSettings.userId, savedSettings.password, savedSettings.autoLog);
          } else {
            console.log('Incomplete user data for auto-login');
          }

        }
      } else {
        console.log('No saved user data found');
      }
    } catch (error) {
      console.error('Error during auto-login:', error);
    }
  }

  async saveAutoLoad(settings: Settings): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put('userData', JSON.stringify(settings), this.STORAGE_KEY + 'autoLogin');
    } catch (error) {
      console.error('Error saving auto-login data:', error);
    }
  }

  async login(userId: string, password: string, autoLog: boolean) {
    try {
      const db = await this.getDB();
      const key = this.STORAGE_KEY + userId;
      const savedSettingsString = await db.get('userData', key);

      if (savedSettingsString) {
        const settings: Settings = JSON.parse(savedSettingsString);
        if (settings.password === password) {
          const newSettings = this.setSettings(userId, password, autoLog, settings.darkMode, settings.labelIds, settings.noteIds);
          await db.put('userData', JSON.stringify(newSettings), key);
          if (newSettings.autoLog == true) {
            await this.saveAutoLoad(newSettings);
          }
          this.router.navigate(['/notes', userId], { state: { settings: newSettings } });
          return;
        } else {
          alert('Wrong Password!');
          return;
        }
      }
      const newSettings = this.setSettings(userId, password, autoLog,false, [], []);
      await db.put('userData', JSON.stringify(newSettings), key);
      if (newSettings.autoLog == true) {
        await this.saveAutoLoad(newSettings);
      }
      this.router.navigate(['/notes', userId], { state: { settings: newSettings } });
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again.');
    }
  }

  setSettings(userId: string, password: string, autoLog: boolean = false, darkMode: boolean = false, labelIds: string[] = [], noteIds: string[] = []): Settings {
    return {
      userId: userId,
      password: password,
      darkMode: darkMode,
      noteIds: noteIds,
      labelIds: labelIds,
      autoLog: autoLog
    };
  }
}
