import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    callType: "GENERAL",
    token: "",

};

const publicCallerSlices = createSlice({
    name: 'publicCaller',
    initialState,
    reducers: {
        setCallType: (state, action) => {
            state.callType = action.payload;
        },
        setToken: (state, action) => {
            state.token = action.payload;
        },
    },
});

export const { setCallType, setToken } = publicCallerSlices.actions;
export default publicCallerSlices.reducer;
