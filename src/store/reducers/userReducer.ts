import { createSlice } from "@reduxjs/toolkit";

export type InitialUserState = {
  id: string;
  name: string;
  email: string;
};

export const initialUserState: InitialUserState = {
  // TODO: change this once we have auth
  id: "1",
  name: "",
  email: "",
};

const userSliceReducer = {
  login(state: InitialUserState, action: { payload: string }) {},
  logout(state: InitialUserState) {},
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialUserState as InitialUserState,
  reducers: userSliceReducer,
  // extraReducers: (builder) => {
  //   builder.addCase(fetchAllArchenemyCards.fulfilled, (state, action) => {
  //     // TODO: type the response and stuff
  //     state.cardPool = action.payload;
  //   });
  // },
});

export const { login, logout } = userSlice.actions;
