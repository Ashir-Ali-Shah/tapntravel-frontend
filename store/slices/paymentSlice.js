import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RequestState } from "../../components/utils/enums";
import { apiBaseUrl } from "../../components/apis/setting";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const fetchPayments = createAsyncThunk("drivers/fetchPayments", async () => {
    const decodedToken = jwtDecode(localStorage.getItem("token"));
    const response = await axios.post(`${apiBaseUrl}/payment/payments-advance-search`,{
        adminId: decodedToken?.sub
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
    return response.data;
})


const paymentSlice = createSlice({
    name: "payments",
    initialState: { data: null, status: RequestState.IDLE },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayments.pending, (state) => {
                state.status = RequestState.LOADING;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.status = RequestState.SUCCEEDED;
                state.data = action.payload;
            })
            .addCase(fetchPayments.rejected, (state) => {
                state.status = RequestState.FAILED;
            })
    }
})

export default paymentSlice.reducer;
