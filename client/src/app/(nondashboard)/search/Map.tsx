"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";
import Loading from "@/components/Loading";
import ErrorPage from "@/components/ErrorPage";
import MapComponent, { LocationProps } from "./MapCom";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

interface Marker extends LocationProps{}
const Map = () => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (isLoading || isError || !properties) return;
    if(!!properties){
      const newMarkers = properties.map((property) => {
        return {
          location: [
             +(property.location.coordinates.longitude),
             +(property.location.coordinates.latitude),
          ],
          name: property.name,
          price: property.pricePerMonth,
          id: property.id,
        };
      });
    
      setMarkers(newMarkers);
    }

  }, [isLoading, isError, properties, filters.coordinates]);

  if (isLoading) return <Loading/>;
  if (isError || !properties) return <ErrorPage title="Error to fetch properties location"/>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <MapComponent
        markers={[]}
      />
    </div>
  );
};

const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
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
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
      )
    )
    .addTo(map);
  return marker;
};

export default Map;
