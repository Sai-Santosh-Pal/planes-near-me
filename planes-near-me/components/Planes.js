import { Text, View, Image } from 'react-native';
import "../global.css";

export default function Plane(props) {
    return (
        <View className="bg-gray-30 border-[0.5px] flex items-center overflow-hidden flex-row gap-2 h-[70px] border-gray-300 rounded-xl mb-3">
            <Image source={{ uri: props.image }} style={{ width: '20%', height: '100%' }} onError={(e) => console.log(e.nativeEvent)} />
            {/* <Text>{props.image}</Text> */}
            <View className="text flex w-[70%] my-5 mr-2">
                <View className="title flex flex-row gap-2">
                    <Text className="font-semibold">{props.name}</Text>
                    <Text className="italic text-gray-300">{props.o_code} - {props.d_code} </Text>
                </View>
                <Text className="text-[10px]">{props.airports}</Text>
            </View>
        </View>
    );
}