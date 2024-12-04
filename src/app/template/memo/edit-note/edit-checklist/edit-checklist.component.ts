import { AfterViewInit, Component, Input } from '@angular/core';
import { ChecklistItem, Note, Settings } from '../../../../models/models';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NoteService } from '../../../../services/note.service';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ColorService } from '../../../../services/color.service';
import { ChecklistService } from '../../../../services/checklist.service';

@Component({
  selector: 'app-edit-checklist',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, CdkDragHandle, FormsModule],
  templateUrl: './edit-checklist.component.html',
  styleUrl: './edit-checklist.component.scss'
})
export class EditChecklistComponent implements AfterViewInit {
  @Input() note!: Note;
  @Input() settings!: Settings;
  isCompletedItemsVisible: boolean = true;



  darkMode: boolean = false;
  private subscriptionDarkMode!: Subscription;

  constructor(private noteService: NoteService, private colorService: ColorService, private checklistService: ChecklistService) { }

  ngAfterViewInit() {
    this.renderTextArea()
  }

  toggleCompletedItems() {
    this.isCompletedItemsVisible = !this.isCompletedItemsVisible;
  }

  addChecklistItem() {
    const newItem: ChecklistItem = {
      id: this.checklistService.generateUniqueId(),
      text: '',
      checked: false,
      order: this.note.checklistItems.length
    };
    this.note.checklistItems.push(newItem);
    setTimeout(() => {
      this.focusNewItem(newItem.id);
    });
  }

  focusNewItem(id: string): void {
    setTimeout(() => {
      const newItem = document.getElementById(`item-${id}`);
      if (newItem) {
        (newItem as HTMLTextAreaElement).focus();
      }
    });
  }

  removeChecklistItem(itemId: string) {
    const index = this.note.checklistItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.note.checklistItems.splice(index, 1);
    }
  }

  renderTextArea() {
    setTimeout(() => {
      if (this.uncheckedItems.length !== 0) {
        this.uncheckedItems.forEach(element => {
          this.setReplicatedValue(element.id)
        })
      }
      if (this.checkedItems.length !== 0) {
        this.checkedItems.forEach(element => {
          this.setReplicatedValue(element.id)
        })
      }

    })

  }


  setReplicatedValue(id: string) {
      const textarea = document.getElementById(id) as HTMLTextAreaElement; // Verwende die ID
      if (textarea && textarea.parentNode) {
        const parent = textarea.parentNode as HTMLElement;
        parent.dataset['replicatedValue'] = textarea.value;
      }

  }


  get uncheckedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => !item.checked);
  }

  get checkedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => item.checked);
  }

  checkColor(noteColor: string) {
    return this.colorService.getColor(noteColor, this.settings.darkMode);
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
