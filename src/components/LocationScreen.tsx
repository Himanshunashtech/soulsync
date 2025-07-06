
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// IMPORTANT: Replace this with your actual Mapbox public access token
const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';

interface LocationScreenProps {
  onNavigate: (screen: string) => void;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ onNavigate }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-70.9); // Default longitude
  const [lat, setLat] = useState(42.35); // Default latitude
  const [zoom, setZoom] = useState(9);    // Default zoom
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN') {
      console.warn('Mapbox access token is not set. Please replace YOUR_MAPBOX_ACCESS_TOKEN in LocationScreen.tsx');
      // Optionally, display a message to the user in the UI
    }
    
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    if (map.current || !mapContainer.current) return; // Initialize map only once and if container exists

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // streets style
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('move', () => {
      if (map.current) {
        setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
        setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
        setZoom(parseFloat(map.current.getZoom().toFixed(2)));
      }
    });
    
    // Add navigation control (zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    // Clean up on unmount
    return () => map.current?.remove();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleSaveLocation = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to save your location.', variant: 'destructive' });
      return;
    }

    if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN') {
      toast({
        title: 'Mapbox Token Missing',
        description: 'Please provide a Mapbox access token to save your location.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Reverse geocode to get location name
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (!response.ok || !data.features || data.features.length === 0) {
        throw new Error('Could not find a location name for the selected coordinates.');
      }

      const locationName = data.features[0].place_name;

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ location: locationName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: 'Success!', description: 'Your location has been updated.' });
      onNavigate('settings');

    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: 'Error Saving Location',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center space-x-4 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Set Your Location</h1>
      </div>

      {/* Map container */}
      <div className="relative flex-grow">
        <div ref={mapContainer} className="absolute inset-0" />
        {MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm shadow-lg z-20">
            Map functionality is limited. Administrator: Please set the Mapbox access token.
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg text-xs shadow-md z-20">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      
      <div className="p-4 bg-white/5 border-t border-white/10">
        <button 
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          onClick={handleSaveLocation}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Current Location'}
        </button>
      </div>
    </div>
  );
};

export default LocationScreen;
