import '@patternfly/react-core/dist/styles/base.css'; // This import needs to be first
import '@carbon/ibm-products/css/index.min.css';
import '../styles/carbon-overrides.scss';
import '../components/Visualization/Canvas/Form/CanvasForm.scss';
import '../components/Visualization/Canvas/Form/CanvasFormHeader.scss';

import { ErrorEmptyState } from '@carbon/ibm-products';
import { Close } from '@carbon/icons-react';
import {
  Accordion,
  AccordionItem,
  Button,
  CodeSnippet,
  Heading,
  IconButton,
  InlineLoading,
  InlineNotification,
  Loading as CarbonLoading,
} from '@carbon/react';
import { ModelContextProvider, SchemaProvider } from '@kaoto/forms';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import { TopologySideBar, TopologyView } from '@patternfly/react-topology';
import { Component, FunctionComponent, PropsWithChildren, ReactNode, Suspense, use, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { Loading } from '../components/Loading/Loading';
import { ExpressionField } from '../components/Visualization/Canvas/Form/fields/ExpressionField/ExpressionField';
import { CanvasFallback } from '../components/Visualization/CanvasFallback';
import { DynamicCatalog } from '../dynamic-catalog/dynamic-catalog';
import { DynamicCatalogRegistry } from '../dynamic-catalog/dynamic-catalog-registry';
import { ICatalogProvider } from '../dynamic-catalog/models';
import { CatalogKind } from '../models';
import { PipeResource } from '../models/camel';
import { ColorScheme } from '../models/settings/settings.model';
import { ReturnToSourceCodeFallback } from '../pages/Design/ReturnToSourceCodeFallback';
import { ErrorPage } from '../pages/ErrorPage';
import { MetadataPage } from '../pages/Metadata/MetadataPage';
import { EntitiesContext } from '../providers/entities.provider';
import { setHeaderExpressionSchema } from '../stubs/expression-definition-schema';
import { ROOT_PATH } from '../utils';
import { setColorScheme } from '../utils/color-scheme';

// Centre the IBM Products empty-state heading and subtitle for the experiment cells
const styleEl = document.createElement('style');
styleEl.textContent = `.experiment-full-area-fallback .c4p--empty-state { align-items: center; }
.experiment-full-area-fallback .c4p--empty-state__header,
.experiment-full-area-fallback .c4p--empty-state__subtitle { text-align: center; }`;
document.head.appendChild(styleEl);

/**
 * Static experiment page (throwaway): compares the current PatternFly loading / error states of
 * packages/ui against Carbon candidates and agreed designs.
 *
 * Open http://localhost:5173/experiment.html (add ?theme=dark for dark mode, ?view=errors for errors only)
 * while running `yarn workspace @kaoto/kaoto start`.
 */

setColorScheme(
  new URLSearchParams(globalThis.location.search).get('theme') === 'dark' ? ColorScheme.Dark : ColorScheme.Light,
);

/** Catalog providers that never resolve, to keep the real screens in their Suspense (loading) state */
const neverProvider: ICatalogProvider<never> = {
  id: 'never',
  fetch: () => new Promise(() => {}),
  fetchAll: () => new Promise(() => {}),
};
DynamicCatalogRegistry.get().setCatalog(CatalogKind.Language, new DynamicCatalog(neverProvider));
DynamicCatalogRegistry.get().setCatalog(CatalogKind.Entity, new DynamicCatalog(neverProvider));

const pipeResource = new PipeResource();
const entitiesContextValue = {
  camelResource: pipeResource,
  entities: pipeResource.getEntities(),
  visualEntities: pipeResource.getVisualEntities(),
  currentSchemaType: pipeResource.getType(),
  updateSourceCodeFromEntities: () => {},
  updateEntitiesFromCamelResource: () => {},
};

const neverPromise = new Promise<never>(() => {});
/** Suspends forever, so any Suspense fallback around it stays visible */
const Held: FunctionComponent = () => {
  use(neverPromise);
  return null;
};

/** Mimics the surroundings of an ExpressionField inside the node configuration side panel */
const FormPanel: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <Card isFullHeight style={{ height: '100%' }}>
    <CardHeader>
      <CardTitle>setHeader</CardTitle>
    </CardHeader>
    <CardBody style={{ overflow: 'hidden auto' }}>
      <Form>
        <FormGroup label="Id" fieldId="exp-id">
          <TextInput id="exp-id" value="setHeader-1361" readOnly />
        </FormGroup>
        {children}
        <FormGroup label="Description" fieldId="exp-desc">
          <TextInput id="exp-desc" value="" readOnly />
        </FormGroup>
      </Form>
    </CardBody>
  </Card>
);

