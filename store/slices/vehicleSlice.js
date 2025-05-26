import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RequestState } from "../../components/utils/enums";
import { apiBaseUrl } from "../../components/apis/setting";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const fetchVehicles = createAsyncThunk("drivers/fetchVehicles", async () => {
    const decodedToken = jwtDecode(localStorage.getItem("token"));
    const response = await axios.get(`${apiBaseUrl}/bus-entity?adminId=${decodedToken?.sub}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
    return response.data;
})


const vehicleSlice = createSlice({
    name: "vehicles",
    initialState: { data: [], status: RequestState.IDLE },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.pending, (state) => {
                state.status = RequestState.LOADING;
            })
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.status = RequestState.SUCCEEDED;
                state.data = action.payload;
            })
            .addCase(fetchVehicles.rejected, (state) => {
                state.status = RequestState.FAILED;
            })
    }
})

export default vehicleSlice.reducer;
