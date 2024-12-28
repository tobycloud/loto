import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("master", "routes/masterPage.tsx"), route("player", "routes/playerPage.tsx")] satisfies RouteConfig;
