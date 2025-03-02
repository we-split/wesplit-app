import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithPopup,
  AuthProvider,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser$: Observable<any>;

  constructor(private auth: Auth) {
    this.currentUser$ = authState(this.auth);
  }

  get currentUserId(): string {
    return localStorage.getItem('uid') ?? '';
  }

  get isGuestMode(): boolean {
    return !this.auth.currentUser && Boolean(localStorage.getItem('uid'));
  }

  async loginWithService(service: string) {
    let provider!: AuthProvider;

    switch (service) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'github':
        provider = new GithubAuthProvider();
        break;
    }

    return await signInWithPopup(this.auth, provider);
  }

  async loginWitEmailAndPassword(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    localStorage.removeItem('uid');
    localStorage.removeItem('localEvents');

    return await this.auth.signOut();
  }
}
