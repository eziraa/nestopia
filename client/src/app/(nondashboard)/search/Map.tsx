"use client";
import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
const mapboxStyleAccessToken = process.env.NEXT_PUBLIC_MAPBOX_STYLE_ACCESS_TOKEN;

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  // Function to create markers
  const createPropertyMarker = useCallback(
    (property: Property, map: mapboxgl.Map) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([
          property.location.coordinates.longitude,
          property.location.coordinates.latitude,
        ])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `
            <div class="marker-popup">
              <div class="marker-popup-image"></div>
              <div>
                <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
                <p class="marker-popup-price">
                  $${property.pricePerMonth} <span class="marker-popup-price-unit">/ month</span>
                </p>
              </div>
            </div>
            `
          )
        )
        .addTo(map);

      return marker;
    },
    []
  );

  useEffect(() => {
    if (isLoading || isError || !properties || !mapContainerRef.current) return;


    // Initialize map only if it doesn’t exist
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: `mapbox://styles/eziraa/${mapboxStyleAccessToken}`,
        center: filters.coordinates || [-74.5, 40],
        zoom: 9,
      });
    }

    const map = mapRef.current;

    // Remove existing markers before adding new ones
    const markers: mapboxgl.Marker[] = [];
    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map);
      markers.push(marker);
    });

    // Resize map after a short delay
    const resizeMap = () => setTimeout(() => map.resize(), 700);
    resizeMap();

    return () => {
      markers.forEach((marker) => marker.remove()); // Clean up markers on unmount
    };
  }, [isLoading, isError, properties, filters.coordinates, createPropertyMarker]);

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        ref={mapContainerRef}
        className="map-container rounded-xl"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

export default Map;
