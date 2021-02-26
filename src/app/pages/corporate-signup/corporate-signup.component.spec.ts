import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateSignupComponent } from './corporate-signup.component';

describe('CorporateSignupComponent', () => {
  let component: CorporateSignupComponent;
  let fixture: ComponentFixture<CorporateSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporateSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporateSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
