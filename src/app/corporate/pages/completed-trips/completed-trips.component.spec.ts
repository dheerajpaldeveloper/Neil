import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTripsComponent } from './completed-trips.component';

describe('CompletedTripsComponent', () => {
  let component: CompletedTripsComponent;
  let fixture: ComponentFixture<CompletedTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedTripsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
