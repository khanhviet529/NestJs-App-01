const excludedRoutes = new Set([
  '/',
  '/v1/role/routes',
  '/docs',
  '/docs-json'
]);

const fliterUndefined = (route) => route.route !== undefined;
const filterTechnical = (route) => !excludedRoutes.has(route.route);
const extractRoutes = (route) => {
  return {
    route: route?.route?.path,
    method: route?.route?.stack[0]?.method
  }
}

export const getRouteList = (app) => {
  const server = app.getHttpServer();
  const router = server._events.request.router;

  const routesRegistrated: [] = router.stack
    .map(extractRoutes)
    .filter(fliterUndefined)
    .filter(filterTechnical);

  return routesRegistrated;
} 