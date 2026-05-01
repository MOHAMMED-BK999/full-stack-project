import { Routes } from '@angular/router';
import { Catalog } from './catalog/catalog';
import { Accueil } from './accueil/accueil';
import { Commands } from './commands/commands';
import { Connexion } from './connexion/connexion';
import { Inscription } from './inscription/inscription';
import { Bills } from './bills/bills';
import { Profile } from './profile/profile';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'accueil', component: Accueil },
  { path: 'catalog', component: Catalog, canActivate: [authGuard] },
  { path: 'commands', component: Commands, canActivate: [authGuard] },
  { path: 'connexion', component: Connexion },
  { path: 'inscription', component: Inscription },
  { path: 'bills', component: Bills, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
