import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVideoComponent } from './customer-video.component';

describe('CustomerVideoComponent', () => {
  let component: CustomerVideoComponent;
  let fixture: ComponentFixture<CustomerVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
