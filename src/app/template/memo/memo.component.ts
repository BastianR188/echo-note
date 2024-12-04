import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ChecklistItem, Note, Settings } from '../../models/models';
import { CommonModule } from '@angular/common';
import { ColorService } from '../../services/color.service';
import { ColorpickerComponent } from '../colorpicker/colorpicker.component';
import { LabelpickerComponent } from '../labelpicker/labelpicker.component';
import { LabelButtonComponent } from '../label-button/label-button.component';
import { NoteService } from '../../services/note.service';
import { AttachmentService } from '../../services/attachment.service';
import { ChecklistComponent } from './checklist/checklist.component';
import { EditNoteComponent } from './edit-note/edit-note.component';
import { FooterMenuComponent } from '../footer-menu/footer-menu.component';

@Component({
  selector: 'app-memo',
  standalone: true,
  imports: [CommonModule, FooterMenuComponent, ColorpickerComponent, LabelpickerComponent, LabelButtonComponent, ChecklistComponent, EditNoteComponent],
  templateUrl: './memo.component.html',
  styleUrl: './memo.component.scss'
})
export class MemoComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() note!: Note;
  @Input() settings!: Settings;
  // isEditing: boolean = false;
  @Output() isEditing = new EventEmitter<boolean>()
  @Output() editingNote = new EventEmitter<Note>()

  constructor(private colorService: ColorService, private noteService: NoteService, private attachmentService: AttachmentService) { }



  get uncheckedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => !item.checked);
  }

  get checkedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => item.checked);
  }



  copieNote() {
    this.noteService.addNote(this.newNote());
  }

  newNote() {
    const newNote: Note = {
      id: this.noteService.newId(),
      title: this.note.title,
      content: this.note.isChecklist ? '' : this.note.content,
      isChecklist: this.note.isChecklist,
      checklistItems: this.note.isChecklist ? this.note.checklistItems : [],
      color: this.note.color,
      isPinned: this.note.isPinned,
      attachments: this.note.attachments.map(attachment => ({
        ...attachment,
        id: this.attachmentService.generateUniqueId()
      })),
      createdAt: new Date(),
      editAt: null,
      delete: false,
      labels: this.note.labels,
      order: 0, 
    };
    this.noteService.shiftNotesOrder(newNote.isPinned);

    return newNote;
  }

  editNote(note: Note) {
    if (!note.delete) {
      // this.isEditing = true;
      this.isEditing.emit(true)
      this.editingNote.emit(note);
    }
  }

  abortEditNote() {
    // this.isEditing = false;
    this.isEditing.emit(false)
    this.checkIfEmpty();
    this.saveNote()
  }

  saveNote() {
    this.noteService.updateNote(this.note, this.note.isPinned)
  }

  checkColor(noteColor: string) {
    return this.colorService.getColor(noteColor, this.settings.darkMode);
  }

  onSelectColor(color: string) {
    this.note.color = color;
    this.saveNote()
  }

  onSelectLabel(id: string) {
    this.noteService.setSelectedLabel(id);
  }

  onDeleteLabel(id: string) {
    const index = this.note.labels.findIndex(label => label.id === id);
    if (index !== -1) {
      this.note.labels.splice(index, 1);
    }
}

  removeAttachment(event: any, attachmentId: string) {
    event.stopPropagation();
    this.attachmentService.removeAttachmentFromNote(this.note, attachmentId);
    this.checkIfEmpty()
  }

  checkIfEmpty() {
    if (this.note.attachments.length == 0 && this.note.title.length == 0 && this.note.content.length == 0 && this.note.checklistItems.length == 0) {
      this.deleteNote();
    }
  }

  deleteNote() {
    this.noteService.moveToTrash(this.note);
    this.saveNote()
  }

  deleteNotePermanently(id:string){
    this.noteService.deleteNotePermanently(id)
  }

  restoreNoteFromTrash(note:Note) {
    this.noteService.restoreNoteFromTrash(note)
  }

  togglePinNote() {
    this.note.isPinned = !this.note.isPinned;
    this.saveNote();
  }

  async onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      await this.attachmentService.addAttachmentsToNote(this.note, fileList);
      this.saveNote();
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

}
