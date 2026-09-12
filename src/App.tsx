import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AppRoutes } from "@core/routing/AppRoutes";
import { store } from "@shared/store/store";
import { useAppDispatch } from "@shared/store/hooks";
import { hydrateThunk } from "@shared/store/authSlice";

function HydrateAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateThunk());
  }, [dispatch]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <HydrateAuth />
        <AppRoutes />
      </Provider>
    </BrowserRouter>
  );
}
