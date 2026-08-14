export type EventMapHandlers<EventMap extends Record<string, any>> = {
  [Event in keyof EventMap]?: (event: EventMap[Event]) => void | Promise<void>;
};

export class EventMapDispatcher<EventMap extends Record<string, any>> {
  handlers: Set<EventMapHandlers<EventMap>> = new Set();

  subscribe(handlers: EventMapHandlers<EventMap>): () => void {
    if (!handlers) return () => {};

    if (Object.keys(handlers).length === 0) return () => {};

    this.handlers.add(handlers);

    return () => {
      this.handlers.delete(handlers);
    };
  }

  emit<K extends keyof EventMap>(key: K, event: EventMap[K]) {
    for (const listener of this.handlers) {
      listener[key]?.(event);
    }
  }
}
