import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = new BehaviorSubject<any>(this.getStoredUser());
  user$ = this.user.asObservable();

  private getStoredUser() {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  setUser(user: any) {
    this.user.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    return this.user.value;
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return this.user.value !== null;
  }
}
