import { Injectable } from '@angular/core';
import { ActionTypes, EventAction } from '../models/Event';
import { utc } from 'moment';

@Injectable({
  providedIn: 'root',
})
export class EventActionCreator {
  changeEventName(
    currentUser: string,
    eventName: string,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      eventName,
      date,
      type: ActionTypes.ChangeEventName,
    };
  }

  changeEventDate(currentUser: string, date: number): EventAction {
    return {
      currentUser,
      date,
      type: ActionTypes.ChangeEventDate,
    };
  }

  addMemberToEvent(
    currentUser: string,
    memberName: string,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      memberName,
      date,
      type: ActionTypes.AddMemberToEvent,
    };
  }

  removeMemberFromEvent(
    currentUser: string,
    memberName: string,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      memberName,
      date,
      type: ActionTypes.RemoveMemberFromEvent,
    };
  }

  addPurchase(
    currentUser: string,
    purchaseName: string,
    sum: number,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      purchaseName,
      sum,
      date,
      type: ActionTypes.AddPurchase,
    };
  }

  deletePurchase(
    currentUser: string,
    purchaseName: string,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      purchaseName,
      date,
      type: ActionTypes.DeletePurchase,
    };
  }

  addMemberToPurchase(
    currentUser: string,
    payerName: string,
    purchaseName: string,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      payerName,
      purchaseName,
      date,
      type: ActionTypes.AddMemberToPurchase,
    };
  }

  addMembersToPurchase(
    currentUser: string,
    purchaseMembersCount: number,
    purchaseName: string,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      purchaseMembersCount,
      purchaseName,
      date,
      type: ActionTypes.AddMembersToPurchase,
    };
  }

  removeMemberFromPurchase(
    currentUser: string,
    payerName: string,
    purchaseName: string,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      payerName,
      purchaseName,
      date,
      type: ActionTypes.RemoveMemberFromPurchase,
    };
  }

  giveBackPartially(
    currentUser: string,
    payerName: string,
    debtSum: number,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      payerName,
      debtSum,
      date,
      type: ActionTypes.GiveBackPartially,
    };
  }

  giveBack(
    currentUser: string,
    payerName: string,
    debtSum: number,
    date: number = utc().valueOf()
  ): EventAction {
    return {
      currentUser,
      payerName,
      debtSum,
      date,
      type: ActionTypes.GiveBack,
    };
  }
}
