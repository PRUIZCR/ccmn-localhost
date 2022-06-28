import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivoAdjuntoComponent } from './archivo-adjunto.component';

describe('ArchivoAdjuntoComponent', () => {
  let component: ArchivoAdjuntoComponent;
  let fixture: ComponentFixture<ArchivoAdjuntoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivoAdjuntoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivoAdjuntoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
