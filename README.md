# Scan

Inspired by Rust's iterator [scan](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.scan) method.

`scan`, unlike reduce, does a fold where on every iteration, a piece of state is avaiable. This piece of state is not necessarily equal to the returned structural transformation.

This implementation of `scan` requires the fold function to return an object with keys, `state`, and `value`.

The `value` key is what the iteration returns at each step, while the `state` is available only to the fold.

This is similar to the way, the [`iterator` protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol) works, by requiring a `next` function that returns an object with keys `done` and `value`.

For example:

```ts
const arr = [0, 1, 2, 3];
const iterator = scan<State, Node, number>(
  arr,
  (prevState, current) => {
    const nextState = current % 2 === 0;
    const nextValue = prevState ? current : 2 * current;
    return { state: nextState, value: nextValue };
  },
  true
);

for (const element of iterator) {
  console.log(element);
} // 0, 1, 4, 3
```

The code above doubles an element if the previous element was not a multiple of two.

A more complicated use case, take from the tests of this library, showing that `scan` supports method chaining with native `map`, `filter` and `reduce`.

```ts
enum Print {
  Comma,
  StartRange,
  EndRange,
  Skip,
  First,
}

type Node = {
  value: number;
  print: Print;
};

test('Range Extraction', () => {
  // assuming range is pre-sorted
  const range = [-6, -3, -2, -1, 0, 1, 4, 8, 14, 15, 17, 18, 19, 20];
  const expected = '-6,-3..1,4,8,14,15,17..20';

  const result = scan<boolean, Node, number>(
    range,
    (prevState, current, index, src) => {
      const prev = src[index - 1] ?? current;
      const next = src[index + 1] ?? current;

      const nextState = next - prev === 2;

      let print;

      if (nextState) {
        print = prevState ? Print.Skip : Print.StartRange;
      } else if (prevState) {
        print = Print.EndRange;
      } else {
        print = index === 0 ? Print.First : Print.Comma;
      }

      return {
        state: nextState,
        value: {
          value: current,
          print,
        },
      };
    },
    false
  ).reduce((acc, curr) => {
    switch (curr?.print) {
      case Print.First:
        return `${curr.value}`;

      case Print.Comma:
        return `${acc},${curr.value}`;

      case Print.StartRange:
        return `${acc}..`;

      case Print.EndRange:
        return `${acc}${curr.value}`;

      case Print.Skip:
      default:
        return acc;
    }
  }, '');

  expect(result).toEqual(expected);
});
```
