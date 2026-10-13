import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName = 'github' | 'linkedin' | 'mail' | 'arrow-up-right';

/** Minimal inline Lucide set. Paths follow the MIT-licensed icons from lucide.dev. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-lucide',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('github') {
          <path
            d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-1.5 6-6a4.6 4.6 0 0 0-1-3.5 4.2 4.2 0 0 0-.1-3.5S17.7 1.5 15 3a13.4 13.4 0 0 0-6 0C6.3 1.5 5.1 2.5 5.1 2.5A4.2 4.2 0 0 0 5 6c-1 .9-1 2.5-1 3.5 0 4.5 3 6 6 6a4.8 4.8 0 0 0-1 3.5v3"
          />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        }
        @case ('linkedin') {
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        }
        @case ('mail') {
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        }
        @case ('arrow-up-right') {
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        }
      }
    </svg>
  `,
})
export class LucideIcon {
  readonly name = input<IconName>('github');
  readonly size = input(18);
  readonly strokeWidth = input(1.8);
}
