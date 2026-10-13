import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'en', pathMatch: 'full' },
  {
    path: ':locale',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((module) => module.HomePage),
        title: 'Lucien Siani | Fullstack .NET Engineer',
      },
      {
        path: 'writing',
        loadComponent: () => import('./pages/writing/writing').then((module) => module.WritingPage),
      },
      {
        path: 'writing/:slug',
        loadComponent: () => import('./pages/post/post').then((module) => module.PostPage),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found').then((module) => module.NotFoundPage),
      },
    ],
  },
  { path: '**', redirectTo: 'en' },
];
