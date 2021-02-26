import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderSignupComponent } from './rider-signup.component';

describe('RiderSignupComponent', () => {
  let component: RiderSignupComponent;
  let fixture: ComponentFixture<RiderSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiderSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
