import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    qrCodeData: {} as any,
};

const qrCodeSlices = createSlice({
    name: 'qrCodeSlices',
    initialState,
    reducers: {
        addDataToQrCode: (state, action) => {
            state.qrCodeData = action.payload;
        },
    },
});

export const { addDataToQrCode } = qrCodeSlices.actions;
export default qrCodeSlices.reducer;
