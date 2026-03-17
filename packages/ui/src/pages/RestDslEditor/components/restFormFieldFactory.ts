import { CustomFieldsFactory } from '@kaoto/forms';

import { RestRouteEndpointField } from './RestRouteEndpointField';

export const restFormFieldFactory: CustomFieldsFactory = (schema) => {
  if (schema.type === 'object' && schema.title === 'To') {
    return RestRouteEndpointField;
  }

  return undefined;
};
