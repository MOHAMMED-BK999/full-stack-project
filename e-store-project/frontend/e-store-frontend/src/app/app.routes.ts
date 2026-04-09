import { Routes } from '@angular/router';
import { Catalog } from './catalog/catalog';
import { Accueil } from './accueil/accueil';
import { Commands } from './commands/commands';
import { Connexion } from './connexion/connexion';
import { Inscription } from './inscription/inscription';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'accueil', component: Accueil },
  { path: 'catalog', component: Catalog },
  { path: 'commands', component: Commands },
  { path: 'connexion', component: Connexion },
  { path: 'inscription', component: Inscription },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
