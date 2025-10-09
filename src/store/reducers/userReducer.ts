import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createClient } from "~/lib/supabase/client";

export type InitialUserState = {
  id: string | null;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

export const initialUserState: InitialUserState = {
  id: null,
  email: null,
  username: null,
  firstName: null,
  lastName: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Async Thunks
export const signUp = createAsyncThunk(
  "user/signUp",
  async (
    {
      email,
      password,
      username,
      firstName,
      lastName,
    }: {
      email: string;
      password: string;
      username: string;
      firstName?: string;
      lastName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            firstName,
            lastName,
          },
        },
      });

      if (error) throw error;
      return {
        id: data.user?.id || null,
        email: data.user?.email || null,
        username: data.user?.user_metadata?.username || null,
        firstName: data.user?.user_metadata?.firstName || null,
        lastName: data.user?.user_metadata?.lastName || null,
      };
    } catch (error: unknown) {
      return rejectWithValue((error as { message: string }).message);
    }
  }
);

export const signIn = createAsyncThunk(
  "user/signIn",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return {
        id: data.user?.id || null,
        email: data.user?.email || null,
        username: data.user?.user_metadata?.username || null,
        firstName: data.user?.user_metadata?.firstName || null,
        lastName: data.user?.user_metadata?.lastName || null,
      };
    } catch (error: unknown) {
      return rejectWithValue((error as { message: string }).message);
    }
  }
);

export const signOut = createAsyncThunk(
  "user/signOut",
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      return rejectWithValue((error as { message: string }).message);
    }
  }
);

export const checkAuth = createAsyncThunk("user/checkAuth", async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || null,
    username: user.user_metadata?.username || null,
    firstName: user.user_metadata?.firstName || null,
    lastName: user.user_metadata?.lastName || null,
  };
});

const userSliceReducer = {
  setUser(
    state: InitialUserState,
    action: {
      payload: {
        id: string | null;
        email: string | null;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
      } | null;
    }
  ) {
    if (action.payload) {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.isAuthenticated = true;
    } else {
      state.id = null;
      state.email = null;
      state.username = null;
      state.firstName = null;
      state.lastName = null;
      state.isAuthenticated = false;
    }
    state.loading = false;
  },
  clearError(state: InitialUserState) {
    state.error = null;
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialUserState as InitialUserState,
  reducers: userSliceReducer,
  extraReducers: (builder) => {
    // Sign Up
    builder.addCase(signUp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.username = action.payload.username;
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.isAuthenticated = true;
      }
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign In
    builder.addCase(signIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.username = action.payload.username;
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.isAuthenticated = true;
      }
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign Out
    builder.addCase(signOut.fulfilled, (state) => {
      state.id = null;
      state.email = null;
      state.username = null;
      state.firstName = null;
      state.lastName = null;
      state.isAuthenticated = false;
      state.loading = false;
    });

    // Check Auth
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.username = action.payload.username;
        state.firstName = action.payload.firstName;
        state.lastName = action.payload.lastName;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
      state.loading = false;
    });
  },
});

export const { setUser, clearError } = userSlice.actions;
