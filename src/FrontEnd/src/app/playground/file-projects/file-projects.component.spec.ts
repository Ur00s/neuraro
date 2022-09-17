import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileProjectsComponent } from './file-projects.component';

describe('FileProjectsComponent', () => {
  let component: FileProjectsComponent;
  let fixture: ComponentFixture<FileProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileProjectsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
