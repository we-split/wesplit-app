import { EventDto, LocalEvent } from '../models/Event';

export function getLocalEvents(): LocalEvent[] {
  try {
    return JSON.parse(localStorage.getItem('localEvents') || '[]') as LocalEvent[];
  } catch (e) {
    console.error(e);
  }

  return [];
}

export function setLocalEvents(events: EventDto[]) {
  const newLocalEvents = events.map(({ id, organizer }) => ({ id, organizer }));

  localStorage.setItem('localEvents', JSON.stringify(newLocalEvents));

  return newLocalEvents;
}

export function setOrganizerToLocalEvent(id: string, organizer: string) {
  const newLocalEventToSave: LocalEvent = { id, organizer };

  let oldLocalEvents = getLocalEvents();
  if (oldLocalEvents.some(x => x.id === id)) {
    oldLocalEvents = oldLocalEvents.filter(x => x.id !== id);
  }

  const newLocalEvents = [...oldLocalEvents, newLocalEventToSave];

  localStorage.setItem('localEvents', JSON.stringify(newLocalEvents));

  return newLocalEvents;
}
