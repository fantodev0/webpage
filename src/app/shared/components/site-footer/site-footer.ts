import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type Locale } from '../../../core/types/locale';
import { LucideIcon } from '../lucide-icon/lucide-icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-site-footer',
  imports: [LucideIcon],
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  readonly locale = input.required<Locale>();
}
