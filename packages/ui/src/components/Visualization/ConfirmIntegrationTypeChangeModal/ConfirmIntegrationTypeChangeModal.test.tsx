import { CatalogLibrary, CatalogLibraryEntry } from '@kaoto/camel-catalog/types';
import { act, fireEvent, render } from '@testing-library/react';

import { SourceSchemaType } from '../../../models/camel';
import { RuntimeContext } from '../../../providers';
import { TestProvidersWrapper } from '../../../stubs';
import { CatalogSchemaLoader } from '../../../utils';
import { ConfirmIntegrationTypeChangeModal } from './ConfirmIntegrationTypeChangeModal';

describe('ConfirmIntegrationTypeChangeModal', () => {
  const mockCamelCatalog: CatalogLibraryEntry = {
    name: 'Camel Main',
    runtime: 'Main',
    version: '4.0.0',
    fileName: 'camel-catalog-4.0.0.json',
  };

  const mockCitrusCatalog: CatalogLibraryEntry = {
    name: 'Citrus',
    runtime: 'Citrus',
    version: '4.0.0',
    fileName: 'citrus-catalog-4.0.0.json',
  };

  const mockCatalogLibrary: CatalogLibrary = {
    definitions: [mockCamelCatalog, mockCitrusCatalog],
  } as CatalogLibrary;

  const renderModal = (
    proposedFlowType: SourceSchemaType | undefined,
    selectedCatalog: CatalogLibraryEntry = mockCamelCatalog,
  ) => {
    const mockSetSelectedCatalog = jest.fn();
    const onClosed = jest.fn();
    const { Provider } = TestProvidersWrapper();

    const result = render(
      <RuntimeContext.Provider
        value={{
          basePath: CatalogSchemaLoader.DEFAULT_CATALOG_BASE_PATH,
          catalogLibrary: mockCatalogLibrary,
          selectedCatalog,
          setSelectedCatalog: mockSetSelectedCatalog,
        }}
      >
        <Provider>
          <ConfirmIntegrationTypeChangeModal proposedFlowType={proposedFlowType} onClosed={onClosed} />
        </Provider>
      </RuntimeContext.Provider>,
    );

    return { ...result, onClosed, mockSetSelectedCatalog };
  };

  it('should be hidden when proposedFlowType is undefined', () => {
    const { queryByTestId } = renderModal(undefined);

    expect(queryByTestId('confirmation-modal')).not.toBeInTheDocument();
  });

  it('should be visible when proposedFlowType is set', () => {
    const { queryByTestId } = renderModal(SourceSchemaType.Route);

    expect(queryByTestId('confirmation-modal')).toBeInTheDocument();
  });

  it('should call onClosed when cancel button is clicked', () => {
    const { getByTestId, onClosed } = renderModal(SourceSchemaType.Route);

    fireEvent.click(getByTestId('confirmation-modal-cancel'));

    expect(onClosed).toBeCalled();
  });

  it('should call onClosed when close button is clicked', () => {
    const { getByLabelText, onClosed } = renderModal(SourceSchemaType.Route);

    fireEvent.click(getByLabelText('Close'));

    expect(onClosed).toBeCalled();
  });

  it('should not show the catalog warning for a same-catalog flow type', () => {
    const { getByTestId } = renderModal(SourceSchemaType.Pipe, mockCamelCatalog);

    expect(getByTestId('confirmation-modal-text')).not.toHaveTextContent(
      'This will also change the current selected catalog.',
    );
  });

  it('should show the catalog warning when switching to a different catalog', () => {
    const { getByTestId } = renderModal(SourceSchemaType.Test, mockCamelCatalog);

    expect(getByTestId('confirmation-modal-text')).toHaveTextContent(
      'This will also change the current selected catalog.',
    );
  });

  it('should call onClosed after confirming', async () => {
    const { getByTestId, onClosed } = renderModal(SourceSchemaType.Route);

    await act(async () => {
      fireEvent.click(getByTestId('confirmation-modal-confirm'));
    });

    expect(onClosed).toBeCalled();
  });

  it('should update catalog when switching to a different catalog type', async () => {
    const { getByTestId, mockSetSelectedCatalog } = renderModal(SourceSchemaType.Test, mockCamelCatalog);

    await act(async () => {
      fireEvent.click(getByTestId('confirmation-modal-confirm'));
    });

    expect(mockSetSelectedCatalog).toHaveBeenCalledWith(expect.objectContaining({ runtime: 'Citrus' }));
  });

  it('should not update catalog when switching between same-catalog flow types', async () => {
    const { getByTestId, mockSetSelectedCatalog } = renderModal(SourceSchemaType.Pipe, mockCamelCatalog);

    await act(async () => {
      fireEvent.click(getByTestId('confirmation-modal-confirm'));
    });

    expect(mockSetSelectedCatalog).not.toHaveBeenCalled();
  });
});
