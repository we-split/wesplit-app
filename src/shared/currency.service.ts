import { Injectable } from '@angular/core';

const USER_CURRENCY = 'user-currency';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  currencies: { icon: string; name: string; acronym: string }[] = [
    {
      icon: 'currency_ruble',
      name: 'RUB',
      acronym: '₽',
    },
    {
      icon: 'attach_money',
      name: 'USD',
      acronym: '$',
    },
    {
      icon: 'euro',
      name: 'EUR',
      acronym: '€',
    },
  ];

  initCurrency() {
    const currency = this.getCurrency();
    this.update(currency);
  }

  getCurrency(): string {
    return localStorage.getItem(USER_CURRENCY) ?? 'RUB';
  }

  getCurrencyAcronym(): string {
    const currencyName = localStorage.getItem(USER_CURRENCY) ?? 'RUB';
    const currency = this.currencies?.find(x => x.name === currencyName);

    return currency?.acronym ?? '';
  }

  update(currency: string): void {
    localStorage.setItem(USER_CURRENCY, currency);
  }
}
