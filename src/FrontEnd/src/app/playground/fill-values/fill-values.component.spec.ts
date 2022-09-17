import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FillValuesComponent } from './fill-values.component';

describe('FillValuesComponent', () => {
  let component: FillValuesComponent;
  let fixture: ComponentFixture<FillValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FillValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FillValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
