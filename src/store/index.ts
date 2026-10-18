import { configureStore } from "@reduxjs/toolkit";
import { saasadminApi } from "@services/saasadmin";
import { tenantadminApi } from "@services/tenantadmin";
import { authApi, authReducer } from "@services/auth";

export const store = configureStore({
  reducer: {
    [saasadminApi.reducerPath]: saasadminApi.reducer,
    [tenantadminApi.reducerPath]: tenantadminApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(saasadminApi.middleware, tenantadminApi.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
