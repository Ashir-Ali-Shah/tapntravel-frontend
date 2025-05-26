export const busStatuses = {
  SCHEDULED: "scheduled", // The bus is scheduled and confirmed to depart at a future time
  BOARDING: "boarding", // Passengers are currently boarding the bus
  IN_TRANSIT: "in_transit", // The bus has departed and is currently en route
  DELAYED: "delayed", // The bus is delayed and hasn't departed or reached on time
  PAUSED: "paused", // The journey is temporarily paused (e.g. rest stop or technical issue)
  COMPLETED: "completed", // The journey has ended successfully
  CANCELLED: "cancelled", // The bus trip was cancelled before or during the journey
  EXPIRED: "expired", // The bus trip was scheduled but the departure time has passed without an update (possibly missed)
  MAINTENANCE: "maintenance", // The bus is currently not available for travel due to maintenance
};
