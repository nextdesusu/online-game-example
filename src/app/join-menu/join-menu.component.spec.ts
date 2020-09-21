import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinMenuComponent } from './join-menu.component';

describe('JoinMenuComponent', () => {
  let component: JoinMenuComponent;
  let fixture: ComponentFixture<JoinMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
