import './components/SourceCode/workers/enable-workers'; // Configure Monaco loader before anything else
import '@patternfly/react-core/dist/styles/base.css'; // This import needs to be first

import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  /*
   * <React.StrictMode>
   * </React.StrictMode>,
   */

  <RouterProvider router={router} />,
);
