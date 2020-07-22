import { scan } from '../src';

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

type State = boolean;

test('Range Extraction', () => {
  // assuming range is pre-sorted
  const range = [-6, -3, -2, -1, 0, 1, 4, 8, 14, 15, 17, 18, 19, 20];
  const expected = '-6,-3..1,4,8,14,15,17..20';

  const result = scan<State, Node, number>(
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
