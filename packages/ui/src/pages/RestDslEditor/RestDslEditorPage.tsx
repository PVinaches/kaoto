import './RestDslEditorPage.scss';

import { CodeSnippet } from '@carbon/react';
import { CanvasFormTabsProvider, getCamelRandomId, KaotoForm } from '@kaoto/forms';
import { FunctionComponent, useCallback, useState } from 'react';

import { Loading } from '../../components/Loading';
import { ResizableSplitPanels } from '../../components/ResizableSplitPanels/ResizableSplitPanels';
import { customFieldsFactoryfactory } from '../../components/Visualization/Canvas/Form/fields/custom-fields-factory';
import { SuggestionRegistrar } from '../../components/Visualization/Canvas/Form/suggestions/SuggestionsProvider';
import { useEntityContext } from '../../hooks/useEntityContext/useEntityContext';
import { EntityType } from '../../models/camel/entities';
import { CamelRestVisualEntity } from '../../models/visualization/flows/camel-rest-visual-entity';
import { IRestTreeSelection, RestTree } from './components/RestTree';
import { RestTreeToolbar, RestTreeToolbarProps } from './components/RestTreeToolbar';

const DEFAULT_TREE_PANEL_WIDTH_PERCENT = 30;
const DEFAULT_REST_METHOD_URI = 'direct';

/**
 * Main page component for editing REST DSL configurations.
 * Provides a split-panel interface with a tree view on the left and a form editor on the right.
 * Supports adding/editing REST configurations, REST services, and REST methods.
 */
export const RestDslEditorPage: FunctionComponent = () => {
  const { visualEntities, camelResource, updateEntitiesFromCamelResource } = useEntityContext();
  const [selectedElement, setSelectedElement] = useState<IRestTreeSelection | undefined>();

  const selectedEntity = visualEntities.find((entity) => entity.id === selectedElement?.entityId);
  const schema = selectedEntity?.getNodeSchema(selectedElement?.modelPath);
  const model = selectedEntity?.getNodeDefinition(selectedElement?.modelPath);

  const [treeVersion, setTreeVersion] = useState(0);

  /** Handles changes to individual properties in the form editor */
  const handleOnChangeIndividualProp = useCallback(
    (path: string, value: unknown) => {
      if (!selectedElement || !selectedEntity) return;

      let updatedValue = value;
      if (typeof value === 'string' && value.trim() === '') {
        updatedValue = undefined;
      }

      const fullPath = `${selectedElement.modelPath}.${path}`;
      selectedEntity.updateModel(fullPath, updatedValue);
      updateEntitiesFromCamelResource();
    },
    [selectedElement, selectedEntity, updateEntitiesFromCamelResource],
  );

  /** Adds a new REST configuration entity to the resource */
  const handleAddRestConfiguration = useCallback(() => {
    const newId = camelResource.addNewEntity(EntityType.RestConfiguration);
    updateEntitiesFromCamelResource();
    setSelectedElement({ modelPath: 'restConfiguration', entityId: newId });
    setTreeVersion((version) => version + 1);
  }, [camelResource, updateEntitiesFromCamelResource]);

  /** Adds a new REST service entity to the resource */
  const handleAddRest = useCallback(() => {
    const newId = camelResource.addNewEntity(EntityType.Rest);
    setSelectedElement({ modelPath: 'rest', entityId: newId });
    updateEntitiesFromCamelResource();
    setTreeVersion((version) => version + 1);
  }, [camelResource, updateEntitiesFromCamelResource]);

  /** Adds a new REST method to the selected REST service */
  const handleAddMethod: RestTreeToolbarProps['onAddMethod'] = useCallback(
    (model) => {
      if (!selectedEntity || !(selectedEntity instanceof CamelRestVisualEntity)) return;

      const restDefinition = selectedEntity.toJSON().rest;
      restDefinition[model.method] ??= [];

      const methodsArray = restDefinition[model.method]!;
      const methodId = model.id ?? getCamelRandomId(model.method);
      methodsArray.push({
        id: methodId,
        path: model.path,
        to: {
          uri: DEFAULT_REST_METHOD_URI,
          parameters: {
            name: `${model.path}-${(methodId.match(/\d/g) || []).join('')}`,
          },
        },
      });

      updateEntitiesFromCamelResource();
      setSelectedElement({ entityId: selectedEntity.id, modelPath: `rest.${model.method}.${methodsArray.length - 1}` });
      setTreeVersion((version) => version + 1);
    },
    [selectedEntity, updateEntitiesFromCamelResource],
  );

  /** Deletes the selected REST entity or method */
  const handleDelete = useCallback(() => {
    if (!selectedEntity || !selectedElement) return;

    if (selectedElement.modelPath === selectedEntity.getRootPath()) {
      /* Remove the entire Rest or RestConfiguration */
      camelResource.removeEntity([selectedElement.entityId]);
    } else {
      /* Remove a method */
      selectedEntity.removeStep(selectedElement.modelPath);
    }

    setSelectedElement(undefined);
    updateEntitiesFromCamelResource();
  }, [selectedEntity, selectedElement, updateEntitiesFromCamelResource, camelResource]);

  return (
    <ResizableSplitPanels
      defaultLeftWidth={DEFAULT_TREE_PANEL_WIDTH_PERCENT}
      leftPanel={
        <RestTree entities={visualEntities} selected={selectedElement} onSelect={setSelectedElement} key={treeVersion}>
          <RestTreeToolbar
            entities={visualEntities}
            selectedElement={selectedElement}
            onAddRestConfiguration={handleAddRestConfiguration}
            onAddRest={handleAddRest}
            onAddMethod={handleAddMethod}
            onDelete={handleDelete}
          />
        </RestTree>
      }
      rightPanel={
        <div>
          {!selectedElement?.entityId && <div>Select an entity from the list to edit its configuration</div>}
          {selectedElement && (
            <>
              <div className="form-rest-title">
                <span>Edit </span>
                <span>{selectedElement.entityId} </span>
                {selectedElement.modelPath.startsWith('rest.') && (
                  <>
                    <span>/ {selectedElement.modelPath.split('.')[1]?.toUpperCase()} /</span>
                    <CodeSnippet feedback="Copied to clipboard" type="inline">
                      {model.path}
                    </CodeSnippet>
                  </>
                )}
              </div>
              {!schema || Object.keys(schema).length === 0 ? (
                <Loading>Loading schemas...</Loading>
              ) : (
                <CanvasFormTabsProvider tab="All">
                  <SuggestionRegistrar>
                    <KaotoForm
                      key={`${selectedElement.entityId}__${selectedElement.modelPath}`}
                      schema={schema}
                      onChangeProp={handleOnChangeIndividualProp}
                      model={model}
                      customFieldsFactory={customFieldsFactoryfactory}
                    />
                  </SuggestionRegistrar>
                </CanvasFormTabsProvider>
              )}
            </>
          )}
        </div>
      }
    />
  );
};
