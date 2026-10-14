import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { Locale } from '../../../core/types/locale';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-monogram-f',
  imports: [],
  templateUrl: './monogram-f.html',
})
export class MonogramF {
  readonly locale = input.required<Locale>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly dropGroup = viewChild<SVGGElement>('dropGroup');
  private readonly interactiveMonogram = viewChild<SVGGElement>('interactiveMonogram');
  private readonly finePointerState = signal(false);
  private readonly reducedMotionState = signal(false);
  private readonly pointerActiveState = signal(false);
  private readonly pointerXState = signal(0);
  private readonly pointerYState = signal(0);
  private readonly settledState = signal(true);
  private readonly droppingState = signal(false);
  private readonly impactState = signal(false);
  private impactTimer: ReturnType<typeof setTimeout> | undefined;
  private finishTimer: ReturnType<typeof setTimeout> | undefined;

  readonly finePointer = this.finePointerState.asReadonly();
  readonly reducedMotion = this.reducedMotionState.asReadonly();
  readonly settled = this.settledState.asReadonly();
  readonly dropping = this.droppingState.asReadonly();
  readonly impactActive = this.impactState.asReadonly();
  readonly accessibleLabel = computed(() =>
    this.locale() === 'de' ? 'Interaktives F-Monogramm' : 'Interactive F monogram',
  );
  readonly interactionHint = computed(() =>
    this.locale() === 'de'
      ? 'Zum Bewegen mit Maus oder Stift über das F fahren. Zum Fallenlassen das F anklicken oder Enter drücken.'
      : 'Move over the F with a mouse or pen. Click the F or press Enter to drop it.',
  );
  readonly parallaxTransform = computed(
    () =>
      `translate(${this.pointerXState()}px ${this.pointerYState()}px) rotate(${this.pointerXState() * 0.16}deg)`,
  );
  readonly elevationTransform = computed(() =>
    this.pointerActiveState() && !this.reducedMotionState() ? 'translateY(-7px)' : 'translateY(0)',
  );
  readonly shadowTransform = computed(() => {
    if (this.impactState()) return 'translate(0 7) scale(1.2 1.18)';
    if (this.pointerActiveState() && !this.reducedMotionState())
      return 'translate(0 2) scale(0.86 0.72)';
    return 'translate(0 0) scale(1 1)';
  });
  readonly shadowOpacity = computed(() => {
    if (this.impactState()) return '0.3';
    if (this.pointerActiveState() && !this.reducedMotionState()) return '0.13';
    return '0.22';
  });

  constructor() {
    afterNextRender(() => this.setupMotionPreferences());
    this.destroyRef.onDestroy(() => {
      this.clearTimers();
    });
  }

  onButtonClick(event: MouseEvent): void {
    if (event.detail === 0 || this.isMonogramTarget(event.target)) this.activate();
  }

  activate(): void {
    if (this.droppingState()) return;

    this.settledState.set(false);
    this.droppingState.set(true);
    this.impactState.set(false);
    this.clearTimers();

    const group = this.dropGroup();
    const canAnimate = !this.reducedMotionState() && group && typeof group.animate === 'function';

    if (canAnimate) {
      const animation = group.animate(
        [
          { transform: 'translateY(0px)' },
          { transform: 'translateY(22px)', offset: 0.42 },
          { transform: 'translateY(-7px)', offset: 0.66 },
          { transform: 'translateY(3px)', offset: 0.84 },
          { transform: 'translateY(0px)' },
        ],
        { duration: 720, easing: 'cubic-bezier(0.2, 0.75, 0.3, 1)', fill: 'none' },
      );
      this.impactTimer = setTimeout(() => this.impactState.set(true), 290);
      animation.onfinish = () => this.finishDrop();
      animation.oncancel = () => this.finishDrop();
      return;
    }

    this.impactState.set(true);
    this.finishTimer = setTimeout(() => this.finishDrop(), 360);
  }

  onPointerEnter(event: PointerEvent): void {
    if (!this.canTrackPointer(event)) return;

    this.pointerActiveState.set(true);
    this.updatePointer(event);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.canTrackPointer(event)) return;

    this.updatePointer(event);
  }

  onPointerLeave(): void {
    if (!this.finePointerState() || this.reducedMotionState()) return;

    this.pointerActiveState.set(false);
    this.pointerXState.set(0);
    this.pointerYState.set(0);
  }

  private canTrackPointer(event: PointerEvent): boolean {
    return (
      this.finePointerState() &&
      !this.reducedMotionState() &&
      (event.pointerType === 'mouse' || event.pointerType === 'pen')
    );
  }

  private updatePointer(event: PointerEvent): void {
    const target = event.currentTarget;
    if (!(target instanceof Element)) return;

    const bounds = target.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
    this.pointerXState.set(Math.max(-1, Math.min(1, normalizedX)) * 7);
    this.pointerYState.set(Math.max(-1, Math.min(1, normalizedY)) * 5);
  }

  private isMonogramTarget(target: EventTarget | null): boolean {
    return target instanceof Node && this.interactiveMonogram()?.contains(target) === true;
  }

  private setupMotionPreferences(): void {
    const finePointerQuery = window.matchMedia('(pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateFinePointer = () => this.finePointerState.set(finePointerQuery.matches);
    const updateReducedMotion = () => {
      const reducedMotion = reducedMotionQuery.matches;
      this.reducedMotionState.set(reducedMotion);
      if (reducedMotion) this.resetPointer();
    };

    updateFinePointer();
    updateReducedMotion();
    finePointerQuery.addEventListener('change', updateFinePointer);
    reducedMotionQuery.addEventListener('change', updateReducedMotion);
    this.destroyRef.onDestroy(() => {
      finePointerQuery.removeEventListener('change', updateFinePointer);
      reducedMotionQuery.removeEventListener('change', updateReducedMotion);
    });
  }

  private resetPointer(): void {
    this.pointerActiveState.set(false);
    this.pointerXState.set(0);
    this.pointerYState.set(0);
  }

  private finishDrop(): void {
    this.impactState.set(false);
    this.droppingState.set(false);
    this.settledState.set(true);
    this.impactTimer = undefined;
    this.finishTimer = undefined;
  }

  private clearTimers(): void {
    if (this.impactTimer !== undefined) clearTimeout(this.impactTimer);
    if (this.finishTimer !== undefined) clearTimeout(this.finishTimer);
    this.impactTimer = undefined;
    this.finishTimer = undefined;
  }
}
