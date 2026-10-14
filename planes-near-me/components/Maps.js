import { Text } from "react-native";
import { Map, Camera } from "@maplibre/maplibre-react-native"

export default function Maps({ lat, long, planes }) {
  return (
    <View className="flex-1 display-flex">
      <Map mapStyle="https://tiles.openfreemap.org/styles/liberty" className="flex-1 display-flex">
        <Camera initialViewState={{center: [lat, long], zoom: 12}} />
      </Map>
    </View>
  )
}