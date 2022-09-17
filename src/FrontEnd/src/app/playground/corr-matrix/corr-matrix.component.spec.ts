import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrMatrixComponent } from './corr-matrix.component';

describe('CorrMatrixComponent', () => {
  let component: CorrMatrixComponent;
  let fixture: ComponentFixture<CorrMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrMatrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
