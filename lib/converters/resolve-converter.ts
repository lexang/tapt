import { converterCatalog, type ConverterDefinition } from '@/lib/converters/catalog';

export function resolveConverter(slug: string): ConverterDefinition | undefined {
  return converterCatalog.find((converter) => converter.slug === slug);
}
