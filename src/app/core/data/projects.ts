import type { Locale } from '../types/locale';

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: Readonly<Record<Locale, string>>;
  readonly highlights: Readonly<Record<Locale, readonly string[]>>;
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
    highlights: {
      en: [
        'Placeholder project outcome',
        'Placeholder technical challenge',
        'Placeholder lesson learned',
      ],
      de: [
        'Platzhalter für ein Projektergebnis',
        'Platzhalter für eine technische Herausforderung',
        'Platzhalter für eine gewonnene Erkenntnis',
      ],
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
    highlights: {
      en: [
        'Placeholder user experience detail',
        'Placeholder system decision',
        'Placeholder project result',
      ],
      de: [
        'Platzhalter für ein UX-Detail',
        'Platzhalter für eine Systementscheidung',
        'Platzhalter für ein Projektergebnis',
      ],
    },
    technologies: ['Design systems', 'Web'],
  },
] as const satisfies readonly Project[];