/** Mimics the Metadata page content area */
const PageArea: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <div style={{ padding: '1rem', height: '100%', boxSizing: 'border-box' }}>
    <Content component={ContentVariants.h2}>Metadata</Content>
    {children}
  </div>
);

/** Block-level centered fallback for Carbon candidates, in the same place the PF Bullseye would sit */
const Block: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>{children}</div>
);

const carbonFallbacks: { label: string; fallback: ReactNode }[] = [
  {
    label: 'Carbon Loading (no overlay)',
    fallback: (
      <Block>
        <CarbonLoading withOverlay={false} description="Loading" />
      </Block>
    ),
  },
  {
    label: 'Carbon Loading small',
    fallback: (
      <Block>
        <CarbonLoading withOverlay={false} small description="Loading" />
      </Block>
    ),
  },
  {
    label: 'Carbon InlineLoading, no text',
    fallback: (
      <Block>
        <InlineLoading iconDescription="Loading" />
      </Block>
    ),
  },
];

const Bomb: FunctionComponent = () => {
  throw new Error('Boom! This error was thrown on purpose');
};

const Group: FunctionComponent<PropsWithChildren<{ title: string; description: string }>> = ({
  title,
  description,
  children,
}) => (
  <section style={{ margin: '1rem', border: '1px solid var(--cds-border-subtle, #c7c7c7)' }}>
    <header style={{ padding: '0.5rem 1rem', background: 'var(--cds-layer, #f0f0f0)' }}>
      <strong>{title}</strong> <span style={{ opacity: 0.7 }}>{description}</span>
    </header>
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>{children}</div>
  </section>
);

const Cell: FunctionComponent<
  PropsWithChildren<{ label: string; current?: boolean; height?: number; wide?: boolean }>
> = ({ label, current, height = 200, wide, children }) => (
  <div
    style={{
      flex: wide ? '1 1 100%' : '1 1 280px',
      borderInlineEnd: '1px solid var(--cds-border-subtle, #c7c7c7)',
      borderBlockEnd: wide ? '1px solid var(--cds-border-subtle, #c7c7c7)' : undefined,
    }}
  >
    <div
      style={{
        padding: wide ? '0.5rem 1rem' : '0.25rem 1rem',
        fontSize: wide ? 16 : 12,
        fontWeight: 600,
        background: current ? 'var(--cds-layer-accent, #e0e0e0)' : 'transparent',
      }}
    >
      {label}
    </div>
    <div style={{ height, overflow: 'auto', position: 'relative' }}>{children}</div>
  </div>
);

/** Carbon replacement for PatternFly's Bullseye: fills the parent and centers its content */
const Center: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, height: '100%' }}>
    {children}
  </div>
);

const SchemasText = (
  <Content data-testid="loading-schemas" component={ContentVariants.h3}>
    Loading Schemas...
  </Content>
);

const CarbonText = (label: string): ReactNode => (
  <Content data-testid="loading-schemas" component={ContentVariants.h3}>
    {label}
  </Content>
);

