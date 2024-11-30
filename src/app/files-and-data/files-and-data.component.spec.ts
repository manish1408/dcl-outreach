import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesAndDataComponent } from './files-and-data.component';

describe('FilesAndDataComponent', () => {
  let component: FilesAndDataComponent;
  let fixture: ComponentFixture<FilesAndDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesAndDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilesAndDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
