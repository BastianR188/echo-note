import { Injectable } from '@angular/core';
import { Label, Note, Settings } from '../models/models';
import { LabelService } from './label.service';
import { BehaviorSubject } from 'rxjs';
import { DataSyncService } from './data-sync.service';
import { OfflineStorageService } from './offline-storage.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  userId: string = '';

  private notesSubject = new BehaviorSubject<Note[]>([]);
  notes$ = this.notesSubject.asObservable();

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  private _notes: Note[] = [];

  constructor(private labelService: LabelService, private dataSync: DataSyncService, private offlineStorage: OfflineStorageService) { }

  get notes(): Note[] {
    return this._notes;
  }


  

  set notes(value: Note[]) {
    this._notes = value;
    this.notesSubject.next(this._notes);
  }

  async setUserId(userId: string) {
    this.userId = userId;
    await this.loadNotes();
  }

  private async loadNotes() {
    if (this.userId) {
      this.notes = await this.offlineStorage.getUserNotes(this.userId) as Note[];
      this.notesSubject.next(this.notes);
    }
  }

  getAllDataId(settings: Settings) {
    let noteIds: string[] = [];
    let labelIds: string[] = [];
    this._notes.forEach((item) => {
      noteIds.push(item.id);
    });
    this.labelService.labels.forEach((item) => {
      labelIds.push(item.id);
    });
    let data = {
      noteIds: noteIds,
      labelIds: labelIds,
      userId: settings.userId,
      darkMode: settings.darkMode,
      password: settings.password,
      autoLog: settings.autoLog
    };
    return data;
  }

  shiftNotesOrder(isPinned: boolean) {
    const notesToShift = this.notes.filter((note) => note.isPinned === isPinned);
    
    
    notesToShift.forEach(note => {
      note.order += 1;
    });
  }
  

  async updateAllNotes(userId: string, newNotes: Note[]) {
    const currentNotes = this.notesSubject.getValue();
    const updatedNotes = this.dataSync.mergeAndUpdateItems<Note>(currentNotes, newNotes);
    this.notes = updatedNotes; // Aktualisieren Sie die notes Property
    this.notesSubject.next(updatedNotes);
    this.offlineStorage.saveUserNotes(userId, updatedNotes);
  }

  setSearchTerm(term: string) {
    this.searchTermSubject.next(term);
  }

  newId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  updateOfflineAllNotes(userId: string, newNotes: Note[]) {
    this.notesSubject.next(newNotes);
    this.offlineStorage.saveUserNotes(userId, newNotes);
  }

  async addNote(note: Note) {
    if (!this.userId) throw new Error('User not set');
    this.clearSearchTerm()
    this.notes.push(note);
    await this.saveNotes(this.notes);
    this.notesSubject.next([...this.notes]);
  }

  clearSearchTerm() {
    this.searchTermSubject.next('');
  }

  async saveNotes(notes: Note[]) {
    if (this.userId) {
      this.offlineStorage.saveUserNotes(this.userId, notes);
    } else {
      console.log('UserId nicht gefunden! Es wurde nicht gespeichert!')
    }
  }

  setSelectedLabel(labelId: string) {
    this.labelService.selectMenu(labelId)
  }

  updateNote(updatedNote: Note, pinn: boolean) {
    updatedNote.editAt = new Date();
    const updatedNotes = this.notes.map(note =>
      note.id === updatedNote.id ? { ...note, ...updatedNote } : note
    );
    this.notes = updatedNotes;
    this.saveNotes(this.notes);
    if (pinn) {
      this.notesSubject.next(this.notes);
    }
  }

  async moveToTrash(note: Note) {
    note.delete = true;
    this.updateNote(note, false);
    this.loadNotes();
  }

  deleteNotePermanently(noteId: string) {
    this.deleteNote(noteId);
    this.loadNotes();
  }

  restoreNoteFromTrash(note: Note) {
    note.delete = false;
    note.editAt = new Date();
    this.updateNote(note, false);
    this.loadNotes();
  }

  deleteNote(id: string) {
    this.notes = this.notes.filter(note => note.id !== id);
    this.saveNotes(this.notes);
    this.notesSubject.next([...this.notes]);
  }

  async updateLabelsInAllNotes(updatedLabel: Label, isDeleted: boolean = false) {
    const notes = this.getCurrentNotes();
    const updatedNotes = notes.map(note => {
      if (note.labels && note.labels.some(label => label.id === updatedLabel.id)) {
        return {
          ...note,
          labels: isDeleted
            ? note.labels.filter(label => label.id !== updatedLabel.id)
            : note.labels.map(label =>
              label.id === updatedLabel.id
                ? { ...label, name: updatedLabel.name, color: updatedLabel.color }
                : label
            )
        };
      }
      return note;
    });

    await this.updateOfflineAllNotes(this.userId, updatedNotes);
  }

  getCurrentNotes(): Note[] {
    return this.notesSubject.getValue();
  }
}