/** Mirrors Canvas.tsx + CanvasSideBar.tsx: a real resizable TopologyView drawer whose side bar content is the fallback */
const RealDrawer: FunctionComponent<{ id: string; fallback: ReactNode }> = ({ id, fallback }) => (
  <div data-testid={id} style={{ height: 380, width: '100%', position: 'relative' }}>
    <TopologyView
      sideBarResizable
      sideBarOpen
      defaultSideBarSize="500px"
      minSideBarSize="210px"
      sideBar={
        <TopologySideBar resizable className="canvas-sidebar">
          <ErrorBoundary fallback={fallback}>
            <Bomb />
          </ErrorBoundary>
        </TopologySideBar>
      }
    >
      <div style={{ padding: '1rem' }}>(canvas area)</div>
    </TopologyView>
  </div>
);

/**
 * Prototype of the ErrorBoundary change: `fallback` can be a function that receives the error, so the
 * fallback itself places the "Show more" Accordion toggle. No PatternFly in here.
 */
class ErrorAwareBoundary extends Component<
  { fallback: (error: Error) => ReactNode; children: ReactNode },
  { error?: Error }
> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? this.props.fallback(this.state.error) : this.props.children;
  }
}

/** Accepted Carbon Disclosure (Candidate Y): Carbon Accordion with CodeSnippet */
const ErrorDetailsAccordion: FunctionComponent<{ message?: string }> = ({ message }) => {
  const [open, setOpen] = useState(false);
  return (
    <Accordion size="sm" isFlush>
      <AccordionItem
        title={open ? 'Show less' : 'Show more'}
        open={open}
        onHeadingClick={({ isOpen }) => {
          setOpen(isOpen);
        }}
      >
        <CodeSnippet type="multi" feedback="Copied" wrapText>
          {message ?? ''}
        </CodeSnippet>
      </AccordionItem>
    </Accordion>
  );
};

/** Accepted Carbon Field Fallback */
const acceptedFieldFallback =
  (title: string) =>
  (error: Error): ReactNode => (
    <>
      <InlineNotification
        kind="error"
        lowContrast
        hideCloseButton
        title={title}
        subtitle="Please reload the editor"
        statusIconDescription="error"
        style={{ minInlineSize: 0 }}
      />
      <ErrorDetailsAccordion message={error.message} />
    </>
  );

/** Accepted Carbon Node Form Panel Fallback (b1): reduced header, Close button, notification, Accordion disclosure */
const acceptedNodeFormFallback =
  (title: string, body: string) =>
  (error: Error): ReactNode => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <Heading style={{ fontSize: 20, margin: 0 }}>setHeader</Heading>
        <IconButton kind="ghost" size="md" label="Close" align="left" data-testid="close-side-bar">
          <Close />
        </IconButton>
      </div>
      <div>
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title={title}
          subtitle={body}
          statusIconDescription="error"
          style={{ minInlineSize: 0 }}
        />
        <ErrorDetailsAccordion message={error.message} />
      </div>
    </div>
  );

/** Accepted Carbon Outer Sidebar Fallback: right-aligned Close button, notification, Accordion disclosure */
const acceptedSidebarFallback =
  (title: string, body: string) =>
  (error: Error): ReactNode => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton kind="ghost" size="md" label="Close" align="left" data-testid="close-side-bar">
          <Close />
        </IconButton>
      </div>
      <div>
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title={title}
          subtitle={body}
          statusIconDescription="error"
          style={{ minInlineSize: 0 }}
        />
        <ErrorDetailsAccordion message={error.message} />
      </div>
    </div>
  );

/** Same as RealDrawer but with the error-aware boundary */
const RealDrawerAware: FunctionComponent<{ id: string; fallback: (error: Error) => ReactNode }> = ({
  id,
  fallback,
}) => (
  <div data-testid={id} style={{ height: 380, width: '100%', position: 'relative' }}>
    <TopologyView
      sideBarResizable
      sideBarOpen
      defaultSideBarSize="500px"
      minSideBarSize="210px"
      sideBar={
        <TopologySideBar resizable className="canvas-sidebar">
          <ErrorAwareBoundary fallback={fallback}>
            <Bomb />
          </ErrorAwareBoundary>
        </TopologySideBar>
      }
    >
      <div style={{ padding: '1rem' }}>(canvas area)</div>
    </TopologyView>
  </div>
);

