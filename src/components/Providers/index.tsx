"use client";

import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { useEffect } from "react";
import { store, persistor, startPersistence } from "~/store";
import CustomMantineProvider from "../MantineProvider";
import AuthProvider from "../AuthProvider";
import { InstallPrompt } from "~/components/InstallPrompt";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { usePathname } from "next/navigation";

// Public pages that render before saved state is restored, so their HTML is
// server-rendered for search engines and link previews. They must not depend
// on persisted state for anything but cosmetics (e.g. signed-in buttons).
// Everything else still waits, as before.
const RENDER_BEFORE_REHYDRATE = [
  "/",
  "/faq",
  "/privacy",
  "/terms",
  "/signin",
  "/signup",
];
const RENDER_BEFORE_REHYDRATE_PREFIXES = ["/articles"];

function rendersBeforeRehydrate(pathname: string) {
  return (
    RENDER_BEFORE_REHYDRATE.includes(pathname) ||
    RENDER_BEFORE_REHYDRATE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Restore saved state only after the first render has hydrated.
  useEffect(() => {
    startPersistence();
  }, []);

  // Only load reCAPTCHA on signup and signin pages
  const needsRecaptcha = pathname === "/signup" || pathname === "/signin";

  const content = (
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
  );

  // Passing the same tree as `loading` means public pages render right away
  // and are not remounted when rehydration finishes.
  return (
    <PersistGate
      loading={rendersBeforeRehydrate(pathname) ? content : null}
      persistor={persistor}
    >
      {content}
    </PersistGate>
  );
}
