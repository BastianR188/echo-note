import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChecklistItem, ImageAttachment, Label, Note, Settings } from '../../../../models/models';
import { FormsModule } from '@angular/forms';
import { ColorService } from '../../../../services/color.service';
import { AttachmentService } from '../../../../services/attachment.service';
import { ColorpickerComponent } from '../../../../template/colorpicker/colorpicker.component';
import { LabelpickerComponent } from '../../../../template/labelpicker/labelpicker.component';
import { ChecklistService } from '../../../../services/checklist.service';
import { LabelButtonComponent } from '../../../../template/label-button/label-button.component';
import { NoteService } from '../../../../services/note.service';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ColorpickerComponent, LabelpickerComponent, LabelButtonComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() settings!: Settings;
  title: string = '';
  note: string = '';
  isPinned: boolean = false;
  isChecklist: boolean = false;
  attachments: ImageAttachment[] = [];
  checklistItems: ChecklistItem[] = [];
  imageUrls: string[] = [];
  labels: Label[] = [];
  selectedColor: string = '#ffffff'; // Standardfarbe, falls gewünscht
  isDropdownColorOpen: boolean = false;
  isDropdownLabelOpen: boolean = false;

  constructor(private noteService: NoteService, private checklistService: ChecklistService, public colorService: ColorService, private attachmentService: AttachmentService) { }

  resetForm() {
    this.title = '';
    this.note = '';
    this.isChecklist = false;
    this.isPinned = false;
    this.selectedColor = '#ffffff';
    this.attachments = [];
    this.checklistItems = [];
    this.imageUrls = [];
    this.labels = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async createNote() {
    if (this.checkContent()) {
      await this.noteService.addNote(this.newNote());
      this.resetForm();  
    }
  }

  checkContent() {
    const hasContent = this.isChecklist
      ? this.checklistItems.some(item => item.text.length > 0)
      : this.note.length > 0;
    const hasAttachment = this.attachments && this.attachments.length > 0;
    if (this.title.length === 0 && !hasContent && !hasAttachment) {
      return false
    } else {
      return true
    }
  }

  onSelectColor(color: string) {
    this.selectedColor = color;
  }

  newNote() {
    const newNote: Note = {
      id: this.noteService.newId(),
      title: this.title,
      content: this.isChecklist ? '' : this.note,
      isChecklist: this.isChecklist,
      checklistItems: this.isChecklist ? this.checklistItems : [],
      color: this.selectedColor,
      isPinned: this.isPinned,
      attachments: this.attachments,
      createdAt: new Date(),
      editAt: null,
      delete: false,
      labels: this.labels,
      order: 0,
    };
    this.noteService.shiftNotesOrder(newNote.isPinned);
    return newNote;
  }



  checkColor() {
    return this.colorService.getColor(this.selectedColor, this.settings.darkMode);
  }
  removeChecklistItem(itemId: string) {
    const index = this.checklistItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.checklistItems.splice(index, 1);
    }
  }
  addChecklistItem() {
    const newItem: ChecklistItem = {
      id: this.checklistService.generateUniqueId(),
      text: '',
      checked: false,
      order: this.checklistItems.length
    };
    this.checklistItems.push(newItem);
    setTimeout(() => {
      this.focusNewItem(newItem.id);
    });
  }

  isChecklistItem() {
    if (this.checklistItems.length === 0) {
      this.addChecklistItem();
    }
  }

  deleteChecklistItems() {
    this.checklistItems = [];
  }

  focusNewItem(id: string): void {
    setTimeout(() => {
      const newItem = document.getElementById(`item-${id}`);
      if (newItem) {
        (newItem as HTMLTextAreaElement).focus();
      }
    });
  }


  openDropdown(dropdownId: string) {
    if (dropdownId === 'color') {
      this.isDropdownColorOpen = true;
    } else if (dropdownId === 'label') {
      this.isDropdownLabelOpen = true;
    }
  }

  onClickOutside(dropdownId: string) {
    setTimeout(() => {
      if (dropdownId === 'color') {
        this.isDropdownColorOpen = false;
      } else if (dropdownId === 'label') {
        this.isDropdownLabelOpen = false;
      }
    })
  }

  async onFileSelected(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = input.files;
    if (fileList) {
      // Verarbeite die Dateien mit deinem Service und füge sie zur bestehenden Liste hinzu
      const newAttachments = await this.attachmentService.handleFileSelection(fileList);
      this.attachments = this.attachments.concat(newAttachments);

      // Lese die neuen Dateien als Daten-URLs ein und füge sie zur bestehenden Liste hinzu
      Array.from(fileList).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            this.imageUrls.push(result);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onDeleteLabel(id: string) {
    const index = this.labels.findIndex(label => label.id === id);
    if (index !== -1) {
      this.labels.splice(index, 1);
    }
  }

  ifNoteInLabels(id: string): boolean {
    return this.labels.some(label => label.id === id);
  }

  onSelectLabel(id: string) {
    this.noteService.setSelectedLabel(id);
  }

  toggleLabel(id: string) {
    if (this.ifNoteInLabels(id)) {
      const index = this.labels.findIndex(label => label.id === id);
      if (index !== -1) {
        this.labels.splice(index, 1);
      }
    }
  }
}
