import React, { useEffect, useState } from "react"
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
} from "react-native"
import { RTCView } from 'react-native-webrtc';
import { BlurView } from "@react-native-community/blur";
import Player from 'react-native-audio-toolkit';

const { width } = Dimensions.get("window")
const { height } = Dimensions.get("window")

export const DigitView = ({ videoRef, isConnected, remoteStream }) => {
    const [audioPlayer, setAudioPlayer] = useState(null);

    useEffect(() => {
        if (isConnected && remoteStream) {
            const audioTracks = remoteStream.getAudioTracks();
            if (audioTracks.length > 0) {
                const audioUrl = remoteStream.toURL();
                const player = new Player(audioUrl, {
                    autoDestroy: false,
                }).play();
                setAudioPlayer(player);
            }
        } else {
            if (audioPlayer) {
                audioPlayer.destroy();
                setAudioPlayer(null);
            }
        }
    }, [isConnected, remoteStream]);

    return (
        <View style={styles.digitalHumanContainer}>
            <BlurView style={styles.blurView} blurType="light" blurAmount={5} reducedTransparencyFallbackColor="white">
                {/* 可以在这里添加占位图片或加载动画 */}
                {isConnected && remoteStream ? (
                    <RTCView 
                        ref={videoRef}
                        streamURL={remoteStream.toURL()}
                        objectFit="cover"
                        style={styles.digitalHuman} 
                    />
                ) : (
                    <Image source={require('../../assets/doctor.jpg')} style={styles.digitalHuman} />
                )}
            </BlurView>
        </View>
    )
}

const styles = StyleSheet.create({
    digitalHumanContainer: {
        height: "90%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    blurView: {
        width: "100%",
        height: "100%",
        overflow: "hidden",
    },
    digitalHuman: {
        width: width,
        height: height * 0.8,
    },
})
