import LazyValue from '../types/LazyValue'

interface FieldDef {
  attributeName?: string;
  label?: LazyValue<string>;
  hint?: LazyValue<string>;
}

export { FieldDef }
