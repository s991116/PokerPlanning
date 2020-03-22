import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningSessionComponent } from './planning-session.component';

describe('PlanningSessionComponent', () => {
  let component: PlanningSessionComponent;
  let fixture: ComponentFixture<PlanningSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanningSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
