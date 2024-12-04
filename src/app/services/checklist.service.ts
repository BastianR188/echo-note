import { Injectable } from '@angular/core';
import { ChecklistItem, Note } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  constructor() { }

  addChecklistItem(note: Note): void {
    const newItem: ChecklistItem = {
      id: this.generateUniqueId(),
      text: '',
      checked: false,
      order: note.checklistItems.length
    };
    note.checklistItems.push(newItem);
    this.updateNoteChecklistItems(note);
  }

  removeChecklistItem(note: Note, itemId: string): void {
    const index = note.checklistItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      note.checklistItems.splice(index, 1);
      this.updateNoteChecklistItems(note);
    }
  }

  toggleChecklistItem(note: Note, index: number): void {
    const item = note.checklistItems[index];
    item.checked = !item.checked;
    this.updateNoteChecklistItems(note);
  }

  updateNoteChecklistItems(note: Note): void {
    note.checklistItems.forEach((item, index) => {
      item.order = index;
    });
  }

  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  reorderChecklistItems(note: Note, previousIndex: number, currentIndex: number, isCheckedList: boolean): void {
    const list = isCheckedList ? this.getCheckedItems(note) : this.getUncheckedItems(note);
    const [reorderedItem] = list.splice(previousIndex, 1);
    list.splice(currentIndex, 0, reorderedItem);
    this.updateNoteChecklistItems(note);
  }

  getUncheckedItems(note: Note): ChecklistItem[] {
    return note.checklistItems.filter(item => !item.checked);
  }

  getCheckedItems(note: Note): ChecklistItem[] {
    return note.checklistItems.filter(item => item.checked);
  }

  clearChecklistItems(note: Note): void {
    note.checklistItems = [];
  }
}