const errorPageRouter = createMemoryRouter([{ path: '/', element: <Bomb />, errorElement: <ErrorPage /> }]);
const returnToSourceCodeRouter = createMemoryRouter([{ path: '/', element: <ReturnToSourceCodeFallback /> }]);

/**
 * Carbon ErrorEmptyState candidate for CanvasFallback / ReturnToSourceCodeFallback / ErrorPage.
 *
 * All three current PatternFly components use the same Bullseye + EmptyState pattern.
 * This one shared component covers all three cases:
 *   - No action prop → CanvasFallback (no button)
 *   - action prop    → ReturnToSourceCodeFallback / ErrorPage (primary button)
 *
 * The `subtitle` prop carries the body text; the error message (if any) is passed separately
 * as `errorMessage` and shown in a CodeSnippet below the EmptyState, mirroring ErrorDetails.
 */
const CarbonFullAreaFallback: FunctionComponent<{
  title: string;
  subtitle: ReactNode;
  action?: { text: string; onClick?: () => void; href?: string };
  errorMessage?: string;
  illustrationTheme?: 'light' | 'dark';
}> = ({ title, subtitle, action, errorMessage, illustrationTheme = 'light' }) => (
  <div
    className="experiment-full-area-fallback"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}
  >
    {/* illustration + title + subtitle only — button rendered separately so accordion comes first */}
    <ErrorEmptyState
      title={title}
      subtitle={subtitle}
      illustrationTheme={illustrationTheme}
      illustrationPosition="top"
      size="lg"
      headingAs="h4"
    />
    <div style={{ width: '100%', maxWidth: 480, padding: '0 2rem' }}>
      <ErrorDetailsAccordion message={errorMessage} />
      {action && (
        <div style={{ marginBlockStart: '1rem', display: 'flex', justifyContent: 'center' }}>
          <Button kind="primary" onClick={action.onClick ?? (() => {})} {...(action.href ? { href: action.href } : {})}>
            {action.text}
          </Button>
        </div>
      )}
    </div>
  </div>
);

const errorsOnly = new URLSearchParams(globalThis.location.search).get('view') === 'errors';

