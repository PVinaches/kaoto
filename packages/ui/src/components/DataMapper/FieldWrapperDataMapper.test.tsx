import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FieldWrapperDataMapper } from './FieldWrapperDataMapper';

const renderField = () =>
  render(
    <FieldWrapperDataMapper label="My field" help="Some help">
      <input aria-label="My input" />
    </FieldWrapperDataMapper>,
  );

describe('FieldWrapperDataMapper', () => {
  it('should render the label and the children', () => {
    renderField();

    expect(screen.getByText('My field')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'My input' })).toBeInTheDocument();
  });

  it('should name the help button after the field and show the help without moving the focus to the field', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByRole('button', { name: 'More info for My field field' }));

    expect(await screen.findByText('Some help')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'My input' })).not.toHaveFocus();
  });

  it('should not move the focus to the field when the label is clicked', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByText('My field'));

    expect(screen.getByRole('textbox', { name: 'My input' })).not.toHaveFocus();
  });
});
