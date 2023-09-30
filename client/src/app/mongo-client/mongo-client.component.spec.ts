import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongoClientComponent } from './mongo-client.component';

describe('MongoClientComponent', () => {
  let component: MongoClientComponent;
  let fixture: ComponentFixture<MongoClientComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MongoClientComponent]
    });
    fixture = TestBed.createComponent(MongoClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