const Experiment: FunctionComponent = () => (
  <>
    <h1 style={{ margin: '1rem' }}>Kaoto (packages/ui): error boundaries and loading states</h1>
    <p style={{ margin: '0 1rem', fontSize: 16 }}>
      Add <code>?view=errors</code> to view only error states, <code>&amp;theme=dark</code> for dark mode.
    </p>

    {/* ========================================================================= */}
    {/* SECTION 1: AGREED / DECIDED ERROR STATES (PF Baseline vs Decided Carbon) */}
    {/* ========================================================================= */}
    <h2 style={{ margin: '1.5rem 1rem 0.5rem', fontSize: 28, color: 'var(--cds-text-primary, #161616)' }}>
      Agreed Error States: PatternFly Baseline vs. Decided Carbon (Candidate Y)
    </h2>
    <p style={{ margin: '0 1rem 1rem', fontSize: 14, color: 'var(--cds-text-secondary, #525252)' }}>
      Form fields and side panel boundaries with the agreed Candidate Y disclosure (Carbon Accordion + CodeSnippet) and
      reduced header (Close button restored).
    </p>

    <Group
      title="1. Form Field Error Fallbacks (ExpressionField / MultiValuePropertyEditor)"
      description="Comparing current PatternFly baseline with accepted Carbon Candidate Y (InlineNotification + Accordion CodeSnippet disclosure)"
    >
      <Cell label="Current PatternFly Baseline: ExpressionField" current height={380}>
        <FormPanel>
          <ErrorBoundary fallback={<p>Expression editor is unavailable</p>}>
            <Bomb />
          </ErrorBoundary>
        </FormPanel>
      </Cell>
      <Cell label="Decided Carbon: ExpressionField" height={380}>
        <FormPanel>
          <ErrorAwareBoundary fallback={acceptedFieldFallback('Expression editor unavailable')}>
            <Bomb />
          </ErrorAwareBoundary>
        </FormPanel>
      </Cell>
      <Cell label="Current PatternFly Baseline: MultiValuePropertyEditor" current height={380}>
        <FormPanel>
          <ErrorBoundary fallback={<p>Field editor is unavailable</p>}>
            <Bomb />
          </ErrorBoundary>
        </FormPanel>
      </Cell>
      <Cell label="Decided Carbon: MultiValuePropertyEditor" height={380}>
        <FormPanel>
          <ErrorAwareBoundary fallback={acceptedFieldFallback('Field editor unavailable')}>
            <Bomb />
          </ErrorAwareBoundary>
        </FormPanel>
      </Cell>
    </Group>

    <Group
      title="2. Field Fallback Width Check (210px to 500px)"
      description="Testing min-inline-size: 0 override across side panel widths down to 210px minimum"
    >
      {[210, 250, 320, 500].map((width) => (
        <div key={width} style={{ flex: `0 0 ${width}px`, width, borderInlineEnd: '1px solid #c7c7c7' }}>
          <div style={{ padding: '0.25rem 1rem', fontSize: 12, fontWeight: 600 }}>Panel width {width}px</div>
          <div data-testid={`width-${width}`} style={{ height: 380, overflow: 'hidden auto' }}>
            <FormPanel>
              <ErrorAwareBoundary fallback={acceptedFieldFallback('Expression editor unavailable')}>
                <Bomb />
              </ErrorAwareBoundary>
            </FormPanel>
          </div>
        </div>
      ))}
    </Group>

    <Group
      title="3. Canvas Side Panel Fallbacks (CanvasForm & CanvasSideBar)"
      description="Comparing current PatternFly (lost header & Close button) with Decided Carbon b1 (reduced header + Close button + notification + details inside card body)"
    >
      <Cell label="Current PatternFly Baseline (CanvasForm at 500px, Close button lost)" current wide height={380}>
        <RealDrawer id="pf-drawer-baseline" fallback={<p>This node cannot be configured yet</p>} />
      </Cell>
      <Cell label="Decided Carbon: CanvasForm (Option b1 at 500px resizable drawer)" wide height={380}>
        <RealDrawerAware
          id="carbon-drawer-b1"
          fallback={acceptedNodeFormFallback('Node form unavailable', 'Select another node or close the panel')}
        />
      </Cell>
      <Cell label="Current PatternFly at 210px narrow width" current height={420}>
        <div data-testid="pf-narrow-baseline" style={{ width: 210, height: '100%', overflow: 'hidden auto' }}>
          <ErrorBoundary fallback={<p>This node cannot be configured yet</p>}>
            <Bomb />
          </ErrorBoundary>
        </div>
      </Cell>
      <Cell label="Decided Carbon: CanvasForm at 210px narrow width" height={420}>
        <div data-testid="carbon-narrow-b1" style={{ width: 210, height: '100%', overflow: 'hidden auto' }}>
          <ErrorAwareBoundary
            fallback={acceptedNodeFormFallback('Node form unavailable', 'Select another node or close the panel')}
          >
            <Bomb />
          </ErrorAwareBoundary>
        </div>
      </Cell>
      <Cell label="Current PatternFly Baseline (CanvasSideBar outer boundary)" current wide height={380}>
        <RealDrawer id="pf-sidebar-outer" fallback={<p>Something did not work as expected</p>} />
      </Cell>
      <Cell label="Decided Carbon: CanvasSideBar outer fallback (SidebarFallback)" wide height={380}>
        <RealDrawerAware
          id="carbon-sidebar-outer"
          fallback={acceptedSidebarFallback('Panel unavailable', 'Select another node or close the panel')}
        />
      </Cell>
    </Group>

    {/* ========================================================================= */}
    {/* SECTION 2: FULL-AREA FALLBACKS (PF Baseline vs Decided Carbon)            */}
    {/* ========================================================================= */}
    <h2 style={{ margin: '2rem 1rem 0.5rem', fontSize: 28, color: 'var(--cds-text-primary, #161616)' }}>
      Full-Area Fallbacks: PatternFly Baseline vs. Decided Carbon
    </h2>
    <p style={{ margin: '0 1rem 1rem', fontSize: 14, color: 'var(--cds-text-secondary, #525252)' }}>
      CanvasFallback, ReturnToSourceCodeFallback, ErrorPage — shared FullAreaFallback using ErrorEmptyState from
      @carbon/ibm-products. Accordion always shown; button optional.
    </p>

    <Group
      title="4. VisualizationShell Fallback (CanvasFallback)"
      description="VisualizationShell (DesignerVisualization & TopologyVisualization): default fallback when source code cannot be rendered on the canvas"
    >
      <Cell label="Current PatternFly: CanvasFallback" current wide height={450}>
        <ErrorBoundary fallback={<CanvasFallback />}>
          <Bomb />
        </ErrorBoundary>
      </Cell>
      <Cell label="Carbon candidate: ErrorEmptyState (no action button)" wide height={450}>
        <ErrorBoundary
          fallback={
            <CarbonFullAreaFallback
              title="The provided source code cannot be shown"
              subtitle={
                <>
                  <p style={{ textAlign: 'center' }}>
                    It might be that the source code is not available, or that the source code is not valid.
                  </p>
                  <p style={{ textAlign: 'center' }}>
                    Try to go back to the source code and check if the source code is valid.
                  </p>
                </>
              }
            />
          }
        >
          <Bomb />
        </ErrorBoundary>
      </Cell>
    </Group>

    <Group
      title="5. Design Page Fallback (ReturnToSourceCodeFallback)"
      description="pages/Design/router-exports: fallback passed to the Design page, has an EmptyState with 'Go to the source code' button"
    >
      <Cell label="Current PatternFly: ReturnToSourceCodeFallback" current wide height={450}>
        <ErrorBoundary fallback={<RouterProvider router={returnToSourceCodeRouter} />}>
          <Bomb />
        </ErrorBoundary>
      </Cell>
      <Cell label="Carbon candidate: ErrorEmptyState (with 'Go to the source code' action)" wide height={450}>
        <ErrorBoundary
          fallback={
            <CarbonFullAreaFallback
              title="The provided source code cannot be shown"
              subtitle={
                <>
                  <p style={{ textAlign: 'center' }}>
                    It might be that the source code is not available, or that the source code is not valid.
                  </p>
                  <p style={{ textAlign: 'center' }}>
                    Try to go back to the source code and check if the source code is valid.
                  </p>
                </>
              }
              action={{ text: 'Go to the source code' }}
            />
          }
        >
          <Bomb />
        </ErrorBoundary>
      </Cell>
    </Group>

    <Group
      title="6. Router Error Page (ErrorPage)"
      description="pages/ErrorPage: router errorElement in router.tsx and KaotoEditorRouter.tsx"
    >
      <Cell label="Current PatternFly: ErrorPage (router errorElement)" current wide height={450}>
        <RouterProvider router={errorPageRouter} />
      </Cell>
      <Cell
        label="Carbon candidate: ErrorEmptyState (with error message + 'Return home' action + ErrorDetails toggle)"
        wide
        height={450}
      >
        <CarbonFullAreaFallback
          title="Sorry, an error occured"
          subtitle="Trying to load the previous page led to the following error:"
          action={{ text: 'Return home' }}
          errorMessage="Boom! This error was thrown on purpose"
        />
      </Cell>
    </Group>

    {/* ========================================================================= */}
    {/* SECTION 3: LOADING STATES (Shown when not in ?view=errors mode)           */}
    {/* ========================================================================= */}
    {!errorsOnly && (
      <>
        <h2 style={{ margin: '2rem 1rem 0.5rem', fontSize: 28, color: 'var(--cds-text-primary, #161616)' }}>
          Loading States: PatternFly vs Carbon
        </h2>

        <Group
          title="A. App-blocking gates"
          description="runtime / catalog / schemas / kaoto-resource / rendering providers: spinner + h3 with a data-testid that Cypress waits on"
        >
          <Cell label="Current (PatternFly)" current>
            <Loading>{SchemasText}</Loading>
          </Cell>
          <Cell label="Carbon Loading (no overlay) + same text">
            <Center>
              <CarbonLoading withOverlay={false} description="Loading" />
              {CarbonText('Loading Schemas...')}
            </Center>
          </Cell>
          <Cell label="Carbon Loading small + same text">
            <Center>
              <CarbonLoading withOverlay={false} small description="Loading" />
              {CarbonText('Loading Schemas...')}
            </Center>
          </Cell>
          <Cell label="Carbon InlineLoading, description = same text node">
            <Center>
              <InlineLoading description={CarbonText('Loading Schemas...')} />
            </Center>
          </Cell>
        </Group>

        <Group
          title="B. Bare Suspense / data fallbacks"
          description="Metadata, Beans, PipeErrorHandler, ExpressionField, BeanField, MultiValuePropertyEditor, RestRouteEndpointField, DataMapper"
        >
          <Cell label="Current (PatternFly, size=lg)" current>
            <Loading />
          </Cell>
          <Cell label="Carbon Loading (no overlay)">
            <Center>
              <CarbonLoading withOverlay={false} description="Loading" />
            </Center>
          </Cell>
          <Cell label="Carbon Loading small">
            <Center>
              <CarbonLoading withOverlay={false} small description="Loading" />
            </Center>
          </Cell>
          <Cell label="Carbon InlineLoading, no text">
            <Center>
              <InlineLoading iconDescription="Loading" />
            </Center>
          </Cell>
        </Group>

        <Group
          title="B (real screen 1). ExpressionField, real component held in its loading state"
          description="Real ExpressionField with a Language catalog that never resolves, inside a mock node form panel"
        >
          <Cell label="Current (real ExpressionField, PatternFly)" current height={320}>
            <FormPanel>
              <ModelContextProvider model={{ id: 'setHeader-1361' }} onPropertyChange={() => {}}>
                <SchemaProvider schema={setHeaderExpressionSchema}>
                  <ExpressionField propName={ROOT_PATH} required />
                </SchemaProvider>
              </ModelContextProvider>
            </FormPanel>
          </Cell>
          {carbonFallbacks.map(({ label, fallback }) => (
            <Cell key={label} label={label} height={320}>
              <FormPanel>
                <Suspense fallback={fallback}>
                  <Held />
                </Suspense>
              </FormPanel>
            </Cell>
          ))}
        </Group>

        <Group
          title="B (real screen 2). MetadataPage, real component held in its loading state"
          description="Real MetadataPage with an Entity catalog that never resolves, inside a mock page content area"
        >
          <Cell label="Current (real MetadataPage, PatternFly)" current height={320}>
            <PageArea>
              <EntitiesContext.Provider value={entitiesContextValue}>
                <MetadataPage />
              </EntitiesContext.Provider>
            </PageArea>
          </Cell>
          {carbonFallbacks.map(({ label, fallback }) => (
            <Cell key={label} label={label} height={320}>
              <PageArea>
                <Suspense fallback={fallback}>
                  <Held />
                </Suspense>
              </PageArea>
            </Cell>
          ))}
        </Group>

        <Group
          title="C. Inline with a short label"
          description="PropertiesModal ('Loading properties...'), RestDslEditor ('Loading schemas...', 'Loading form...')"
        >
          <Cell label="Current (PatternFly)" current>
            <Loading>Loading form...</Loading>
          </Cell>
          <Cell label="Carbon Loading (no overlay) + text">
            <Center>
              <CarbonLoading withOverlay={false} description="Loading" />
              <span>Loading form...</span>
            </Center>
          </Cell>
          <Cell label="Carbon InlineLoading + description">
            <Center>
              <InlineLoading description="Loading form..." />
            </Center>
          </Cell>
        </Group>
      </>
    )}
  </>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Experiment />);
