import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCcmnComponent } from './listar-ccmn.component';

describe('ListarCcmnComponent', () => {
  let component: ListarCcmnComponent;
  let fixture: ComponentFixture<ListarCcmnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarCcmnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarCcmnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
