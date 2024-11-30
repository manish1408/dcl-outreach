import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllChatbotsComponent } from './all-chatbots.component';

describe('AllChatbotsComponent', () => {
  let component: AllChatbotsComponent;
  let fixture: ComponentFixture<AllChatbotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllChatbotsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllChatbotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
