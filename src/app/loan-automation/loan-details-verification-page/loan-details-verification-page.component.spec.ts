import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanDetailsVerificationPage } from './loan-details-verification-page.component';


describe('LoanDetailsVerificationPage', () => {
  let component: LoanDetailsVerificationPage;
  let fixture: ComponentFixture<LoanDetailsVerificationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanDetailsVerificationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanDetailsVerificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
