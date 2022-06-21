import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EaEditccmnDatostranspComponent } from './ea-editccmn-datostransp.component';

describe('EaEditccmnDatostranspComponent', () => {
  let component: EaEditccmnDatostranspComponent;
  let fixture: ComponentFixture<EaEditccmnDatostranspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EaEditccmnDatostranspComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EaEditccmnDatostranspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
