import { FieldProps, ModelContextProvider, ObjectField, SchemaContext, setValue, useFieldValue } from '@kaoto/forms';
import { cloneDeep } from 'lodash';
import { FunctionComponent, useContext, useMemo } from 'react';

import { ParsedParameters } from '../../../../../../utils';
import { MultiValuePropertyService } from './MultiValueProperty.service';

export const SchemaMultivalue: FunctionComponent<FieldProps> = ({ propName, required }) => {
  const { schema } = useContext(SchemaContext);
  const { value: flatParameters = {}, onChange, disabled } = useFieldValue<ParsedParameters | undefined>(propName);

  const componentName = useMemo(() => {
    return schema['x-component-name'] as string;
  }, [schema]);
  const parametersWithMultivalue = {
    parameters: MultiValuePropertyService.readMultiValue(componentName, flatParameters),
  };

  const onPropertyChange = (path: string, value: unknown) => {
    const updatedDefinition = cloneDeep(parametersWithMultivalue);
    setValue(updatedDefinition, path, value);

    const multiValueParameters = MultiValuePropertyService.getMultiValueSerializedDefinition(
      componentName,
      updatedDefinition,
    );

    onChange(multiValueParameters.parameters);
    console.dir({ flatParameters, updatedParameters: updatedDefinition, path, value });
  };

  return (
    <ModelContextProvider onPropertyChange={onPropertyChange} model={parametersWithMultivalue} disabled={disabled}>
      <ObjectField propName={propName} required={required} />
    </ModelContextProvider>
  );
};
