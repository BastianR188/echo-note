import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  userId: string = '';
  password: string = '';
  autoLogin: boolean = false;

  constructor(private loginService: LoginService) { }

  ngOnInit(): void {
    this.loginService.autoLoad()
  }

  validatePassword(password: string): boolean {
    const minLength = 2;
    return password.length >= minLength;
  }

  async login() {
    if (!this.validatePassword(this.password)) {
      alert('Password does not meet security requirements');
      return;
    }
    this.loginService.login(this.userId, this.password, this.autoLogin);
    this.resetLogin();
  }

  resetLogin() {
    this.userId = '';
    this.password = '';
    this.autoLogin = false;
  }
}