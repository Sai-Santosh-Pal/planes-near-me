import { Text, View } from 'react-native';
import "./global.css";
import Plane from './components/Planes';
import { fetchData } from './api/fetchData';
import { useEffect, useState } from 'react';



export default function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const getPlanes = async () => {
      try {
        const output = await fetchData({
          lat: 28.542355,
          long: 77.1397189,
          radius: 1
        })
        console.log(output)
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
        <View className="map self-center bg-gray-100 h-[300px] w-[100%] mt-5">

        </View>
        <Text className="coord self-center mt-2 italic text-gray-300">Coordinates: </Text>
      </View>
      <View className="planes px-5 mt-10 flex">
        <Text className="mb-5 text-xl font-black">Planes Found</Text>
        {data.map((plane, index) => (
          <Plane key={index} name={plane.callsign} o_code={plane.origin_code} airports={plane.origin_airport + '-' + plane.dest_airport} d_code={plane.dest_code}/>
        ))}
      </View>
    </View>
  );
}
