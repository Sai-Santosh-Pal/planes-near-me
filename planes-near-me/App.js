import { Text, View } from 'react-native';
import "./global.css";
import Plane from './components/Planes';

export default function App() {
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
        <Plane name="Air India" origin="DEL" dest="BLR" coords="coords here"/>
        <Plane name="Air India" origin="DEL" dest="BLR" coords="coords here"/>
        <Plane name="Air India" origin="DEL" dest="BLR" coords="coords here"/>
        {/* <Plane />
        <Plane />
        <Plane /> */}
      </View>
    </View>
  );
}
