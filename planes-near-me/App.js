import { Text, View, Image, Button, TouchableOpacity } from 'react-native';
import "./global.css";
import Plane from './components/Planes';
import { fetchData } from './api/fetchData';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location'
// import Maps from './components/Maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
// import {  } from '@fortawesome/free-solid-svg-icons/'
import { faLocationCrosshairs, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

export default function App() {
  const [data, setData] = useState([]);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  const [radius, setRadius] = useState(1)
  const [locationName, setLocation] = useState('Your Location')
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
        setLat(currentLocation.coords.latitude)
        setLong(currentLocation.coords.longitude)
        const output = await fetchData({
          lat: latitude,
          long: longitude,
          radius: radius
        })
        console.log(output)
        
        setData(output)
        await checkNewPlanes(output)
      } catch (error) {
        console.error(error)
      }
    }
    getPlanes()
  }, [])

  useEffect(()=> {
    const interval = setInterval(async () => {
      try {
        const output = await fetchData({
          lat, long, radius
        })
        setData(output)
        await checkNewPlanes(output)
      } catch (error) {
        console.error(error)
      }
    })
  }, 60000)

  const changeLoc = async (latitude, longitude) => {
    const loc = locationName == 'Your Location' ? 'Delhi Airport' : 'Your Location'
    setLocation(loc)
    const newLat = loc == 'Your Location' ? lat : '28.537298'
    const newLong = loc == 'Your Location' ? long : '77.127885'
    setLat(newLat)
    setLong(newLong)
    const data = await fetchData({
      lat: newLat,
      long: newLong,
      radius: radius
    })
    console.log('data found from new loc: ' + data)
    setData(data)
    await checkNewPlanes(data)
  }
  const changeRadius = async () => {
    const rad = radius >= 3 ? 1 : radius + 1
    setRadius(rad)
    const data = await fetchData({
      lat: lat,
      long: long,
      radius: rad
    })
    console.log('data found from new rad: ' + data)
    setData(data)
    await checkNewPlanes(data)
  }
  useEffect(() =>{
    Notifications.requestPermissionsAsync()
  })
  const checkNewPlanes = async (planes) => {
    const currentPlanes = new Set(planes.map(plane => plane.callsign))
    if (previousPlanes.current.size > 0) {
      const newPlanes = planes.filter(plane => !previousPlanes.current.has(plane.callsign))
      if (newPlanes.length > 0) {
        await sendNotification(planes.map(plane => plane.callsign), planes.map(plane => plane.origin_airport + '-' + plane.dest_airport))
      }
    }
    previousPlanes.current = currentPlanes
  }

  const sendNotification = async (name, route) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${name}`,
        body: `${route}`
      },
      trigger: null
    })
  }
  return (
    <View className="mt-20 mx-2">
      <View className="topbar flex items-start jusify-center">
        <View className="flex w-full items-center flex-row justify-between">
          <View className="flex flex-col">
            <Text className="text-md text-[24px] font-black">Planes Near Me</Text>
            <Text className="coord italic text-[10px] text-gray-600">Your Coordinates: {lat}, {long}</Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => changeLoc()} className="flex-row px-3 mb-1 h-10 flex items-center justify-center bg-black rounded-[1000px]">
              <FontAwesomeIcon icon={faLocationDot} size={15} color='#fff'/>
              <Text className="text-white font-black ml-1">{locationName}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeRadius()} className="px-3 h-10 flex flex-row items-center justify-center bg-black rounded-[1000px]">
              <FontAwesomeIcon icon={faLocationCrosshairs} color='#fff'/>
              <Text className="text-white font-black text-center ml-2">Radius: {radius}km</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-[1px] w-[90vw] mt-3 bg-gray-100 flex items-center justify-center"><Text>.</Text></View>
      </View>
      {/* <Text className="self-center mt-2" onPress={() => changeLoc('28.537298', '77.127885')}>Change location to Delhi Airport</Text> */}
      <View className="planes px-5 mt-4 flex">
        {/* <Text className="mb-5 text-xl font-black">Planes Found</Text> */}
        {data.map((plane, index) => (
          <Plane key={index} image={plane.image} name={plane.callsign} o_code={plane.origin_code} airports={plane.origin_airport + '-' + plane.dest_airport} d_code={plane.dest_code} />
        ))}
      </View>
    </View>

  );
}

//  <View className="location mt-5 px-5 flex flex-col">
//         <Text className="text-xl font-black">Your Location</Text>
//         <View className="map self-center text-center justify-center flex items-center border-1 h-[300px] w-[100%] mt-5">
//           {/* <MapView style={{width: "100%", height: "100%"}} initialRegion={{latitude: lat, longitude: long, latitudeDelta: 0.1, longitudeDelta: 0.1}}>
//           {
//             data.map((plane, index) => (
//               <Marker key={index} coordinate={{latitude: Number(plane.lat), longitude: Number(plane.lon)}} title={plane.callsign}/>
//             ))
//           }
//         </MapView> */}
//         </View> 
//       </View>
