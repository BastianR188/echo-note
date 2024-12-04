import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Note, Settings } from '../../../models/models';
import { InputComponent } from './input/input.component';
import { combineLatest, Subscription } from 'rxjs';
import { NoteService } from '../../../services/note.service';
import { CommonModule } from '@angular/common';
import { LabelService } from '../../../services/label.service';
import { DynamicLayoutComponent } from './dynamic-layout/dynamic-layout.component';
import { MemoComponent } from '../../../template/memo/memo.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InputComponent, DynamicLayoutComponent, MemoComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('pinnedLayout') pinnedLayout!: DynamicLayoutComponent;
  @ViewChild('unpinnedLayout') unpinnedLayout!: DynamicLayoutComponent;
  @Input() settings!: Settings;
  searchTerm: string = '';
  private searchTermSubscription!: Subscription;
  private _notes: Note[] = [];
  private notesSubscription!: Subscription;
  selectedLabel: string = '';
  private selectedLabelSubscription!: Subscription;

  constructor(private noteService: NoteService, private labelService: LabelService) { }

  ngOnInit(): void {
    this.notesSubscription = this.noteService.notes$.subscribe(
      (notes: Note[]) => {
        this._notes = notes;
        this.updateLayout()
      }
    );
    this.selectedLabelSubscription = combineLatest([
      this.labelService.getSelectedLabel(),
      this.noteService.searchTerm$
    ]).subscribe(([label, searchTerm]) => {
      this.selectedLabel = label;
      this.searchTerm = searchTerm;
      this.updateLayout()
    });
  }

  ngOnDestroy(): void {
    if (this.notesSubscription) {
      this.notesSubscription.unsubscribe();
    }
    if (this.selectedLabelSubscription) {
      this.selectedLabelSubscription.unsubscribe();
    }
    if (this.searchTermSubscription) {
      this.searchTermSubscription.unsubscribe();
    }
  }


  private updateLayout(): void {
    if (this.pinnedLayout) {
      this.pinnedLayout.updateItems();
    }
    if (this.unpinnedLayout) {
      this.unpinnedLayout.updateItems();
    }
  }

  sortNotes(notes: Note[]) {
    const sortNotes = notes.sort((a, b) => a.order - b.order);
    sortNotes.forEach((note, index) => { note.order = index})
    return sortNotes
  }

  get pinnedNotes(): Note[] {
    const notes = this.sortNotes(this._notes)
    return notes.filter(note => note.isPinned);
  }

  get unPinnedNotes(): Note[] {
    const notes = this.sortNotes(this._notes)
    return notes.filter(note => !note.isPinned);
  }

  get filteredPinnedNotes(): Note[] {
    const filteredNotes = this.filterAndSortNotes(this._notes, this.selectedLabel, this.searchTerm);
    return filteredNotes.filter(note => note.isPinned);
  }

  get filteredUnPinnedNotes(): Note[] {
    const filteredNotes = this.filterAndSortNotes(this._notes, this.selectedLabel, this.searchTerm);
    return filteredNotes.filter(note => !note.isPinned);
  }

  get trash(): Note[] {
    return this._notes.filter(note => note.delete === true);
  }

  private filterAndSortNotes(notes: Note[], selectedLabel: string, searchTerm: string): Note[] {
    const filteredNotes = notes.filter(note => {
      const matchesLabel = !selectedLabel || note.labels.some(label => label.id === selectedLabel);
      const matchesSearch = !searchTerm || this.noteMatchesSearch(note, searchTerm.toLowerCase());
      return matchesLabel && matchesSearch && !note.delete;
    });
    return filteredNotes.sort((a, b) => a.order - b.order);
  }

  private noteMatchesSearch(note: Note, searchTerm: string): boolean {
    if (note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)) {
      return true;
    }
    if (note.isChecklist && note.checklistItems) {
      return note.checklistItems.some(item =>
        item.text.toLowerCase().includes(searchTerm)
      );
    }
    if (note.labels && note.labels.length > 0) {
      return note.labels.some(label =>
        label.name.toLowerCase().includes(searchTerm)
      );
    }
    return false;
  }


  deleteAllNotes() {
    this.noteService.notes.forEach((note) => {
      if (note.delete == true)[
        this.noteService.deleteNotePermanently(note.id)
      ]
    })
  }
}
