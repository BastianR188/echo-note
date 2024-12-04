import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Note, Settings } from '../../../../models/models';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NoteService } from '../../../../services/note.service';
import { MemoComponent } from '../../../../template/memo/memo.component';
import { LabelService } from '../../../../services/label.service';
import { EditNoteComponent } from '../../../../template/memo/edit-note/edit-note.component';

@Component({
  selector: 'app-dynamic-layout',
  standalone: true,
  imports: [CommonModule,EditNoteComponent, CdkDropList, CdkDrag, MemoComponent],
  templateUrl: './dynamic-layout.component.html',
  styleUrl: './dynamic-layout.component.scss'
})
export class DynamicLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('columnContainer', { static: false }) columnContainer!: ElementRef;
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
  @Input() settings!: Settings
  @Input() filtered: Note[] = [];
  @Input() allNotes: Note[] = []
  @Input() minColumnWidth: number = 240;
  columns: Note[][] = [];
  columnHeights: number[] = [];
  gridTemplateColumns: string = '';
  private resizeSubject = new Subject<void>();
  public resize$ = this.resizeSubject.asObservable();
  private sideMenuIsOpenSubscription!: Subscription;
  isEditing: boolean = false;
  editNote: Note[] = [];

  constructor(
    private labelService: LabelService,
    private cdr: ChangeDetectorRef,
    private noteService: NoteService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.setupResizeListeners();
    this.resize$.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.updateItems();
    });
    this.sideMenuIsOpenSubscription = this.labelService.sideMenuIsOpen$.subscribe(
      state => {
        this.updateItems();
      }
    )
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateItems();
    }, 300);
  }

  ngOnDestroy() {
    this.destroy();
    if (this.sideMenuIsOpenSubscription) {
      this.sideMenuIsOpenSubscription.unsubscribe();
    }
  }

  private setupResizeListeners() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize);
      document.addEventListener('fullscreenchange', this.onFullscreenChange);
    });
  }

  private onResize = () => {
    this.ngZone.run(() => this.resizeSubject.next());
  }

  private onFullscreenChange = () => {
    setTimeout(() => {
      this.ngZone.run(() => this.resizeSubject.next());
    }, 300);
  }

  private destroy() {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  updateItems(): void {
    setTimeout(() => {
      this.updateColumnCount();
      this.distributeItems();
    }, 300);
  }

  updateColumnCount() {
    let availableWidth: number = 0
    if
      (this.columnContainer && this.columnContainer.nativeElement) {
      const containerElement = this.columnContainer.nativeElement;
      availableWidth = containerElement.clientWidth
    } else {
      availableWidth = window.innerWidth;
    }
    const maxColumns = Math.floor(availableWidth / this.minColumnWidth);
    const itemCount = this.filtered.length;
    let columnCount = Math.max(1, Math.min(maxColumns, itemCount));
    if (columnCount === 0) {
      columnCount = 1;
    }
    this.columns = Array.from({ length: columnCount }, () => []);
    this.columnHeights = Array(columnCount).fill(0);
    this.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
    this.distributeItems();
  }

  drop(event: CdkDragDrop<Note[]>) {
    try {
      const layoutNotes = this.columns.flat();
      const draggedNote = event.item.data as Note;
      let targetIndex
      targetIndex = event.container.data[event.currentIndex];
      if (targetIndex === undefined) {
        targetIndex = event.container.data[event.container.data.length - 1];
      }
      this.updateNotesOrder(layoutNotes, draggedNote, targetIndex.order);
      this.distributeItems();
    } catch {
    }
  }

  private updateNotesOrder(layoutNotes: Note[], draggedNote: Note, targetIndex: number) {
    this.allNotes.sort((a, b) => a.order - b.order);
    const oldIndex = draggedNote.order;
    if (oldIndex < targetIndex) {
      for (let i = targetIndex; i > oldIndex; i--) {
        this.allNotes[i].order = i - 1;
      }
    } else if (oldIndex > targetIndex) {
      for (let i = targetIndex; i < oldIndex; i++) {
        this.allNotes[i].order = i + 1;
      }
    }
    draggedNote.order = targetIndex;
    this.noteService.saveNotes(this.allNotes)
  }

  distributeItems() {
    const sortedItems = [...this.filtered].sort((a, b) => a.order - b.order);
    this.columns.forEach(column => column.length = 0);
    sortedItems.forEach((item, index) => {
      const columnIndex = index % this.columns.length;
      this.columns[columnIndex].push(item);
      this.cdr.detectChanges();
    });
  }


  getConnectedLists(currentIndex: number): CdkDropList[] {
    if (!this.dropLists) {
      return [];
    }
    return this.dropLists.toArray().filter((_, index) => index !== currentIndex);
  }


  editingNote(isEdit:boolean) {
    this.isEditing = isEdit
  }

  setEditNote(note: Note){
    this.editNote = [];
    this.editNote.push(note)
  }

  checkIfEmpty(note: Note) {
    if (note.attachments.length == 0 && note.title.length == 0 && note.content.length == 0 && note.checklistItems.length == 0) {
      this.deleteNote(note);
    }
  }

  abortEditNote(note: Note) {
    this.isEditing = false;
    this.editNote = [];
    this.checkIfEmpty(note);
    this.saveNote(note)
  }

  deleteNote(note: Note) {
    this.noteService.moveToTrash(note);
    this.saveNote(note)
  }

  saveNote(note: Note) {
    this.noteService.updateNote(note, note.isPinned)
  }
}
