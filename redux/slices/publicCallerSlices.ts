import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    productList: [] as any,
};

const publicCallerSlices = createSlice({
    name: 'publicCaller',
    initialState,
    reducers: {
        removeProductFromList: (state, action) => {
            state.productList = state.productList.filter(
                (product: any) => product.id !== action.payload
            );
        },
    },
});

export const { removeProductFromList } = publicCallerSlices.actions;
export default publicCallerSlices.reducer;
