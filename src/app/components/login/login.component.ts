import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule], 
  template: `
<div class="login-wrapper">
  <div class="login-card">
    <img src="assets/google_logo.svg" class="login-logo" alt="Google Logo" />
    <h2>Sign in with Google</h2>
    <p class="subtitle">Securely access your account using your Google credentials.</p>
    
    <div id="g_id_onload"
        data-client_id="499164549963-raefhmpv5lcjf6nfa7gfo2r4t527hgom.apps.googleusercontent.com"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false">
    </div>
    <div class="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="pill"
        data-logo_alignment="left">
    </div>
  </div>
</div>

  `,
styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #e0f7fa, #ffffff);
    }
  
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 20px;
    }
  
    .login-card {
      background: white;
      padding: 3rem 2.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
  
    .login-logo {
    
      height: 48px;
      margin-bottom: 1rem;
    }
  
    h2 {
      font-size: 24px;
      margin-bottom: 0.5rem;
      color: #333;
    }
  
    .subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 2rem;
    }
  
    .g_id_signin {
      margin-top: 1rem;
      display: inline-block;
    }
  `]
  
  
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    (window as any).handleCredentialResponse = (response: any) => {
      const token = response.credential;
      const decoded = this.decodeJwt(token);
  
      const user = {
        name: decoded.name,
        photoUrl: decoded.picture
      };
  
      this.authService.setUser(user);
  
      this.ngZone.run(() => {
        this.router.navigate(['/landing']);
      });
    };
  }
  
  decodeJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  }
  
}
