import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'accueil',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'connexion',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'inscription',
    renderMode: RenderMode.Prerender,
  },
  {
    // Authenticated / dynamic pages should not be prerendered (they're user-specific).
    path: '**',
    renderMode: RenderMode.Server,
  },
];
