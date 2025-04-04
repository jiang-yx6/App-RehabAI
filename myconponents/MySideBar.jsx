import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'

export default function MySideBar({visible}) {


  const MenuItem = [
    {title:'首页',icon:'🏠'},
    {title:'聊天记录',icon:'💬'},
    {title:'设置',icon:'⚙️'},
    {title:'帮助',icon:'❓'},
    ]
  if(!visible) return null;

  return (
    <View>
        {MenuItem.map((item,index) => (
            <TouchableOpacity key={index}
            onPress={()=>console.log(`点击了${item.title}`)}>
                <Text>{item.icon}</Text>
                <Text>{item.title}</Text>
            </TouchableOpacity>
        )
        )}
    </View>
  )
}

const styles = StyleSheet.create({})