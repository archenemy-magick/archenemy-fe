"use client";

import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { store, persistor } from "~/store";
import CustomMantineProvider from "../MantineProvider";
import AuthProvider from "../AuthProvider";
import { InstallPrompt } from "~/components/InstallPrompt";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Only load reCAPTCHA on signup and signin pages
  const needsRecaptcha = pathname === "/signup" || pathname === "/signin";

  return (
    <PersistGate loading={null} persistor={persistor}>
      <StoreProvider store={store}>
        <AuthProvider>
          {needsRecaptcha ? (
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
          ) : (
            <CustomMantineProvider>
              <InstallPrompt />
              {children}
            </CustomMantineProvider>
          )}
        </AuthProvider>
      </StoreProvider>
    </PersistGate>
  );
}
