import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RequestState } from "../../components/utils/enums";
import { apiBaseUrl } from "../../components/apis/setting";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const fetchDrivers = createAsyncThunk("drivers/fetchDrivers", async () => {
    const decodedToken = jwtDecode(localStorage.getItem("token"));
    const response = await axios.get(`${apiBaseUrl}/admin?adminId=${decodedToken?.sub}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
    return response.data;
})


const driverSlice = createSlice({
    name: "drivers",
    initialState: { data: [], status: RequestState.IDLE },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDrivers.pending, (state) => {
                state.status = RequestState.LOADING;
            })
            .addCase(fetchDrivers.fulfilled, (state, action) => {
                state.status = RequestState.SUCCEEDED;
                state.data = action.payload;
            })
            .addCase(fetchDrivers.rejected, (state) => {
                state.status = RequestState.FAILED;
            })
    }
})

export default driverSlice.reducer;
