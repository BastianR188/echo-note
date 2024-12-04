import { Injectable } from '@angular/core';
import { Label } from '../models/models';
import { BehaviorSubject, Observable } from 'rxjs';
import { OfflineStorageService } from './offline-storage.service';
import { DataSyncService } from './data-sync.service';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  userId: string = '';
  labelsSubject = new BehaviorSubject<Label[]>([]);
  labels$ = this.labelsSubject.asObservable();

  private sideMenuSubject = new BehaviorSubject<boolean>(true);
  sideMenuIsOpen$: Observable<boolean> = this.sideMenuSubject.asObservable();

  private selectedLabelSubject = new BehaviorSubject<string>('');
  selectedLabel$: Observable<string> = this.selectedLabelSubject.asObservable();

  _labels: Label[] = [];
  constructor(private offlineStorage: OfflineStorageService, private dataSync: DataSyncService) { }
  get labels(): Label[] {
    return this._labels;
  }
  selectMenu(select: string) {
    this.selectedLabelSubject.next(select);
  }

  toggleSideMenu(): void {
    const currentState = this.sideMenuSubject.value;
    this.sideMenuSubject.next(!currentState);
  }

  getSideMenuState(): boolean {
    return this.sideMenuSubject.value;
  }

  getSelectedLabel(): Observable<string> {
    return this.selectedLabel$;
  }
  async setUserId(userId: string) {
    this.userId = userId;
    await this.loadLabels();
  }


  private set labels(value: Label[]) {
    this._labels = value;
    this.labelsSubject.next(this._labels);
  }


  async loadLabels() {
    if (this.userId) {
      this.labels = await this.offlineStorage.getUserLabels(this.userId) as Label[];
      this.labelsSubject.next(this.labels);
    }
  }

  getLabels(): Observable<Label[]> {
    return this.labelsSubject.asObservable();
  }

  async updateAllLabels(userId: string, newLabels: Label[]) {
    const currentLabels = this.labelsSubject.getValue();
    const updatedLabels = this.dataSync.mergeAndUpdateLabels(currentLabels, newLabels);
    this.labels = updatedLabels
    this.labelsSubject.next(updatedLabels);
    this.offlineStorage.saveUserLabels(userId, updatedLabels);
  }

  async updateLabel(updatedLabel: Label): Promise<void> {
    const index = this.labels.findIndex(label => label.id === updatedLabel.id);
    if (index !== -1) {
      this.labels[index] = updatedLabel;
      this.saveLabels();
      this.labelsSubject.next([...this.labels]);
    }
  }

  private async saveLabels(): Promise<void> {
    if (this.userId) {
      this.offlineStorage.saveUserLabels(this.userId, this.labels);
    } else {
      console.log('UserId nicht gefunden! Labels wurde nicht offline gespeichert!')
    }
  }

  newId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  newLabel(labelName: string) {
    const newLabel: Label = {
      id: this.newId(),
      name: labelName,
      color: '#ffffff',
      order: this.labels.length
    }
    return newLabel
  }

  async addLabel(labelName: string) {
    if (!this.userId) throw new Error('User not set');
    this.labels.push(this.newLabel(labelName));
    await this.saveLabels();
    this.labelsSubject.next([...this.labels])
  }

  async deletLabel(index: number) {
    const deletedLabel = this.labels[index];
    this.labels.splice(index, 1);
    await this.saveLabels();
    this.labelsSubject.next([...this.labels]);
    return deletedLabel
  }

  async setLabel() {
    await this.saveLabels();
    this.labelsSubject.next([...this.labels])
  }
  
}
