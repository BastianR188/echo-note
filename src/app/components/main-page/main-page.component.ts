import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OfflineStorageService } from '../../services/offline-storage.service';
import { Settings } from '../../models/models';
import { LoginService } from '../../services/login.service';
import { LabelService } from '../../services/label.service';
import { NoteService } from '../../services/note.service';

@Component({
    selector: 'app-main-page',
    standalone: true,
    imports: [CommonModule, HeaderComponent, SideMenuComponent, DashboardComponent],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit, OnDestroy {
    settings: Settings = {
        userId: '',
        password: '',
        darkMode: false,
        noteIds: [],
        labelIds: [],
        autoLog: false
    };
    private subscription!: Subscription;
    private isDirectAccess: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private offlineService: OfflineStorageService,
        private loginService: LoginService,
        private labelService: LabelService,
        private noteService: NoteService
    ) {
        // Überprüfen, ob die Seite direkt aufgerufen wurde oder über die Navigation
        const navigation = this.router.getCurrentNavigation();
        if (navigation && navigation.extras && navigation.extras.state) {
            this.isDirectAccess = false;
        }
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/login']);
            return;
        }
        this.offlineService.loadSettings(id);
        this.subscription = this.offlineService.settings$.subscribe(data => {
            if (data) {
                this.settings = data;
                if (this.isDirectAccess && !this.settings.autoLog) {
                    this.router.navigate(['/login']);
                } else {
                    this.initializeServices(id);
                }
            } else {
                this.router.navigate(['/login']);
            }
        });
    }

    private initializeServices(id: string) {
        this.labelService.setUserId(id);
        this.noteService.setUserId(id);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    handleLogout() {
        this.settings.autoLog = false;
        this.loginService.saveAutoLoad(this.settings);
        this.router.navigate(['/login']);
    }

    onSetDarkMode(darkMode: boolean) {
        this.settings.darkMode = darkMode;
        this.offlineService.saveSettings(this.settings, this.settings.userId);
    }
}