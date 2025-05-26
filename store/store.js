import { configureStore } from "@reduxjs/toolkit";
import busesReducer from "./slices/busesSlice";
import driversReducer from "./slices/driverSlice";
import vehicleReducer from "./slices/vehicleSlice";
import paymentReducer from "./slices/paymentSlice";

const store = configureStore({
    reducer: {
        buses: busesReducer,
        drivers: driversReducer,
        vehicles: vehicleReducer,
        payments: paymentReducer
    }
})

export default store;