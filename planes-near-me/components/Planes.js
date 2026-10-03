import { Text, View, Image } from 'react-native';
import "../global.css";

export default function Plane(props) {
    return (
        <View className="bg-gray-30 border-[0.5px] flex items-center overflow-hidden flex-row gap-2 h-[70px] border-gray-300 rounded-xl mb-3">
            <Image className="overflow-hidden ml-[-10px] w-[33%] h-[100%]" resizeMode='contain' source={require('../assets/placeholder-img.jpeg')} />

            <View className="text flex w-[50%] my-5 mr-2">
                <View className="title flex flex-row gap-2">
                    <Text className="font-semibold">{props.name}</Text>
                    <Text className="italic text-gray-300">{props.origin} - {props.dest}</Text>
                </View>
                <Text className="">{props.coords}</Text>
            </View>
        </View>
    );
}