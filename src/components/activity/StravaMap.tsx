'use client'

import polyline from '@mapbox/polyline'
import { LatLngExpression } from 'leaflet'
import { useEffect, useState } from 'react'
import {
	Polyline as LeafletPolyline,
	MapContainer,
	TileLayer,
} from 'react-leaflet'

type Props = {
	summaryPolyline: string
}

export default function StravaMap({ summaryPolyline }: Props) {
	const [coordinates, setCoordinates] = useState<LatLngExpression[]>([])

	useEffect(() => {
		if (summaryPolyline) {
			const decoded = polyline.decode(summaryPolyline)
			setCoordinates(decoded.map(([lat, lng]: [number, number]) => [lat, lng]))
		}
	}, [summaryPolyline])

	if (coordinates.length === 0) return <p>Карта завантажується...</p>

	return (
		<MapContainer
			center={coordinates[0]}
			zoom={13}
			style={{ height: '400px', width: '100%' }}
		>
			<TileLayer
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				attribution='&copy; OpenStreetMap contributors'
			/>
			<LeafletPolyline positions={coordinates} pathOptions={{ color: 'red' }} />
		</MapContainer>
	)
}
