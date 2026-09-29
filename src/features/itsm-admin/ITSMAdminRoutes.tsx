import type { RouteObject } from "react-router-dom";
import { CatalogAdmin } from "./CatalogAdmin";

export const ITSMAdminRoutes: RouteObject[] = [
  { path: "/instances/:instanceId/itsm-admin/catalog/:phase/:module/:screen", element: <CatalogAdmin /> },
];
