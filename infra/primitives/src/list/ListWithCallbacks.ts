export class ListWithCallbacks<Value = unknown> {
  private list: Value[] = [];

  private readonly fns: {
    onFirstAdded?: (value: Value) => void;
    onLastRemoved?: (value: Value) => void;
  } = {};

  constructor({
    onFirstAdded,
    onLastRemoved,
  }: {
    onFirstAdded: () => void;
    onLastRemoved: () => void;
  }) {
    this.fns = { onFirstAdded, onLastRemoved };
  }

  add(value: Value): void {
    this.list.push(value);

    if (this.list.length === 1) {
      this.fns.onFirstAdded?.(value);
    }
  }

  remove(value: Value): void {
    const listLength = this.list.length;
    this.list = this.list.filter((v) => v !== value);

    if (this.list.length === 0 && this.list.length < listLength) {
      this.fns.onLastRemoved?.(value);
    }
  }

  get values(): Value[] {
    return [...this.list];
  }
}
