import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Label, Settings } from '../../../../models/models';
import { FormsModule } from '@angular/forms';
import { LabelService } from '../../../../services/label.service';
import { NoteService } from '../../../../services/note.service';

@Component({
  selector: 'app-edit-label',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-label.component.html',
  styleUrl: './edit-label.component.scss'
})
export class EditLabelComponent {
  @Input() labels!: Label[];
  @Input() settings!: Settings;
  @Output() closeLabel = new EventEmitter<void>();
  labelInputName: string = '';
  selectedLabel:string = '';
  editInputLabel: string = '';

constructor(private labelService: LabelService, private noteService: NoteService) {}

  deleteInput() {
    this.labelInputName = '';
  }
  closeEditLabel() {
    this.closeLabel.emit()
  }

  createNewLabel(){
      if (this.labelInputName.length != 0) {
        this.labelService.addLabel(this.labelInputName);
        this.labelInputName = '';
    }
  }

  async removeLabel(label: Label) {
    const index = this.labelService.labels.findIndex(item => item === label);
    if (index !== -1) {
      const deletedLabel = await this.labelService.deletLabel(index);
      if (deletedLabel) {
        this.noteService.updateLabelsInAllNotes(deletedLabel, true);
      }
    } else {
      console.log(`Label not found: ${label}`);
    }
  }

  editLabel(label:Label) {
    this.selectedLabel = label.id;
    this.editInputLabel = label.name;
  }

  setLabel(label:Label, i: number) {
    this.labelService.labels[i].name = this.editInputLabel;
    this.selectedLabel = '';
    this.labelService.setLabel();
    this.noteService.updateLabelsInAllNotes(label, false);
  }
}
