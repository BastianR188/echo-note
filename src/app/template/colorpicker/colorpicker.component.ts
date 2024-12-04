import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings } from '../../models/models';
import { ColorService } from '../../services/color.service';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';

@Component({
  selector: 'app-colorpicker',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './colorpicker.component.html',
  styleUrl: './colorpicker.component.scss'
})
export class ColorpickerComponent {
  isDropdownColorOpen: boolean = false;
  @Input() isInput: boolean = false;
  @Input() settings!: Settings;
  @Output() setColorEvent = new EventEmitter<string>();

  constructor(public colorService: ColorService) { }

  selectColor(color: string, event: Event) {
    event.stopPropagation();
    this.setColorEvent.emit(color)
    this.isDropdownColorOpen = false;
  }

  toggleDropdown() {
    this.isDropdownColorOpen = !this.isDropdownColorOpen;
  }

  onClickOutside() {
    if (this.isDropdownColorOpen) {
      this.isDropdownColorOpen = false;
    }
  }

}
