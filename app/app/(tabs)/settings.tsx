import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';

export default function SettingsScreen() {
  const { clearStore } = useStore();

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all samples? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            await clearStore();
            Alert.alert("Success", "All data has been cleared.");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text className="text-3xl font-bold text-white mb-6">Settings</Text>

      <ScrollView>
        <View className="bg-card rounded-xl border border-gray-800 mb-6 overflow-hidden">
          <View className="p-4 border-b border-gray-800 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="person-circle-outline" size={24} color="#fff" />
              <Text className="text-white font-medium ml-3">Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </View>
          <View className="p-4 border-b border-gray-800 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={24} color="#fff" />
              <Text className="text-white font-medium ml-3">Wallet Connection</Text>
            </View>
            <Text className="text-green-400 text-sm">Connected</Text>
          </View>
        </View>

        <Text className="text-gray-500 font-bold mb-2 ml-2 uppercase text-xs">Preferences</Text>
        <View className="bg-card rounded-xl border border-gray-800 mb-6 overflow-hidden">
          <View className="p-4 border-b border-gray-800 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <Text className="text-white font-medium ml-3">Notifications</Text>
            </View>
            <Switch value={true} trackColor={{ false: '#334155', true: '#22D3EE' }} thumbColor="#fff" />
          </View>
          <View className="p-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={24} color="#fff" />
              <Text className="text-white font-medium ml-3">Dark Mode</Text>
            </View>
            <Switch value={true} disabled trackColor={{ false: '#334155', true: '#22D3EE' }} thumbColor="#fff" />
          </View>
        </View>

        <Text className="text-gray-500 font-bold mb-2 ml-2 uppercase text-xs">System</Text>
        <View className="bg-card rounded-xl border border-gray-800 mb-6 overflow-hidden">
          <View className="p-4 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={24} color="#fff" />
              <Text className="text-white font-medium ml-3">About</Text>
            </View>
            <Text className="text-gray-500 text-sm">v1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity className="bg-red-900/20 border border-red-900 p-4 rounded-xl items-center">
          <Text className="text-red-400 font-bold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
