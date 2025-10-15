"use client"

import { useEffect, useRef, useState } from "react"

interface MapProps {
  center: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    type: "user" | "bus" | "pickup"
    label?: string
    avatar?: string
  }>
  route?: Array<[number, number]>
  onMapClick?: (lat: number, lng: number) => void
  className?: string
  showGeofence?: boolean
}

const DAKAR_PORT_GEOFENCE: [number, number][] = [
  [14.705, -17.455],
  [14.705, -17.43],
  [14.685, -17.43],
  [14.685, -17.455],
  [14.705, -17.455],
]

export function Map({
  center,
  zoom = 13,
  markers = [],
  route,
  onMapClick,
  className = "",
  showGeofence = true,
}: MapProps) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const routeLayerRef = useRef<any>(null)
  const geofenceLayerRef = useRef<any>(null)
  const leafletLoadedRef = useRef(false)
  const [calculatedRoute, setCalculatedRoute] = useState<[number, number][] | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || leafletLoadedRef.current) return

    leafletLoadedRef.current = true

    // Load Leaflet CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.async = true
    script.onload = () => {
      const L = (window as any).L

      if (!L || !mapContainerRef.current) return

      const isMobile = window.innerWidth < 768

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        dragging: !isMobile,
        touchZoom: !isMobile,
        scrollWheelZoom: !isMobile,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        tap: !isMobile,
      }).setView(center, zoom)

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (showGeofence) {
        geofenceLayerRef.current = L.polygon(DAKAR_PORT_GEOFENCE, {
          color: "#00AA66",
          fillColor: "#00AA66",
          fillOpacity: 0.1,
          weight: 2,
          dashArray: "5, 10",
        }).addTo(map)
      }

      // Handle map clicks
      if (onMapClick) {
        map.on("click", (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng)
        })
      }

      mapRef.current = map

      // Initial markers
      updateMarkers(L, map)
    }

    document.head.appendChild(script)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const updateMarkers = (L: any, map: any) => {
    if (!L || !map) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add new markers
    markers.forEach((markerData) => {
      let icon: any

      if (markerData.type === "bus") {
        icon = L.divIcon({
          className: "custom-bus-marker",
          html: `
            <div style="position: relative;">
              <div style="position: absolute; inset: 0; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;">
                <div style="height: 48px; width: 48px; border-radius: 50%; background-color: rgba(8, 175, 108, 0.3);"></div>
              </div>
              <div style="position: relative; height: 48px; width: 48px; border-radius: 50%; background-color: #08AF6C; display: flex; align-items: center; justify-content: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6v6"/>
                  <path d="M15 6v6"/>
                  <path d="M2 12h19.6"/>
                  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
                  <circle cx="7" cy="18" r="2"/>
                  <circle cx="17" cy="18" r="2"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        })
      } else if (markerData.type === "pickup") {
        icon = L.divIcon({
          className: "custom-pickup-marker",
          html: `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#00AA66" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 48],
        })
      } else {
        const avatarUrl = markerData.avatar || "/professional-employee.png"
        icon = L.divIcon({
          className: "custom-user-marker",
          html: `
            <div style="position: relative;">
              <div style="position: absolute; inset: 0; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;">
                <div style="height: 56px; width: 56px; border-radius: 50%; background-color: rgba(0, 102, 204, 0.3);"></div>
              </div>
              <div style="position: relative; height: 56px; width: 56px; border-radius: 50%; border: 3px solid #0066CC; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); background-color: white;">
                <img src="${avatarUrl}" alt="User" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            </div>
          `,
          iconSize: [56, 56],
          iconAnchor: [28, 28],
        })
      }

      const marker = L.marker(markerData.position, { icon }).addTo(map)

      if (markerData.label) {
        marker.bindPopup(markerData.label)
      }

      markersRef.current.push(marker)
    })
  }

  // Update center and zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  // Update markers
  useEffect(() => {
    const L = (window as any).L
    if (mapRef.current && L) {
      updateMarkers(L, mapRef.current)
    }
  }, [markers])

  // Update route
  useEffect(() => {
    const L = (window as any).L
    if (!mapRef.current || !L) return

    // Remove existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    const routeToDisplay = calculatedRoute || route

    // Add new route
    if (routeToDisplay && routeToDisplay.length > 0) {
      routeLayerRef.current = L.polyline(routeToDisplay, {
        color: "#08AF6C",
        weight: 4,
        opacity: 0.8,
        dashArray: calculatedRoute ? "" : "10, 10",
      }).addTo(mapRef.current)

      // Fit bounds to show entire route
      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] })
    }
  }, [calculatedRoute, route])

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
      )
      const data = await response.json()

      if (data.routes && data.routes[0]) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number],
        )
        setCalculatedRoute(coordinates)
      }
    } catch (error) {
      console.error("[v0] Error fetching route:", error)
      // Fallback: utiliser une ligne droite si l'API échoue
      setCalculatedRoute([start, end])
    }
  }

  useEffect(() => {
    if (route && route.length >= 2) {
      fetchRoute(route[0], route[route.length - 1])
    } else {
      setCalculatedRoute(null)
    }
  }, [route])

  return <div ref={mapContainerRef} className={`w-full h-full ${className}`} />
}
