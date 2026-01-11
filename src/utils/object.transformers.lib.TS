import { documentToPureJSON } from './object.utils';
import { TObject } from './object.utils';
import { EnumFieldsFilterMode, objectFieldsFilter } from './object.utils';

export { EnumFieldsFilterMode } from './object.utils';
export class ObjectTransformerLib<T extends TObject> {
  private data: T | T[];
  constructor(entity: T | T[]) {
    this.data = entity;
  }

  getData(): T | T[] {
    return this.data;
  }

  mongoToPureJSON(): this {
    this.data = documentToPureJSON(this.data) as T | T[];
    return this;
  }

  filterFields(mode: EnumFieldsFilterMode, keys: string[]): this {
    if (Array.isArray(this.data))
      this.data = this.data.map((v) => objectFieldsFilter(v, mode, keys) as T);
    else this.data = objectFieldsFilter(this.data, mode, keys) as T;

    return this;
  }
}
