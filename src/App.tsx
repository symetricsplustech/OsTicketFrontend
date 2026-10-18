import { AppProviders } from "@app/providers";
import { ServiceManagementApplication } from "@app/ServiceManagementApplication";

export default function App() {
  return (
    <AppProviders>
      <ServiceManagementApplication />
    </AppProviders>
  );
}
