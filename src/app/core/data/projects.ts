import type { Locale } from '../types/locale';

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: Readonly<Record<Locale, string>>;
  readonly technologies: readonly string[];
}

export const PROJECTS = [
  {
    id: 'project-placeholder',
    name: 'Project Placeholder',
    description: {
      en: 'A short project description — replace this with your own work.',
      de: 'Eine kurze Projektbeschreibung – ersetze diesen Text durch deine Arbeit.',
    },
    technologies: ['Angular', 'TypeScript'],
  },
  {
    id: 'another-experiment',
    name: 'Another Experiment',
    description: {
      en: 'Placeholder for a product, experiment, or case study link.',
      de: 'Platzhalter für ein Produkt, ein Experiment oder einen Case Study Link.',
    },
    technologies: ['Design systems', 'Web'],
  },
] as const satisfies readonly Project[];
