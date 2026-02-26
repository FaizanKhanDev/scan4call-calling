import { API_URL, APP_API_KEY } from '@/constant/key';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const publicCallerApi = createApi({
    reducerPath: 'publicCallerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/v1/publiccaller`,
        prepareHeaders: async (headers) => {
            headers.set('X-App-Key', APP_API_KEY);
            headers.set('Accept', 'application/json');
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),

    endpoints: (builder) => ({
        initializeCall: builder.mutation({
            query: (credentials) => ({
                url: `/initialize-call-access`,
                method: 'POST',
                body: credentials
            }),
        }),

        verifyPhoneNumber: builder.mutation({
            query: (credentials) => ({
                url: `/verify-phone`,
                method: 'POST',
                body: credentials
            }),
        }),


        reSentOTP: builder.mutation({
            query: (credentials) => ({
                url: `/resent-otp`,
                method: 'POST',
                body: credentials
            }),
        }),

        endPublicCallerCall: builder.mutation({
            query: (credentials) => ({
                url: `/end-call`,
                method: 'POST',
                body: credentials
            }),
        }),

    }),
});

export const {
    useInitializeCallMutation, /* ----- function: initializeCall (endPoint:/initialize-call-access) ----- */
    useVerifyPhoneNumberMutation, /* ----- function: verifyPhoneNumber (endPoint:/verify-phone) ----- */
    useReSentOTPMutation, /* ----- function: reSentOTP (endPoint:/resent-otp) ----- */
    useEndPublicCallerCallMutation, /* ----- function: endPublicCallerCall (endPoint:/end-call) ----- */
} = publicCallerApi;
