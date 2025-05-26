import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RequestState } from '../../components/utils/enums';
import { apiBaseUrl } from '../../components/apis/setting';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

export const fetchAdminBuses = createAsyncThunk('buses/fetchAdminBuses', async () => {
    const decodedToken = jwtDecode(localStorage.getItem("token"));
    const response = await axios.get(`${apiBaseUrl}/bus/ad-bus?adminId=${decodedToken?.sub}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
    return response.data
})

export const deleteBus = createAsyncThunk('buses/deleteBus', async (busId) => {
    try {
        const response = await axios.delete(`${apiBaseUrl}/bus/${busId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return busId;
    } catch (error) {
        console.error('Error deleting bus:', error);
        throw new Error('Failed to delete bus');
    }
});

export const updateBus = createAsyncThunk('buses/updateBus', async ({ busId, data }) => {
    const response = await axios.put(`${apiBaseUrl}/bus/${busId}`, data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    console.log("UPDATE RESPONSE", response)
    return response.data;
});


const busesSlice = createSlice({
    name: 'buses',
    initialState: { data: [], status: RequestState.LOADING },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Buses
            .addCase(fetchAdminBuses.pending, (state) => {
                state.status = RequestState.LOADING;
            })
            .addCase(fetchAdminBuses.fulfilled, (state, action) => {
                state.status = RequestState.SUCCEEDED;
                console.log("Bus Get Action", action)
                state.data = action.payload;
            })
            .addCase(fetchAdminBuses.rejected, (state) => {
                state.status = RequestState.FAILED;
            })
            // Delete bus
            .addCase(deleteBus.fulfilled, (state, action) => {
                console.log("Bus DELETE Action", action);
                state.status = RequestState.SUCCEEDED;
                state.data = state.data.filter((bus) => bus._id !== action.payload);
                toast.success('Bus deleted successfully');
            })
            .addCase(deleteBus.rejected, (state) => {
                toast.error('Failed to delete bus');
            })
            // Update a bus
            .addCase(updateBus.fulfilled, (state, action) => {
                state.status = RequestState.SUCCEEDED;
                state.data = state.data.map(bus =>
                    bus._id === action.payload._id ? { ...bus, driverId: action.payload.driverId } : bus
                );
            })
            .addCase(updateBus.rejected, (state, action) => {
                toast.error('Failed to update bus');
                console.error('Error updating bus:', action.error);
            });
    }
})

export default busesSlice.reducer;