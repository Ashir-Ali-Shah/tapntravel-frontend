import { fetchAdminBuses } from "./slices/busesSlice"
import { fetchDrivers } from "./slices/driverSlice"
import { fetchPayments } from "./slices/paymentSlice"
import { fetchVehicles } from "./slices/vehicleSlice"

export const initializeStore = async (dispatch) => {
    try {
        await Promise.all([
            dispatch(fetchAdminBuses()).unwrap(),
            dispatch(fetchDrivers()).unwrap(),
            dispatch(fetchVehicles()).unwrap(),
            dispatch(fetchPayments()).unwrap()
        ])
    } catch (error) {
        console.error("Error in initializing store", error)
    }
}