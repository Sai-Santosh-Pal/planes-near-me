import { Text, View } from 'react-native';
import "./global.css";
import Plane from './components/Planes';
import { fetchData } from './api/fetchData';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location'
import Map from './components/Map';

export default function App() {
  const [data, setData] = useState([]);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  useEffect(() => {
    const getPlanes = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        console.log(status, "-permission")
        if (status !== "granted") {
          console.log(status)
          console.log("perm decline - show popup here")
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({})

        const { latitude, longitude } = currentLocation.coords
        console.log(latitude, longitude)
        const output = await fetchData({
          lat: latitude,
          long: longitude,
          radius: 1
        })
        setLat(currentLocation.coords.latitude)
        setLong(currentLocation.coords.longitude)
        setData(output)
      } catch (error) {
        console.error(error)
      }
    }
    getPlanes()
  }, [])
  return (
    <View className="mt-10 mx-2">
      <View className="topbar flex items-center jusify-center">
        <Text className="py-3 text-md">Planes Near Me</Text>
        <View className="h-[1px] w-[90vw] bg-gray-100 flex items-center justify-center"><Text>.</Text></View>
      </View>
      <View className="location mt-5 px-5 flex flex-col">
        <Text className="text-xl font-black">Your Location</Text>
        <View className="map self-center text-center justify-center flex items-center border-1 border-red-100 h-[300px] w-[100%] mt-5">
          {/* <MapView style={{width: "100%", height: "100%"}} initialRegion={{latitude: lat, longitude: long, latitudeDelta: 0.1, longitudeDelta: 0.1}}>
          {
            data.map((plane, index) => (
              <Marker key={index} coordinate={{latitude: Number(plane.lat), longitude: Number(plane.lon)}} title={plane.callsign}/>
            ))
          }
        </MapView> */}
          <Map />
        </View>
        <Text className="coord self-center mt-2 italic text-gray-300">Your Coordinates: {lat}, {long}</Text>
      </View>
      <View className="planes px-5 mt-10 flex">
        <Text className="mb-5 text-xl font-black">Planes Found</Text>
        {data.map((plane, index) => (
          <Plane key={index} name={plane.callsign} o_code={plane.origin_code} airports={plane.origin_airport + '-' + plane.dest_airport} d_code={plane.dest_code} />
        ))}
        <Plane name="name" o_code="ocode" icao24="" airports="Indira Gandhi Intl Airport - John F. Kennedy Intl Airport" d_code="dcode" dist="1km" coord="28, 70" />

      </View>
    </View>
  );
}
