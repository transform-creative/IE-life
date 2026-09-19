import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/IndexRoute.tsx"),
  route(
    "authentication",
    "routes/AuthenticationRoute.tsx",
  ),
  route("account", "routes/AccountRoute.tsx"),
  route("shopping", "routes/ShoppingRoute.tsx"),
  route(
    "shopping/week",
    "routes/ShoppingWeekRoute.tsx",
  ),
] satisfies RouteConfig;
