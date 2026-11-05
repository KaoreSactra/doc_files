import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { MainLayout } from '@/components';
import DocPage from '@/pages/DocPage';
import HomePage from '@/pages/HomePage';

const rootRoute = createRootRoute({ component: MainLayout });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const docRoute = createRoute({ getParentRoute: () => rootRoute, path: 'docs/$', component: DocPage });

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, docRoute]),
  defaultPreload: 'intent',
});
