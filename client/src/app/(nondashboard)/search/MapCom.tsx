/* eslint-disable @typescript-eslint/no-unused-vars */
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/state/redux';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export interface LocationProps {
    id: number;
    name: string;
    location: number[];
    price: number
}

const CustomIcon = L.icon({
    iconUrl: '/marker.png',
    iconSize: [38, 38],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
});


export const UserIcon = L.icon({
    iconUrl: '/profile.png',
    iconSize: [38, 38],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
});
interface Props {
    markers: LocationProps[],
    center?: [number, number];
    zoom?: number;

}


const MapComponent = ({ markers, zoom = 11, center = [11.56650613942859, 37.339266083968795] }: Props) => {
    const user = useAppSelector(state=> state.auth.user);
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error getting user position:', error);
                }
            );
        }
    }, []);
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon1 - lon2);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    return (
        <div className="h-full flex items-center justify-center w-full">
            <pre>
                {JSON.stringify(userPosition, null, 2)}
            </pre>

            <MapContainer className="h-[80vh] w-[75vw]" center={center} zoom={zoom} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                />
                {markers.map((marker) => (
                    <Marker icon={CustomIcon} key={marker.id} position={marker.location.splice(0, 2) as [number, number]}>
                        <Popup>
                            {marker.name}
                            {userPosition && (
                                <div>
                                    Distance: {calculateDistance(userPosition.lat, userPosition.lng, marker.location[0], marker.location[1]).toFixed(2)} km
                                </div>
                            )}
                        </Popup>
                    </Marker>
                ))}

                {userPosition && <Marker icon={UserIcon} position={userPosition}>
                    <Popup>{user?.name}</Popup>
                </Marker>}

            </MapContainer>
        </div>
    );
};

export default MapComponent;