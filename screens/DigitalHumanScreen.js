"use client"

import React, { useRef, useState, useEffect } from "react"
import {
	StyleSheet,
	View,
	PermissionsAndroid,
	Platform,
} from "react-native"
import {
	RTCPeerConnection,
	mediaDevices
} from 'react-native-webrtc';
import ChatView from './DigitalHuman/ChatView'

import {DigitView} from './DigitalHuman/DigitView'

const DigitalHumanScreen = () => {
	const [isConnected, setIsConnected] = useState(false)
	const [sessionId, setSessionId] = useState(null)
    const [localStream, setLocalStream] = useState(null)
	const [remoteStream, setRemoteStream] = useState(null)
	const pcRef = useRef(null)
	const videoRef = useRef(null)

	const mediaConstraints = {
		audio: true,
		video: {
			frameRate: 30,
			facingMode: 'user'
		}
	}
    // 会话约束
    const sessionConstraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true,
            VoiceActivityDetection: true
        }
    };
	const requestPermissions = async () => {
		if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);
                return Object.values(granted).every(
                    permission => permission === PermissionsAndroid.RESULTS.GRANTED
                );
            } catch (err) {
                console.warn('权限请求失败:', err);
                return false;
            }
        }
        return true;
	};

	const getLocalStream = async() => {
		try{
			const stream = await mediaDevices.getUserMedia(mediaConstraints)
			setLocalStream(stream)
			return stream;
		}catch(err){
			console.error('获取本地流失败:', err)
			throw err;
		}
	};
	
	const createPeerConnection = () => {
		const config = {
			iceServers: [{
				urls: ['stun:stun.l.google.com:19302']
			}],
			sdpSemantics: 'unified-plan'
		}

		const pc = new RTCPeerConnection(config);

		pc.onicecandidate = ({candidate}) => {
			if(candidate){
				console.log('收到ICE候选者:', candidate);
			}
		}

		pc.ontrack = (event) => {
            console.log('收到远程轨道:', event.track.kind);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('连接状态变化:', pc.connectionState);
            if (pc.connectionState === 'connected') {
                setIsConnected(true);
            } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
                setIsConnected(false);
            }
        };

		return pc;
	}
    const negotiate = async(peerConnection) => {
        try{
            console.log('开始协商过程...');
            // peerConnection.addTransceiver('video', { direction: 'recvonly' });
            // peerConnection.addTransceiver('audio', { direction: 'recvonly' });
            console.log('已添加音视频接收器');

            const offer = await peerConnection.createOffer(sessionConstraints);
            await peerConnection.setLocalDescription(offer);
            console.log('本地描述符已设置:', offer);

            // 等待 ICE gathering 完成
            await new Promise((resolve) => {
                if (peerConnection.iceGatheringState === 'complete') {
                    console.log('ICE收集已完成');
                    resolve();
                } else {
                    console.log('等待ICE收集...');
                    const checkState = () => {
                        if (peerConnection.iceGatheringState === 'complete') {
                            console.log('ICE收集完成');
                            peerConnection.removeEventListener('icegatheringstatechange', checkState);
                            resolve();
                        }
                    };
                    peerConnection.addEventListener('icegatheringstatechange', checkState);
                }
            });

            console.log('正在发送offer到服务器...');
            const response = await fetch('http://10.3.242.26:8020/offer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sdp: peerConnection.localDescription.sdp,
                    type: peerConnection.localDescription.type,
                })
            });

            const answer = await response.json();
            console.log('收到服务器应答:', answer);
            // 从响应中获取 sessionId
            const { sessionid: newSessionId } = answer;
            if (newSessionId) {
                setSessionId(newSessionId);
                console.log('设置新的 sessionId:', newSessionId);
            } else {
                console.warn('未能从服务器响应中获取 sessionId');
            }
            await peerConnection.setRemoteDescription(answer);
            console.log('远程描述符设置完成，连接建立成功！');
        } catch (error) {
            console.error('协商失败:', error);
            throw error;
        }
    }

    const handleConnenction = async () => {
        try {
            console.log('开始建立连接...');

			const hasPermissions = await requestPermissions();
			if (!hasPermissions) {
				console.log('权限请求失败');
				return;
			}else{
				console.log('权限请求成功');
			}
			
			const stream = await getLocalStream();
			const pc = createPeerConnection();

			stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

			pcRef.current = pc;
            await negotiate(pc);

            // const config = {
            //     sdpSemantics: 'unified-plan'
            // };
        
            // console.log('使用STUN服务器');
            // config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
        
            // 创建RTCPeerConnection
            // const newPc = new RTCPeerConnection(config);
            // console.log('RTCPeerConnection 已创建');

            // newPc.addEventListener('track', evt => {
            //     if (evt.track.kind === 'video' && videoRef.current) {
            //         console.log('收到视频轨道:', evt.track.id);
            //         videoRef.current.srcObject = evt.streams[0];
            //     } else if (evt.track.kind === 'audio') {
            //         console.log('收到音频轨道:', evt.track.id);
            //         // 获取audio元素
            //         const audioElement = document.getElementById('audio');
            //         if (audioElement) {
            //             audioElement.srcObject = evt.streams[0];
            //         }
            //     }
            // });

            // // 添加连接状态变化监听
            // newPc.addEventListener('connectionstatechange', () => {
            //     console.log('连接状态变化:', newPc.connectionState);
            // });

            // // 添加ICE连接状态变化监听
            // newPc.addEventListener('iceconnectionstatechange', () => {
            //     console.log('ICE连接状态:', newPc.iceConnectionState);
            // });

            // // 添加信令状态变化监听
            // newPc.addEventListener('signalingstatechange', () => {
            //     console.log('信令状态:', newPc.signalingState);
            // });

            // pcRef.current = newPc;
            // setIsConnected(true);
            // console.log('开始进行连接协商...');

            // await negotiate(newPc);
            // console.log('连接建立完成！');
        } catch (error) {
            console.error('连接失败:', error);
            handleDisconnect();
            // setMessagesList(prev => [...prev, {
            //     text: `连接失败: ${error.message || '网络错误'}`,
            //     type: 'system'
            // }]);
        }
    }

	const handleDisconnect = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        setIsConnected(false);
        setSessionId(null);
    };


	return (
		<View style={styles.container}>
			<DigitView
				 videoRef={videoRef}
				 isConnected={isConnected}
				 remoteStream={remoteStream}
			/>
			<ChatView 
				sessionId={sessionId} 
				isConnected={isConnected}
				clickConnection={handleConnenction}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	}
})

export default DigitalHumanScreen

