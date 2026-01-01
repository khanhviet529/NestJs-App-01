import { documentToPureJSON } from './object.utils';
import { TObject } from './object.utils';
import { EnumFieldsFilterMode, objectFieldsFilter } from './object.utils';

export { EnumFieldsFilterMode } from './object.utils'
export class ObjectTransformerLib {
  private data: TObject | TObject[];
  constructor(entity: TObject | TObject[]) {
    this.data = entity;
  }

  getData() {
    return this.data;
  }

  mongoToPureJSON() {
    this.data = documentToPureJSON(this.data)
    return this
  }

  filterFields(mode: EnumFieldsFilterMode, keys: string[]): ObjectTransformerLib {
    if (Array.isArray(this.data))
      this.data = this.data.map((v) => objectFieldsFilter(v, mode, keys));
    else
      this.data = objectFieldsFilter(this.data, mode, keys);

    return this;
  }

}