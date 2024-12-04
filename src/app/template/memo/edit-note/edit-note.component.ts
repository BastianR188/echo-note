import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Note, Settings } from '../../../models/models';
import { ColorService } from '../../../services/color.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LabelpickerComponent } from '../../labelpicker/labelpicker.component';
import { LabelButtonComponent } from '../../label-button/label-button.component';
import { ColorpickerComponent } from '../../colorpicker/colorpicker.component';
import { NoteService } from '../../../services/note.service';
import { AttachmentService } from '../../../services/attachment.service';
import { FormsModule } from '@angular/forms';
import { EditChecklistComponent } from './edit-checklist/edit-checklist.component';

@Component({
  selector: 'app-edit-note',
  standalone: true,
  imports: [CommonModule, LabelpickerComponent, EditChecklistComponent, LabelButtonComponent, ColorpickerComponent, FormsModule],
  templateUrl: './edit-note.component.html',
  styleUrl: './edit-note.component.scss'
})
export class EditNoteComponent implements AfterViewInit {
  @Input() note!: Note;
  @Input() settings!: Settings;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  darkMode: boolean = false;
  private subscriptionDarkMode!: Subscription;


  constructor(private colorService: ColorService, private noteService: NoteService, private attachmentService: AttachmentService) { }

  ngAfterViewInit() {
    this.renderTextArea()
  }

  renderTextArea() {
    const list: string[] = []; // Initialisiere die Liste als leeres Array
    if (this.note.title.length !== 0) {
      list.push('titleTextarea');
    }
    if (this.note.content.length !== 0) {
      list.push('contentTextarea');
    }

    // Iteriere über die Liste und rufe setReplicatedValue für jedes Element auf
    setTimeout(() => {
      list.forEach(element => {
        this.setReplicatedValue(element);
      });

    })
  }


  setReplicatedValue(id: string) {
    const textarea = document.getElementById(id) as HTMLTextAreaElement; // Verwende die ID
    if (textarea && textarea.parentNode) {
      const parent = textarea.parentNode as HTMLElement;
      parent.dataset['replicatedValue'] = textarea.value;
    }

  }








  openImageInNewTab(url: string): void {
    if (url) {
      window.open(url, '_blank');
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
  }

  onDeleteLabel(id: string) {
    const index = this.note.labels.findIndex(label => label.id === id);
    if (index !== -1) {
      this.note.labels.splice(index, 1);
    }
}

  onSelectColor(color: string) {
    this.note.color = color;
  }

  onSelectLabel(id: string) {
    this.noteService.setSelectedLabel(id);
  }

  checkColor(noteColor: string) {
    return this.colorService.getColor(noteColor, this.settings.darkMode);
  }

  saveNote(refresh: boolean) {
    this.noteService.updateNote(this.note, refresh);
  }

  togglePinNote() {
    this.note.isPinned = !this.note.isPinned;
    this.saveNote(true);
  }
  async onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      await this.attachmentService.addAttachmentsToNote(this.note, fileList);
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }
}
