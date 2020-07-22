type MapCallback<P, Q> = (current: P, index: number, src: P[]) => Q;

type FilterCallback<P> = MapCallback<P, boolean>;

type ReduceCallback<P, Q> = (acc: Q, current: P, index: number, src: P[]) => Q;

export const scan = <State, Value, Element>(
  arr: Element[],
  fold: (
    state: State,
    curr: Element,
    index: number,
    src: Element[]
  ) => { state: State; value: Value },
  init: State
) => {
  let copy = arr.slice(0);

  return {
    index: 0,
    state: init,
    [Symbol.iterator]: function() {
      return this;
    },
    next() {
      if (this.index == copy.length) {
        return { value: undefined, done: true };
      }

      const { value, state } = fold(
        this.state,
        copy[this.index],
        this.index,
        copy.slice(0)
      );

      this.state = state;
      this.index = this.index + 1;

      return { value, done: false };
    },
    map<MapReturnType, ContextType>(
      ...args: [MapCallback<Value | undefined, MapReturnType>, ContextType]
    ) {
      return [...this].map(...args);
    },
    filter<ContextType>(
      ...args: [FilterCallback<Value | undefined>, ContextType]
    ) {
      return [...this].filter(...args);
    },
    reduce<NewStructure>(
      ...args: [
        ReduceCallback<Value | undefined, NewStructure | undefined>,
        NewStructure | undefined
      ]
    ) {
      return [...this].reduce(...args);
    },
  };
};
