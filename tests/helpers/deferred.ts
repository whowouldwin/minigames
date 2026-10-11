type DeferredResolve<T> = (...values: T extends void ? [] | [T] : [T]) => void;

declare global {
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T) => void;
    };
  }
}

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: DeferredResolve<T>;
}

export const createDeferred = <T>(): Deferred<T> => {
  const { promise, resolve } = Promise.withResolvers<T>();

  return {
    promise,
    resolve: ((...values: T extends void ? [] | [T] : [T]): void => {
      resolve(values[0] as T);
    }) as DeferredResolve<T>,
  };
};
