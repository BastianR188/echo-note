import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Label, Settings } from '../../models/models';
import { CommonModule } from '@angular/common';
import { LabelService } from '../../services/label.service';

@Component({
  selector: 'app-label-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label-button.component.html',
  styleUrl: './label-button.component.scss'
})
export class LabelButtonComponent {
  @Input() label!: Label;
  @Input() settings!: Settings;
  @Input() color: string = "#ffffff";
  @Output() onDeleteLabel = new EventEmitter<string>();

  constructor(private labelService: LabelService){}

  selectLabel(labelId: string) {
    this.labelService.selectMenu(labelId)
  }

  deleteLabel(labelId: string) {
    this.onDeleteLabel.emit(labelId);
  }
}
