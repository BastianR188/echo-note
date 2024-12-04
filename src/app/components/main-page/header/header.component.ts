import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings } from '../../../models/models';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { LabelService } from '../../../services/label.service';
import { NoteService } from '../../../services/note.service';
import { OfflineStorageService } from '../../../services/offline-storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() settings!: Settings;

  @Output() logoutEvent = new EventEmitter<void>();
  @Output() setDarkMode = new EventEmitter<boolean>();

  title: string = "Memo-Flow";

  searchTerm: string = '';

  loadingFirebase: boolean = false;


  constructor(private settingsService: OfflineStorageService, private firebaseService: FirebaseService, private labelService: LabelService, private noteService: NoteService) { }

  toggleMenu(){
      this.labelService.toggleSideMenu();
  }

  clearSearchTerm() {
    this.searchTerm = '';
    this.noteService.setSearchTerm('');
  }
  
  onSearchChange(term: string) {
    this.noteService.setSearchTerm(term);
  }

  async loadFirebaseNotes() {
    this.loadingFirebase = true;
    const data = await (this.firebaseService.getUserDataAndRelatedItems(this.settings.userId))
    if (data?.notes) {
      await this.noteService.updateAllNotes(this.settings.userId, data.notes)
    }
    if (data?.labels) {
      await this.labelService.updateAllLabels(this.settings.userId, data.labels)
    }
    if (data?.userData) {
      this.setDarkMode.emit(data.darkMode)
  }
    this.loadingFirebase = false;
  }

  async saveFirebaseNotes() {
    this.loadingFirebase = true;
    await this.firebaseService.saveUserData(this.settings);
    this.loadingFirebase = false;
  }

  toggleDarkMode() { 
    this.settings.darkMode = !this.settings.darkMode;
    this.setDarkMode.emit(this.settings.darkMode);
  }

  logout() {
    this.logoutEvent.emit();
  }
}

