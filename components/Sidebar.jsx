import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const Sidebar = ({ visible }) => {
  const menuItems = [
    { title: '首页', icon: '🏠' },
    { title: '聊天记录', icon: '💬' },
    { title: '设置', icon: '⚙️' },
    { title: '帮助', icon: '❓' },
  ];

  if (!visible) return null;

  return (
    <View style={styles.sidebar}>
      <ScrollView>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => console.log(`点击了${item.title}`)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Sidebar; 