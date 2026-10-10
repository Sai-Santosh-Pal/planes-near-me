import { Text, View, Image } from 'react-native';
import "../global.css";

export default function Plane(props) {
    return (
        <View className="bg-gray-30 border-[0.5px] flex items-center  flex-row gap-2 h-[70px] border-gray-300 rounded-xl mb-3">
            <Image style={{width: "20%", height: "100%", resizeMode: "cover"}} source={{uri: "https://upload.wikimedia.org/wikipedia/commons/3/36/United_Airlines_Boeing_777-200_Meulemans.jpg"}} />

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