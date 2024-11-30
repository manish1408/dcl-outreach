import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowsJabComponent } from './workflows-jab.component';

describe('WorkflowsJabComponent', () => {
  let component: WorkflowsJabComponent;
  let fixture: ComponentFixture<WorkflowsJabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowsJabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowsJabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
