import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        EventsJC desarrollado por
        <a href="https://julian-tech.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">julian-tech.com</a>
    </div>`
})
export class AppFooter {}
