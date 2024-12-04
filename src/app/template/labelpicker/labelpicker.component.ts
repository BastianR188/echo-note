import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { Label, Settings } from '../../models/models';
import { LabelService } from '../../services/label.service';

@Component({
  selector: 'app-labelpicker',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './labelpicker.component.html',
  styleUrl: './labelpicker.component.scss'
})
export class LabelpickerComponent implements AfterViewInit {
  @Input() settings!: Settings;
  @Input() isInput!: boolean;
  @Input() noteLabel: Label[] = [];
  @Output() setLabelEvent = new EventEmitter<void>();
  @Output() removeLabel = new EventEmitter<string>();

  labels: Label[] = [];

  isDropdownLabelOpen: boolean = false;
  constructor(public labelService: LabelService) {
  }

  ngAfterViewInit() {
    this.labels = this.noteLabel
  }

  openDropdown() {
    this.isDropdownLabelOpen = !this.isDropdownLabelOpen;
  }


  onClickOutside(labels: Label[]) {
    if (this.isDropdownLabelOpen) {
      this.setLabelEvent.emit();
      this.isDropdownLabelOpen = false;
    }
  }

  ifNoteInLabels(id: string): boolean {
    return this.labels.some(label => label.id === id);
  }

  toggleLabel(label: Label, event:Event) {
    event.stopPropagation();

    if (this.ifNoteInLabels(label.id)) {
      this.removeLabel.emit(label.id)
    } else {
      this.labels.push(label);
    }
  }
}
