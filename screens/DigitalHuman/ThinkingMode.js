import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

export default function ThinkingMode(message) {

    const {thinkingContent, normalContent} = processMessage(message)

    
    //提取思考模式与结果输出    
    const processMessage = (message) => {
        const thinkingRegex = /<think>(.*?)<\/think>/s
        const match = message.match(thinkingRegex)

        if(match){
            const thinkingContent = match[1].trim()
            const normalContent = message.replace(thinkingRegex,"").trim()
            return {thinkingContent, normalContent}
        }

        return {thinkingContent: "", normalContent: message}
    }
    

    return (
        <View>
            <View>
                <Text>{thinkingContent}</Text>
            </View>
            <View>
                <Text>{normalContent}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({})