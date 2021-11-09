import { Injectable } from '@angular/core';
import { Event, EventAction, Purchase } from '../models/Event';
import { getLocalEvents } from './localStorage.service';
import { Feedback } from '../models/Feedback';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  docData,
} from '@angular/fire/firestore';
import { mergeMap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private firestore: Firestore) {}

  getEvents(): Observable<Event> {
    const localEvents = getLocalEvents();
    return from(localEvents).pipe(mergeMap((x) => this.getEventById(x.id)));
  }

  getEventById(eventId: string): Observable<Event> {
    const ref = doc(this.firestore, `events/${eventId}`);
    return docData(ref, { idField: 'id' }) as Observable<Event>;
  }

  saveEvent(event: Event) {
    const ref = collection(this.firestore, 'events');
    return addDoc(ref, event);
  }

  updateEvent(event: Event) {
    const ref = doc(this.firestore, `events/${event.id}`);
    return updateDoc(ref, event);
  }

  addPurchase(eventId: string, data: Purchase) {
    const ref = collection(this.firestore, 'purchase');
    return addDoc(ref, data);
  }

  addEventAction(eventId: string, data: EventAction) {
    const ref = collection(this.firestore, `events/${eventId}/actions`);
    return addDoc(ref, data);
  }

  changePurchase(eventId: string, purchaseId: string, purchase: Purchase) {
    const ref = doc(
      this.firestore,
      `events/${eventId}/purchases/${purchaseId}`
    );
    return setDoc(ref, purchase);
  }

  repayDebt(eventId: string, sum: number, name: string) {
    const ref = doc(this.firestore, `events/${eventId}/repayedDebts/${name}`);
    return setDoc(ref, { sum });
  }

  deletePurchase(eventId: string, purchaseId: string) {
    const purchaseRef = doc(
      this.firestore,
      `events/${eventId}/purchases/${purchaseId}`
    );
    return deleteDoc(purchaseRef);
  }

  fetchUpdateMembers(eventId: string, members: string[]) {
    const ref = doc(this.firestore, `events/${eventId}/members`);
    return setDoc(ref, members);
  }

  async saveFeedback(feedback: Feedback) {
    const feedbackCollection = collection(this.firestore, 'feedbacks');
    return await addDoc(feedbackCollection, feedback);
  }
}
