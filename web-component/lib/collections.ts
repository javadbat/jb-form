/**
 * @public this symbol will be putted in Map value to indicate that value is gathered from multiple fields and it's not a array value
 */
export const ValueCollectionSymbol = Symbol("ValueCollectionSymbol");

export class TraverseCollection<T> extends Map<string | number, T> {
  [ValueCollectionSymbol] = true;
  // biome-ignore lint/complexity/noUselessConstructor: <we wil>
  constructor(...params: ConstructorParameters<typeof Map<string | number, T>>) {
    super(...params);
  }
}
