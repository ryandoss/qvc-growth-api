/**
 * Adds constructor to ResponseDto using the class properties
 */
export abstract class Dto<T> {
  constructor(args: Partial<T>) {
    if (args) {
      Object.assign(this, args);
    }
  }
}
