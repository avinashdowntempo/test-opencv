import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentVideoComponent } from './agent-video.component';

describe('AgentVideoComponent', () => {
  let component: AgentVideoComponent;
  let fixture: ComponentFixture<AgentVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
