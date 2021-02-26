import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QudosfaveComponent } from './qudosfave.component';

describe('QudosfaveComponent', () => {
  let component: QudosfaveComponent;
  let fixture: ComponentFixture<QudosfaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QudosfaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QudosfaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
