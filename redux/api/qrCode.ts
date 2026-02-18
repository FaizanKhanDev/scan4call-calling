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
        getQrCodeToCheck: builder.mutation({
            query: (credentials) => ({
                url: `/get-qr-code-by-code-to-check`,
                method: 'POST',
                body: credentials
            }),
        }),

        addDataToQrCode: builder.mutation({
            query: (credentials) => ({
                url: `/add-data-qr-code`,
                method: 'POST',
                body: credentials
            }),
        }),


        verifyOTP: builder.mutation({
            query: (credentials) => ({
                url: `/verify-otp`,
                method: 'POST',
                body: credentials
            }),
        }),



        verifyPIN: builder.mutation({
            query: (credentials) => ({
                url: `/verify-pin`,
                method: 'POST',
                body: credentials
            }),
        }),

        updateDataToQrCode: builder.mutation({
            query: (credentials) => ({
                url: `/update-qr-code-data`,
                method: 'PUT',
                body: credentials
            }),
        }),


        connectQRCodes: builder.mutation({
            query: (credentials) => ({
                url: `/connect-disconnect-qr-codes`,
                method: 'POST',
                body: credentials
            }),
        }),


        getQrCodesList: builder.query({
            query: (credentials) => ({
                url: `/get-qr-list-by-code?codes=${credentials.codes}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetQrCodeToCheckMutation,
    useAddDataToQrCodeMutation,  /* ------ Function: addDataToQrCode (EndPoint: '/add-data-qr-code') -----*/
    useUpdateDataToQrCodeMutation,  /* ------ Function: updateDataToQrCode (EndPoint: '/update-qr-code-data') -----*/
    useVerifyOTPMutation,  /* ------ Function: verifyOTP (EndPoint: '/verify-otp') -----*/
    useVerifyPINMutation,  /* ------ Function: verifyPIN (EndPoint: '/verify-pin') -----*/
    useGetQrCodesListQuery,  /* ------ Function: getQrCodesList (EndPoint: '/get-qr-list-by-code') -----*/
    useConnectQRCodesMutation,  /* ------ Function: connectQRCodes (EndPoint: '/connect-disconnect-qr-codes') -----*/
} = qRCodeApi;
