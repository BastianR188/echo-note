import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Label, Settings } from '../../models/models';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';
import { LabelpickerComponent } from '../labelpicker/labelpicker.component';

@Component({
  selector: 'app-footer-menu',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective, LabelpickerComponent],
  templateUrl: './footer-menu.component.html',
  styleUrl: './footer-menu.component.scss'
})
export class FooterMenuComponent {
  @Input() settings!: Settings;
  @Input() isInput!: boolean;
  @Input() noteLabel: Label[] = [];
  @Output() setNewNote = new EventEmitter<void>();
  @Output() removeNote =new EventEmitter<void>();
  @Output() onEditNote =new EventEmitter<void>();


  isMenuOpen: boolean = false;


  toggleDropdown() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onClickOutside() {
    setTimeout(() => {
      this.isMenuOpen = false;

    })
  }

  editNote(){
    this.onEditNote.emit();
  }

  deleteNote() {
    this.removeNote.emit();
  }

  copieNote() {
    this.setNewNote.emit();
  }
}
