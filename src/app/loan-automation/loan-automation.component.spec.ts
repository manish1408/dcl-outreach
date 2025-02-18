import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanAutomationComponent } from './loan-automation.component';

describe('InteractionsComponent', () => {
  let component: LoanAutomationComponent;
  let fixture: ComponentFixture<LoanAutomationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanAutomationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanAutomationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
