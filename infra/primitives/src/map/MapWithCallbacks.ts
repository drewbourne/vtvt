export type MapCallbackFn<Key = string, Value = unknown> =
  | ((key: Key, value: Value) => void)
  | ((key: Key, value: Value) => Promise<void>);

export type MapWithCallbacksFns<Key = string, Value = unknown> = {
  onFirstAdded?: MapCallbackFn<Key, Value>;
  onFirstAddedForKey?: MapCallbackFn<Key, Value>;
  onLastRemoved?: MapCallbackFn<Key, Value>;
  onLastRemovedForKey?: MapCallbackFn<Key, Value>;
};

export class MapWithCallbacks<Key = string, Value = unknown> {
  private readonly map: Map<Key, Value[]> = new Map();
  private readonly fns: MapWithCallbacksFns<Key, Value> = {};

  constructor({
    onFirstAdded,
    onFirstAddedForKey,
    onLastRemoved,
    onLastRemovedForKey,
  }: MapWithCallbacksFns<Key, Value>) {
    this.fns = {
      onFirstAdded,
      onFirstAddedForKey,
      onLastRemoved,
      onLastRemovedForKey,
    };
  }

  keys() {
    return this.map.keys();
  }

  entries() {
    return this.map.entries();
  }

  values(key: Key): Value[] {
    return [...(this.map.get(key) ?? [])];
  }

  async add(key: Key, value: Value) {
    // console.log("MapWithCallbacks", {
    //   key,
    //   has: this.map.has(key),
    //   size: this.map.get(key)?.length ?? "-",
    // });

    if (!this.map.has(key)) {
      const isFirst = this.map.size === 0;

      this.map.set(key, [value]);

      if (isFirst) {
        await this.fns.onFirstAdded?.(key, value);
      }

      await this.fns.onFirstAddedForKey?.(key, value);
    } else {
      this.map.set(key, [...this.map.get(key)!, value]);
    }
  }

  async remove(key: Key, value: Value) {
    const values = this.map.get(key);
    if (!values) return;

    const nextValues = values.filter((v) => v !== value);
    if (nextValues.length > 0) {
      this.map.set(key, nextValues);
    } else {
      this.map.delete(key);

      await this.fns.onLastRemovedForKey?.(key, value);

      if (this.map.size === 0) {
        await this.fns.onLastRemoved?.(key, value);
      }
    }
  }
}
