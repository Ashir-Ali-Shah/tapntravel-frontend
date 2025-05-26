// components/StopSelector.js
import React, { useEffect, useState } from "react";
import { FaCircleMinus } from "react-icons/fa6";
import { pakistanCities } from "../utils/data";
import { fetchBusStops } from "../apis/GoogleMapsApi";

const StopSelector = ({
  stop,
  city,
  index,
  updateStop,
  removeStop,
  isOptional = false,
  isMotorway,
}) => {
  const [stopOptions, setStopOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const provinces = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Gilgit Baltistan",
  ];

  useEffect(() => {
    const loadStops = async () => {
      const selectedCity = isOptional ? stop?.city : city;
      if (!selectedCity) return;

      setLoading(true);
      try {
        const query = isMotorway
          ? `motorway rest area in ${selectedCity}, Pakistan`
          : `bus stand in ${selectedCity}, Pakistan`;
        const stops = await fetchBusStops(query);
        setStopOptions(stops);
      } catch (error) {
        console.error("Error fetching bus stops for", selectedCity, error);
      } finally {
        setLoading(false);
      }
    };

    loadStops();
  }, [isOptional ? stop?.city : city, isMotorway]);

  return (
    <div
      className={`w-full grid gap-2 mb-3 items-center ${
        isOptional ? "grid-cols-10" : "grid-cols-1"
      }`}
    >
      {/* City/Province Selector (for optional stops only) */}
      {isOptional && (
        <select
          value={stop.city || ""}
          onChange={(e) =>
            updateStop({ city: e.target.value, name: "", locationLink: "" })
          }
          className="border rounded-lg px-2 py-1 col-span-4"
          required
        >
          <option value="">
            {isMotorway ? "Select Province" : "Select City"}
          </option>
          {(isMotorway ? provinces : Object.keys(pakistanCities)).map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            )
          )}
        </select>
      )}

      {/* Stop Selector */}
      <select
        value={stop.name}
        onChange={(e) => {
          const selected = stopOptions.find((s) => s.name === e.target.value);
          updateStop({
            name: selected?.name || "",
            locationLink: selected?.locationLink || "",
            formattedAddress: selected?.formattedAddress || "",
            placeId: selected?.placeId || "",
            geometry: selected?.geometry || null,
          });
        }}
        className={`border rounded-lg px-2 py-1 ${
          isOptional ? "col-span-3" : "col-span-1"
        }`}
        required
        disabled={!(isOptional ? stop?.city : city)}
      >
        <option value="">{loading ? "Loading stops..." : "Select Stop"}</option>
        {stopOptions.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name} — {s.formattedAddress}
          </option>
        ))}
      </select>

      {/* Duration Input (optional stops only) */}
      {isOptional && (
        <input
          type="number"
          min="1"
          value={stop.duration || ""}
          onChange={(e) => updateStop({ duration: e.target.value })}
          placeholder="Mins"
          className="border rounded-lg px-2 py-1 col-span-2"
          required
        />
      )}

      {/* Remove Button (optional stops only) */}
      {isOptional && (
        <button type="button" onClick={removeStop} className="col-span-1">
          <FaCircleMinus className="text-red-600 text-xl" />
        </button>
      )}
    </div>
  );
};

export default StopSelector;
