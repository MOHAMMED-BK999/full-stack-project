import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import {Accueil} from './accueil/accueil'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Navbar,Accueil],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('e-store-frontend');

}
