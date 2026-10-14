import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: '<div class="container state-panel"><p class="eyebrow">404 · PÁGINA NO ENCONTRADA</p><h1>Esta historia empieza en otro sitio.</h1><p>El enlace que has abierto no existe. El catálogo te está esperando.</p><a class="button" routerLink="/">Volver a descubrir</a></div>',
  styles: ':host { display: block; padding-top: 50px; } h1 { font-size: 30px; }',
})
export class NotFoundComponent {}
