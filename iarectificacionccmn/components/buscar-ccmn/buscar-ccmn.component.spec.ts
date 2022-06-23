import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarCcmnComponent } from './buscar-ccmn.component';

describe('BuscarCcmnComponent', () => {
  let component: BuscarCcmnComponent;
  let fixture: ComponentFixture<BuscarCcmnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarCcmnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarCcmnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
