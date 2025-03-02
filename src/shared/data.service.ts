import { Injectable } from '@angular/core';
import { Event, EventAction, EventDto, Purchase, RePayedDebt } from '../models/Event';
import { getLocalEvents, setOrganizerToLocalEvent } from '../utils/EventLocalStorage';
import { Feedback } from '../models/Feedback';
import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { forkJoin, Observable, throwError } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    private firestore: Firestore,
    private authService: AuthenticationService
  ) {}

  getCurrentUser(eventId: string) {
    return getLocalEvents().find(x => x.id === eventId)?.organizer || '';
  }

  setEventUser(eventId: string, member: string) {
    setOrganizerToLocalEvent(eventId, member);
  }

  getEvents(): Observable<EventDto[]> {
    const collectionRef = collection(
      this.firestore,
      `users/${this.authService.currentUserId}/events`
    );

    const ref = query(collectionRef, orderBy('date', 'desc'));
    return collectionData(ref, { idField: 'id' }) as Observable<EventDto[]>;
  }

  getEventById(eventId: string, customUserId = ''): Observable<EventDto> {
    const userId = customUserId ? customUserId : this.authService.currentUserId;

    if (!userId) {
      return throwError('User Id not found');
    }

    return forkJoin({
      event: this.getEventDoc(eventId, userId).pipe(take(1)),
      purchases: this.getPurchases(eventId, userId).pipe(take(1)),
      actions: this.getActions(eventId, userId).pipe(take(1)),
      rePayedDebts: this.getRePayedDebts(eventId, userId).pipe(take(1)),
    }).pipe(
      map(x => ({
        ...x.event,
        purchases: x.purchases,
        actions: x.actions,
        rePayedDebts: x.rePayedDebts,
      }))
    );
  }

  private getEventDoc(eventId: string, userId: string) {
    const ref = doc(this.firestore, `users/${userId}/events/${eventId}`);
    return docData(ref, { idField: 'id' }) as Observable<Event>;
  }

  async addEvent(event: Event) {
    const ref = collection(this.firestore, `users/${this.authService.currentUserId}/events`);
    return await addDoc(ref, event);
  }

  async updateEvent(event: Event) {
    const ref = doc(this.firestore, `users/${this.authService.currentUserId}/events/${event.id}`);
    return await updateDoc(ref, { ...event });
  }

  async deleteEvent(eventId: string) {
    const refEvent = doc(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}`
    );

    const refActions = collection(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/actions`
    );

    const refPurchases = collection(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/purchases`
    );

    const refRePayedDebts = collection(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/rePayedDebts`
    );

    return Promise.all([
      this.deleteCollection<EventAction>(refActions),
      this.deleteCollection<Purchase>(refPurchases),
      this.deleteCollection<RePayedDebt>(refRePayedDebts),
    ])
      .then(() => {
        return deleteDoc(refEvent);
      })
      .catch(err => {
        console.error(err);
        return Promise.reject();
      });
  }

  async deleteCollection<T extends { id?: string }>(ref: CollectionReference) {
    return ((await collectionData(ref, { idField: 'id' })) as Observable<T[]>)
      .pipe(take(1))
      .toPromise()
      .then(async items => {
        if (items) {
          for (const { id } of items) {
            const refDoc = doc(this.firestore, `${ref.path}/${id}`);
            await deleteDoc(refDoc);
          }
        }

        return Promise.resolve();
      });
  }

  getPurchases(eventId: string, userId: string) {
    const collectionRef = collection(this.firestore, `users/${userId}/events/${eventId}/purchases`);

    const ref = query(collectionRef, orderBy('date', 'desc'));
    return collectionData(ref, { idField: 'id' }) as Observable<Purchase[]>;
  }

  async addPurchase(eventId: string, purchase: Purchase) {
    const ref = collection(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/purchases`
    );
    return await addDoc(ref, purchase);
  }

  async updatePurchase(eventId: string, purchaseId: string, purchase: Purchase) {
    const ref = doc(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/purchases/${purchaseId}`
    );
    return await updateDoc(ref, { ...purchase });
  }

  async deletePurchase(eventId: string, purchaseId: string) {
    const purchaseRef = doc(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/purchases/${purchaseId}`
    );
    return await deleteDoc(purchaseRef);
  }

  getActions(eventId: string, userId: string) {
    const collectionRef = collection(this.firestore, `users/${userId}/events/${eventId}/actions`);

    const ref = query(collectionRef, orderBy('date', 'asc'));
    return collectionData(ref, { idField: 'id' }) as Observable<EventAction[]>;
  }

  async addEventAction(eventId: string, eventAction: EventAction) {
    const ref = collection(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/actions`
    );
    return await addDoc(ref, eventAction);
  }

  getRePayedDebts(eventId: string, userId: string) {
    const ref = collection(this.firestore, `users/${userId}/events/${eventId}/rePayedDebts`);
    return collectionData(ref, { idField: 'id' }) as Observable<RePayedDebt[]>;
  }

  async updateRePayedDebt(eventId: string, rePayedDebt: RePayedDebt) {
    const ref = collection(
      this.firestore,
      `users/${this.authService.currentUserId}/events/${eventId}/rePayedDebts`
    );
    const findDebtQuery = query(ref, where('name', '==', rePayedDebt.name));
    const rePayedDebtExists = await getDocs(findDebtQuery);

    if (rePayedDebtExists.empty) {
      return addDoc(ref, rePayedDebt);
    }

    return rePayedDebtExists.forEach(debt => {
      const oldDebtId = debt.id;
      const oldDebt = debt.data() as RePayedDebt;

      if (oldDebt.sum && rePayedDebt.sum) {
        rePayedDebt.sum += oldDebt.sum;
      }

      const debtRef = doc(
        this.firestore,
        `users/${this.authService.currentUserId}/events/${eventId}/rePayedDebts/${oldDebtId}`
      );

      return updateDoc(debtRef, { ...rePayedDebt });
    });
  }

  async addFeedback(feedback: Feedback) {
    const feedbackCollection = collection(this.firestore, 'feedbacks');
    return await addDoc(feedbackCollection, feedback);
  }
}
