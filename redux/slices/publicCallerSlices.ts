import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    callType: "GENERAL"

};

const publicCallerSlices = createSlice({
    name: 'publicCaller',
    initialState,
    reducers: {
        setCallType: (state, action) => {
            state.callType = action.payload;
        },
    },
});

export const { setCallType } = publicCallerSlices.actions;
export default publicCallerSlices.reducer;
