import { API_URL, APP_API_KEY } from '@/constant/key';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const publicCallerApi = createApi({
    reducerPath: 'publicCallerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/v1/orders`,
        prepareHeaders: async (headers) => {
            headers.set('X-App-Key', APP_API_KEY);
            headers.set('Accept', 'application/json');
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),

    endpoints: (builder) => ({
        placeOrder: builder.mutation({
            query: (credentials) => ({
                url: `/place-order`,
                method: 'POST',
                body: credentials
            }),
        }),

    }),
});

export const {
    usePlaceOrderMutation, /* ----- function: placeOrder (endPoint:/place-order) ----- */
} = publicCallerApi;
