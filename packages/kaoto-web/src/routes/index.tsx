import { Route, Routes } from 'react-router';

import { routes } from './config';

export const Router = () => {
  return (
    <Routes>
      {routes.map(({ element: Element, ...rest }) => (
        <Route key={rest.path} {...rest} element={Element && <Element />} />
      ))}
    </Routes>
  );
};
