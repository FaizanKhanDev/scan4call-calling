import { API_URL, APP_API_KEY } from '@/constant/key';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const qRCodeApi = createApi({
    reducerPath: 'qRCodeApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/v1/qr`,
        prepareHeaders: async (headers) => {
            headers.set('X-App-Key', APP_API_KEY);
            headers.set('Accept', 'application/json');
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),

    endpoints: (builder) => ({
        getqrCodeById: builder.query({
            query: (credentials) => ({
                url: `/get-qr-code-by-code?code=${credentials.code}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetqrCodeByIdQuery  /* ------ Function: getqrCodeById (EndPoint: '/get-qr-code-by-code') -----*/
} = qRCodeApi;
