import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChecklistItem, Note, Settings } from '../../../models/models';
import { NoteService } from '../../../services/note.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent {
  @Input() note!: Note;
  @Input() settings!: Settings;
  darkMode: boolean = false;
  private subscriptionDarkMode!: Subscription;

  constructor(private noteService: NoteService) { }

  get uncheckedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => !item.checked);
  }

  get checkedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => item.checked);
  }

  saveNote(refresh: boolean) {
    this.noteService.updateNote(this.note, refresh);
  }

  onDrop(event: CdkDragDrop<ChecklistItem[]>, isCheckedList: boolean) {
    const itemList = isCheckedList ? this.checkedItems : this.uncheckedItems;
    this.setOrder(itemList, event);
    this.updateChecklistOrder();
  }

  private setOrder(itemList: ChecklistItem[], event: CdkDragDrop<ChecklistItem[], ChecklistItem[], any>) {
    moveItemInArray(itemList, event.previousIndex, event.currentIndex);
    itemList.forEach((item, index) => {
      item.order = index;
    });
  }

  private updateChecklistOrder() {
    // Sortiere die gesamte Checkliste basierend auf der `order`-Eigenschaft
    this.note.checklistItems.sort((a, b) => a.order - b.order);
  }

  onCheckboxChange(event: any, itemId: string) {
    event.stopPropagation();

    const item = this.note.checklistItems.find(i => i.id === itemId);
    if (item) {
      this.sortOrder()
      if (item.checked == false) {
        item.checked = true;
        item.order = 0;
      } else {
        item.checked = false;
        item.order = this.uncheckedItems.length;
      }
      this.updateChecklistOrder()
    }
  }

  sortOrder() {
    this.uncheckedItems.forEach((item, index) => {
      item.order = index;
    });
    this.checkedItems.forEach((item, index) => {
      item.order = index + 1;
    })
  }
}
