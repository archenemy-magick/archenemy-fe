"use client";

import { useEffect } from "react";
import { createClient } from "~/lib/supabase/client";
import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store/configureStore";
import { setUser, checkAuth } from "~/store/reducers";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const supabase = createClient();

    // Check initial auth state
    dispatch(checkAuth());

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email ?? null,
            username: session.user.user_metadata?.username,
            firstName: session.user.user_metadata?.firstName,
            lastName: session.user.user_metadata?.lastName,
          })
        );
      } else {
        dispatch(setUser(null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
