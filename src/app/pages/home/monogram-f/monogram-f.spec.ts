import { TestBed } from '@angular/core/testing';
import { MonogramF } from './monogram-f';

describe('MonogramF', () => {
  it('renders a localized accessible name', async () => {
    await TestBed.configureTestingModule({ imports: [MonogramF] }).compileComponents();
    const fixture = TestBed.createComponent(MonogramF);
    fixture.componentRef.setInput('locale', 'de');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Interaktives F-Monogramm');
    expect(button.getAttribute('aria-describedby')).toBe('monogram-f-instruction');
    expect(button.textContent).toContain('Zum Bewegen');
  });

  it('enters the drop state when activated', async () => {
    await TestBed.configureTestingModule({ imports: [MonogramF] }).compileComponents();
    const fixture = TestBed.createComponent(MonogramF);
    fixture.componentRef.setInput('locale', 'en');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(() => button.click()).not.toThrow();
    fixture.detectChanges();

    expect(button.dataset['dropState']).toBe('dropping');
    expect(button.dataset['impact']).toBe('active');
  });
});
