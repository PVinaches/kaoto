import catalogLibrary from '@kaoto/camel-catalog/index.json';
import { CatalogLibrary } from '@kaoto/camel-catalog/types';

import { getFirstCatalogMap, setupDynamicCatalogRegistry } from '../../stubs/test-load-catalog';
import { PipeResource } from './pipe-resource'; // use a concrete subclass — CamelKResource is abstract

describe('CamelKResource', () => {
  describe('getMetadataSchema()', () => {
    beforeAll(async () => {
      const catalogsMap = await getFirstCatalogMap(catalogLibrary as CatalogLibrary);
      setupDynamicCatalogRegistry(catalogsMap);
    });

    it('returns an empty schema before initialize()', () => {
      const resource = new PipeResource();
      expect(resource.getMetadataSchema()).toEqual({});
    });

    it('returns the ObjectMeta propertiesSchema after initialize()', async () => {
      const resource = new PipeResource();
      await resource.initialize();
      const schema = resource.getMetadataSchema();
      expect(typeof schema).toBe('object');
      expect(schema).not.toEqual({});
    });
  });
});
