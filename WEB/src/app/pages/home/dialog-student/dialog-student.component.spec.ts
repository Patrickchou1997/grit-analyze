import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogStudentComponent } from './dialog-student.component';

describe('DialogStudentComponent', () => {
  let component: DialogStudentComponent;
  let fixture: ComponentFixture<DialogStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
