import {
  Integration as IntegrationType,
  KameletBinding as KameletBindingType,
  Pipe as PipeType,
} from '@kaoto/camel-catalog/types';
import { stringify } from 'yaml';

import { TileFilter } from '../../components/Catalog';
import { DynamicCatalogRegistry } from '../../dynamic-catalog/dynamic-catalog-registry';
import { CatalogKind } from '../catalog-kind';
import { BaseEntity, EntityType } from '../entities';
import { BaseVisualEntityDefinition, KaotoResource } from '../kaoto-resource';
import { KaotoSchemaDefinition } from '../kaoto-schema';
import { AddStepMode, BaseVisualEntity, IVisualizationNodeData } from '../visualization/base-visual-entity';
import { MetadataEntity } from '../visualization/metadata';
import { IKameletDefinition } from './kamelets-catalog';
import { SourceSchemaType } from './source-schema-type';

export type CamelKType = IntegrationType | IKameletDefinition | KameletBindingType | PipeType;

export enum CamelKResourceKinds {
  Integration = 'Integration',
  Kamelet = 'Kamelet',
  KameletBinding = 'KameletBinding',
  Pipe = 'Pipe',
}

export const CAMEL_K_K8S_API_VERSION_V1 = 'camel.apache.org/v1';

export abstract class CamelKResource implements KaotoResource {
  protected resource: CamelKType;
  private metadata?: MetadataEntity;
  private metadataSchema: KaotoSchemaDefinition['schema'] = {};

  constructor(parsedResource: unknown) {
    if (parsedResource) {
      this.resource = parsedResource as CamelKType;
    } else {
      this.resource = {
        apiVersion: CAMEL_K_K8S_API_VERSION_V1,
        spec: {},
      };
    }
    this.metadata = this.resource.metadata && new MetadataEntity(this.resource);
  }

  get supportedEntities(): ReadonlyArray<{ type: EntityType }> {
    return [];
  }

  async initialize(): Promise<void> {
    if (this.resource.metadata && !this.metadata) {
      this.metadata = new MetadataEntity(this.resource);
    }
    const def = await DynamicCatalogRegistry.get().getEntity(CatalogKind.Entity, 'ObjectMeta');
    this.metadataSchema = (def?.propertiesSchema ?? {}) as KaotoSchemaDefinition['schema'];
  }

  getMetadataSchema(): KaotoSchemaDefinition['schema'] {
    return this.metadataSchema;
  }

  getCanvasEntityList(): BaseVisualEntityDefinition {
    return {
      common: [],
      groups: {},
    };
  }

  removeEntity(_id?: string[]) {
    return;
  }

  refreshVisualMetadata() {
    return;
  }

  createMetadataEntity() {
    this.resource.metadata = {};
    this.metadata = new MetadataEntity(this.resource);
    return this.metadata;
  }

  getMetadataEntity() {
    return this.metadata;
  }

  deleteMetadataEntity() {
    this.resource.metadata = undefined;
    this.metadata = undefined;
  }

  getEntities(): BaseEntity[] {
    const answer = [];
    if (this.resource.metadata && this.metadata) {
      answer.push(this.metadata);
    }
    return answer;
  }

  abstract getType(): SourceSchemaType;

  abstract getVisualEntities(): BaseVisualEntity[];

  abstract toJSON(): unknown;

  addNewEntity(): string {
    /** Not supported by default */
    return '';
  }

  supportsMultipleVisualEntities(): boolean {
    /** Not supported by default */
    return false;
  }

  /** Components Catalog related methods */
  getCompatibleComponents(_mode: AddStepMode, _visualEntityData: IVisualizationNodeData): TileFilter | undefined {
    return undefined;
  }

  getCompatibleRuntimes(): string[] {
    return ['Main', 'Quarkus', 'Spring Boot'];
  }

  async toSourceCode(): Promise<string> {
    return stringify(this.toJSON(), { schema: 'yaml-1.1' }) || '';
  }
}
