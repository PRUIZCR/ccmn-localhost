import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EaEditccmnInicioComponent } from './ea-editccmn-inicio.component';

describe('EaEditccmnInicioComponent', () => {
  let component: EaEditccmnInicioComponent;
  let fixture: ComponentFixture<EaEditccmnInicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EaEditccmnInicioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EaEditccmnInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
