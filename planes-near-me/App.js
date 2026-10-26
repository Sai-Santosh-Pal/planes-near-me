import { Text, View, Image, TouchableOpacity } from 'react-native';
import "./global.css";
import Plane from './components/Planes';
import { fetchData } from './api/fetchData';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location'
// import Maps from './components/Maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
// import {  } from '@fortawesome/free-solid-svg-icons/'
import { faLocationCrosshairs, faLocationDot, faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

export default function App() {
  const previousPlanes = useRef(new Set())
  const hasBaseline = useRef(false)
  const [data, setData] = useState([]);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  const [radius, setRadius] = useState(1)
  const [locationName, setLocation] = useState('Your Location')

  useEffect(() => {
    const getPlanes = async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250]
          })
        }
        const {status: notifStatus} = await Notifications.getPermissionsAsync()
        if (notifStatus !== 'granted') {
          const {status: newNotifStatus} = await Notifications.requestPermissionsAsync()
          if (newNotifStatus !== 'granted') {
            console.log('notif perm denied')
          }
        }
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
    if (lat === 0 || long === 0) return
    const interval = setInterval(async () => {
      try {
        const output = await fetchData({lat, long, radius})
        if (Array.isArray(output)) {
          setData(output)
          await checkNewPlanes(output)
        }
      } catch(error) {
        console.log('plane interval', error)
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [lat, long, radius])

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
    await checkNewPlanes(data, {resetBaseline: true})
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
    await checkNewPlanes(data, {resetBaseline: true})
  }
  // useEffect(() =>{
  //   const setupNotifications = async () => {
  //     try {
  //       await Notifications.setNotificationChannelAsync('planes', {
  //         name: 'New plane found',
  //         importance: Notifications.AndroidImportance.MAX,
  //         vibrationPattern: [0, 250, 250, 250],
  //         sound: 'default'
  //       })
  //       const {status} = await Notifications.requestPermissionsAsync()
  //       console.log("notif status ", status)
  //     } catch (error) {
  //       console.log('notif error ', error)
  //     }
  //   }
  //   setupNotifications()
  // }, [])
  // const checkNewPlanes = async (planes) => {
  //   const currentPlanes = new Set (planes.map(plane => plane.callsign).filter(Boolean))
  //   if (previousPlanes.current.size > 0) {
  //     const newPlanes = planes.filter(plane => plane.callsign && !previousPlanes.current.has(plane.callsign))
  //     for (const plane of newPlanes) {
  //       await sendNotification(
  //         plane.callsign,
  //         `${plane.origin_airport || 'Unknown'} - ${plane.dest_airport || 'Unknown'}` 
  //       )
  //     }
  //   }
  //   previousPlanes.current = currentPlanes
  // }
  const checkNewPlanes = async (planes, {resetBaseline=false} = {}) => {
    if (!Array.isArray(planes)) return
    const currentPlanes = new Set(planes.map(p => p.callsign).filter(Boolean))
    if (hasBaseline.current && !resetBaseline) {
      const newPlanes = planes.filter(p => p.callsign && !previousPlanes.current.has(p.callsign))
      for (const plane of newPlanes) {
        await sendNotification(plane.callsign, `${plane.origin_airport || 'Unknown'}-${plane.dest_airport || 'Unknown'}`)
        console.log(plane.callsign, `${plane.origin_airport || 'Unknown'}-${plane.dest_airport || 'Unknown'}`)      
      }
    }
    previousPlanes.current = currentPlanes
    hasBaseline.current = true
  }

  const sendNotification = async (name, route) => {
    console.log('notification func run')
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: name,
          body: route,
          sound: 'default',
        },
        trigger: null
      })
      console.log("notif scheduled ", id)
    } catch(error){
      console.log("notif scheduled error ", error)
    }
  }
  return (
    <View className="mt-20 mx-2 bg-white text-black">
      <View className="topbar flex items-start jusify-center bg-white text-black">
        <View className="flex bg-white text-black w-full items-center flex-row justify-between">
          <View className="flex  bg-white text-black flex-col">
            <Text className="text-md text-[24px] font-black" onPress={() => sendNotification('Planes Near Me', 'this is a secret feature shhhh')}>Planes Near Me</Text>
            <Text className="coord italic text-[10px] text-gray-600">Your Coordinates: {lat}, {long}</Text>
          </View>
          <View className="bg-white text-black">
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
        {/* <TouchableOpacity onPress={() => sendNotification('test', 'abc-xyz')}>
          <Text>check notif</Text>
        </TouchableOpacity> */}
        {/* <View className="h-[1px] w-[90vw] mt-3 bg-gray-100 flex items-center justify-center"><Text>.</Text></View> */}
      </View>
      {/* <Text className="self-center mt-2" onPress={() => changeLoc('28.537298', '77.127885')}>Change location to Delhi Airport</Text> */}
      <View className="planes bg-white text-black px-5 mt-4 flex">
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
