export type TObject = Record<string, any>;
export enum EnumFieldsFilterMode {
  preserve,
  remove
}
export const objectFieldsFilter = (object: TObject, mode: EnumFieldsFilterMode, keys: string[]) => {
  if (keys.length === 0) return object;

  const _obj = { ...object };

  const filterer = (key) => (mode === EnumFieldsFilterMode.preserve ? keys.includes(key) : !keys.includes(key));
  const reducer = (newObj, n) => {
    return {
      ...newObj,
      [n]: _obj[n]
    };
  };

  return Object.keys(_obj).filter(filterer).reduce(reducer, {});
};

export const documentToPureJSON = (document) => {
  if (Array.isArray(document)) {
    return document.map((doc) => doc._doc)
  }

  return document._doc
}