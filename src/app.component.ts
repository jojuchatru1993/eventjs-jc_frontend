import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './app/shared/components/loader/loader.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, LoaderComponent],
    template: `
        <router-outlet></router-outlet>
        <app-loader></app-loader>
    `
})
export class AppComponent {}
