import { apiBaseUrl } from "./setting";

export const fetchBusStops = async (query) => {
  try {
    const url = `${apiBaseUrl}/place/place-search?query=${query}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(
        data.error_message || "Failed to fetch places from Google Maps"
      );
    }
    return data?.results?.map((place) => ({
      id: place?.place_id,
      name: place?.name,
      formattedAddress: place?.formatted_address,
      geometry: place?.geometry,
      locationLink: `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}`,
    }));
  } catch (error) {
    console.error("Google Places API error:", error);
    throw error;
  }
};
