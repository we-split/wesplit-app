import { getLocalEvents, setOrganizerToLocalEvent } from './EventLocalStorage';

export type LocalStorage = Record<string, string>;

let localStore: LocalStorage = {};

beforeEach(() => {
  spyOn(localStorage, 'getItem').and.callFake(key => (key in localStore ? localStore[key] : null));

  spyOn(localStorage, 'setItem').and.callFake((key, value) => (localStore[key] = value + ''));

  spyOn(localStorage, 'clear').and.callFake(() => (localStore = {}));
});

describe('Local storage events test', function () {
  it('should save event correctly', () => {
    // Arrange
    const id = 'test-id';
    const organizer = 'Emil';

    // Act
    const newEvents = setOrganizerToLocalEvent(id, organizer);
    const events = getLocalEvents();

    // Assert
    expect(newEvents).toEqual(events);
    expect(events[0].id).toBe('test-id');
    expect(events[0].organizer).toBe('Emil');
  });

  it('should save event correctly if same event exists', () => {
    // Arrange
    const id = 'test-id';
    const organizer = 'Emil';

    // Act
    setOrganizerToLocalEvent(id, organizer);
    setOrganizerToLocalEvent(id, 'Ivan');
    const events = getLocalEvents();

    // Assert
    expect(events.length).toBe(1);
    expect(events[0].id).toEqual('test-id');
    expect(events[0].organizer).toEqual('Ivan');
  });
});
