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
    id: 'homelab-kubernetes',
    name: 'homelab',
    description: {
      en: 'A three-node k3s cluster used as a learning sandbox, a home for personal projects, and a private alternative to selected cloud services.',
      de: 'Ein dreiknotiger k3s-Cluster als Lernumgebung, zum Hosten persönlicher Projekte und als datenschutzfreundliche Alternative zu ausgewählten Cloud-Diensten.',
    },
    highlights: {
      en: [
        'Three-node k3s cluster',
        'FluxCD for GitOps operations',
        'CloudNativePG for distributed PostgreSQL workloads',
        'Longhorn for distributed storage',
      ],
      de: [
        'Dreiknotiger k3s-Cluster',
        'FluxCD für GitOps-Abläufe',
        'CloudNativePG für verteilte PostgreSQL-Workloads',
        'Longhorn für verteilten Speicher',
      ],
    },
    technologies: ['Kubernetes', 'k3s', 'FluxCD', 'GitOps', 'CloudNativePG', 'Longhorn'],
  },
  {
    id: 'metavision-opencv-sharp',
    name: 'metavision',
    description: {
      en: "Master's thesis project exploring microservice architecture through an image-based face extraction system.",
      de: 'Masterarbeitsprojekt zur Untersuchung einer Microservice-Architektur anhand eines bildbasierten Systems zur Gesichtsextraktion.',
    },
    highlights: {
      en: [
        'Microservice architecture with RabbitMQ as the message broker',
        'Image processing with OpenCV',
        'SMTP-based email delivery',
        'React frontend',
      ],
      de: [
        'Microservice-Architektur mit RabbitMQ als Message Broker',
        'Bildverarbeitung mit OpenCV',
        'E-Mail-Versand über SMTP',
        'React-Frontend',
      ],
    },
    technologies: ['.NET', 'Docker', 'System Design', 'React'],
  },
  {
    id: 'studyhubz-exam-sharing',
    name: 'studyhubz',
    description: {
      en: 'Reddit-inspired social platform for sharing past exams and helping students prepare for upcoming exams.',
      de: 'Reddit-inspirierte soziale Plattform zum Teilen vergangener Prüfungen und zur Vorbereitung auf kommende Klausuren.',
    },
    highlights: {
      en: [
        'Clean Architecture',
        'S3 bucket for storing uploaded PDFs',
        'AI-assisted PDF metadata generation',
        'More than 10 active users',
      ],
      de: [
        'Clean Architecture',
        'S3-Bucket zur Speicherung hochgeladener PDFs',
        'KI-gestützte Generierung von PDF-Metadaten',
        'Mehr als 10 aktive Nutzer',
      ],
    },
    technologies: ['Angular', 'Tailwind CSS', 'AI', 'Clean Architecture'],
  },
] as const satisfies readonly Project[];
