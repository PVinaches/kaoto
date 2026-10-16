import { FunctionComponent, PropsWithChildren } from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { LoadingState } from '../components/LoadingState/LoadingState';
import { initializeTheme } from '../utils/theme';

/**
 * Static experiment page: renders the Carbon loading and error states used by Kaoto Web (packages/kaoto-web).
 * Open http://localhost:5173/experiment.html while running `yarn workspace @kaoto/kaoto-web start`.
 */

const Bomb: FunctionComponent = () => {
  throw new Error('Boom! This error was thrown on purpose');
};

const Section: FunctionComponent<
  PropsWithChildren<{ title: string; source: string; description?: string; minHeight?: number }>
> = ({ title, source, description, minHeight = 0, children }) => (
  <section style={{ margin: '1.5rem 1rem', border: '2px solid var(--cds-border-strong)' }}>
    <header style={{ padding: '1rem 1.5rem', background: 'var(--cds-layer-accent)' }}>
      <div style={{ fontSize: 20, fontWeight: 600 }}>
        {title} <code style={{ fontSize: 14, fontWeight: 400 }}>{source}</code>
      </div>
      {description && <div style={{ marginTop: 4, opacity: 0.8 }}>{description}</div>}
    </header>
    <div style={{ overflow: 'auto', padding: '2rem', minHeight }}>{children}</div>
  </section>
);

const Experiment: FunctionComponent = () => (
  <>
    <h1 style={{ margin: '1rem' }}>Kaoto Web (Carbon): error boundaries and loading states</h1>

    <h2 style={{ margin: '1rem', fontSize: 28 }}>Error boundaries</h2>

    <Section
      title="1. ErrorBoundary (default fallback)"
      source="components/ErrorBoundary"
      description="Child throws; the boundary renders ErrorState with the error message"
      minHeight={200}
    >
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    </Section>

    <Section
      title="2. ErrorBoundary with custom fallback"
      source="components/ErrorBoundary"
      description="Child throws; the boundary renders the provided fallback instead of ErrorState"
      minHeight={200}
    >
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <Bomb />
      </ErrorBoundary>
    </Section>

    <Section
      title="3. ErrorState (error)"
      source="components/ErrorState"
      description="The component used by the default fallback, rendered directly"
      minHeight={200}
    >
      <ErrorState title="Something went wrong" message="An unexpected error occurred" />
    </Section>

    <Section
      title="4. ErrorState (warning, with retry)"
      source="components/ErrorState"
      description="Warning variant with the Retry button"
      minHeight={200}
    >
      <ErrorState kind="warning" title="Warning" message="Could not refresh the project list" onRetry={() => {}} />
    </Section>

    <h2 style={{ margin: '1rem', fontSize: 28 }}>Loading states</h2>

    <Section title="LoadingState" source="components/LoadingState">
      <LoadingState />
    </Section>

    <Section title="LoadingState small with custom message" source="components/LoadingState">
      <LoadingState small message="Loading project..." />
    </Section>
  </>
);

try {
  initializeTheme();
  createRoot(document.getElementById('root')!).render(<Experiment />);
} finally {
  document.body.classList.add('ready');
}
