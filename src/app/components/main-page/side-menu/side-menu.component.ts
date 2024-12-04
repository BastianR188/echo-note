import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Label, Settings } from '../../../models/models';
import { LabelService } from '../../../services/label.service';
import { Subscription } from 'rxjs';
import { EditLabelComponent } from './edit-label/edit-label.component';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, EditLabelComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent implements OnInit, OnDestroy {
  @Input() settings!: Settings;
  editLabel: boolean = false;
  labels: Label[] = [];
  private labelSubscription!: Subscription;

  selectedLabel: string = '';
  private selectedLabelSubscription!: Subscription;

  sideMenuIsOpen: boolean = false;
  private sideMenuIsOpenSubscription!: Subscription;
  
  constructor(private labelService: LabelService) { }

  ngOnInit(): void {
    this.labelSubscription = this.labelService.labels$.subscribe(
      (labels: Label[]) => {
        this.labels = labels;
      }
    );
    this.selectedLabelSubscription = this.labelService.getSelectedLabel().subscribe(
      label => {
        this.selectedLabel = label;
      })
    this.sideMenuIsOpenSubscription = this.labelService.sideMenuIsOpen$.subscribe(
      state => {
        this.sideMenuIsOpen = state
      }
    )
  }

  ngOnDestroy(): void {
    if (this.labelSubscription) {
      this.labelSubscription.unsubscribe();
    }
    if (this.selectedLabelSubscription) {
      this.selectedLabelSubscription.unsubscribe();
    }
    if (this.sideMenuIsOpenSubscription) {
      this.sideMenuIsOpenSubscription.unsubscribe();
    }
  }

  selectMenu(select: string) {
    this.labelService.selectMenu(select)
  }

  toggleEditLabel(){
    this.editLabel = !this.editLabel
  }

}
