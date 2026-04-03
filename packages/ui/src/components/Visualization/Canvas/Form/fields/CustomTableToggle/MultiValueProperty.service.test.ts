import { CamelCatalogService } from '../../../../../../models';
import { MultiValuePropertyService } from './MultiValueProperty.service';

describe('MultiValuePropertyService', () => {
  it.todo('readMultiValue');

  describe('getMultiValueSerializedDefinition', () => {
    it('should return the same parameters if the definition is not a component', () => {
      const definition = { log: { message: 'Hello World' } };
      const result = MultiValuePropertyService.getMultiValueSerializedDefinition('from', definition);

      expect(result).toEqual(definition);
    });

    it('should return the same parameters if the component is not found', () => {
      const definition = {
        uri: 'unknown-component',
        parameters: { jobParameters: { test: 'test' }, triggerParameters: { test: 'test' } },
      };
      const result = MultiValuePropertyService.getMultiValueSerializedDefinition('from', definition);

      expect(result).toEqual(definition);
    });

    it('should query the catalog service', () => {
      const definition = { uri: 'log', parameters: { message: 'Hello World' } };
      const catalogServiceSpy = jest.spyOn(CamelCatalogService, 'getCatalogLookup');

      MultiValuePropertyService.getMultiValueSerializedDefinition('from', definition);
      expect(catalogServiceSpy).toHaveBeenCalledWith('log');
    });

    it('should return the serialized definition', () => {
      const definition = {
        uri: 'quartz',
        parameters: { jobParameters: { test: 'test' }, triggerParameters: { test: 'test' } },
      };
      const result = MultiValuePropertyService.getMultiValueSerializedDefinition('from', definition);

      expect(result).toEqual({ uri: 'quartz', parameters: { 'job.test': 'test', 'trigger.test': 'test' } });
    });
  });
});
