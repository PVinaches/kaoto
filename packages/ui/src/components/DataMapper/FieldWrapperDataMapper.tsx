import './FieldWrapperDataMapper.scss';

import { Information } from '@carbon/icons-react';
import { Stack, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { FunctionComponent, PropsWithChildren, ReactNode } from 'react';

interface FieldWrapperDataMapperProps {
  /** Visible label of the field */
  label: string;
  /** Content of the help toggletip */
  help: ReactNode;
}

/**
 * Field layout of the Kaoto DataMapper side panel: a label followed by a help toggletip and the field itself.
 *
 * It mirrors the `FieldWrapper` of `@kaoto/forms`, so the DataMapper fields look like the rest of the canvas form.
 * Unlike that wrapper, the help content is provided by the caller, since these fields have no schema type or default.
 *
 * The `<label>` is not bound to the field, so activating the help button does not move the focus to the field. The
 * field provides its own accessible name.
 */
export const FieldWrapperDataMapper: FunctionComponent<PropsWithChildren<FieldWrapperDataMapperProps>> = ({
  label,
  help,
  children,
}) => {
  return (
    <Stack gap={3} className="field-wrapper-datamapper">
      <div className="field-wrapper-datamapper__label-container">
        <label className="field-wrapper-datamapper__label">{label}</label>
        <Toggletip autoAlign>
          <ToggletipButton label={`More info for ${label} field`}>
            <Information />
          </ToggletipButton>
          <ToggletipContent className="field-wrapper-datamapper__toggletip-content">{help}</ToggletipContent>
        </Toggletip>
      </div>

      {children}
    </Stack>
  );
};
