import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { EventsWidget } from './components/eventswidget';
import { FooterWidget } from './components/footerwidget';
import { ScrollService } from './services/scroll.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, FeaturesWidget, EventsWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget />
                <features-widget />
                <events-widget />
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing implements OnInit {
    private route = inject(ActivatedRoute);
    private scrollService = inject(ScrollService);

    ngOnInit(): void {
        this.route.fragment.subscribe((fragment) => {
            if (fragment) {
                setTimeout(() => {
                    this.scrollService.scrollToElement(fragment);
                }, 100);
            }
        });
    }
}
