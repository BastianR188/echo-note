import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelpickerComponent } from './labelpicker.component';

describe('LabelpickerComponent', () => {
  let component: LabelpickerComponent;
  let fixture: ComponentFixture<LabelpickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelpickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelpickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
