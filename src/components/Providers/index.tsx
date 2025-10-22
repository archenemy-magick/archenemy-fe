"use client";

import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { store, persistor } from "~/store";
import CustomMantineProvider from "../MantineProvider";
import AuthProvider from "../AuthProvider";
import { InstallPrompt } from "~/components/InstallPrompt";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PersistGate loading={null} persistor={persistor}>
      <StoreProvider store={store}>
        <AuthProvider>
          <GoogleReCaptchaProvider
            reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            scriptProps={{
              async: true,
              defer: true,
              appendTo: "head",
            }}
          >
            <CustomMantineProvider>
              <InstallPrompt />
              {children}
            </CustomMantineProvider>
          </GoogleReCaptchaProvider>
        </AuthProvider>
      </StoreProvider>
    </PersistGate>
  );
}
