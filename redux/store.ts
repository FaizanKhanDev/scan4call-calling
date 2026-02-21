import { configureStore } from '@reduxjs/toolkit';
import publicCallerReducer from './slices/publicCallerSlices';
import qrCodeSlicesReducer from './slices/qrCodeSlices';
import { publicCallerApi } from './api/publicCaller';
import { qRCodeApi } from './api/qrCode';

export const store = configureStore({
    reducer: {
        publicCaller: publicCallerReducer,
        qrCodeSlicesReducer: qrCodeSlicesReducer,
        [publicCallerApi.reducerPath]: publicCallerApi.reducer,
        [qRCodeApi.reducerPath]: qRCodeApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(publicCallerApi.middleware, qRCodeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
