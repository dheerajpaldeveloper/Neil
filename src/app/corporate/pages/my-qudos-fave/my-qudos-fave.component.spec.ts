import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyQudosFaveComponent } from './my-qudos-fave.component';

describe('MyQudosFaveComponent', () => {
  let component: MyQudosFaveComponent;
  let fixture: ComponentFixture<MyQudosFaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyQudosFaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyQudosFaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
