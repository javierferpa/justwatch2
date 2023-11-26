import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardDisplayComponent } from './card-display/card-display.component';
import { CardDetailComponent } from './card-detail/card-detail.component';

export const routes: Routes = [
    { path: '', component: CardDisplayComponent },
    { path: 'card-detail/:id', component: CardDetailComponent },
  
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })

  export class AppRoutingModule {}

