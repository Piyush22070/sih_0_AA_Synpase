import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

const MOCK_LINEAGES = [
  { id: 'CL_2023_A4B8', date: '2023-10-26', score: 0.92, status: 'NOVEL', label: 'Extremely High' },
  { id: 'CL_2023_B2C1', date: '2023-09-15', score: 0.35, status: 'KNOWN', label: 'Low' },
  { id: 'CL_2022_D9E5', date: '2022-11-02', score: 0.82, status: 'NOVEL', label: 'High' },
  { id: 'CL_2024_X1Y2', date: '2024-01-10', score: 0.65, status: 'NOVEL', label: 'Medium' },
  { id: 'CL_2021_Z9W8', date: '2021-05-20', score: 0.15, status: 'KNOWN', label: 'Very Low' },
];

export default function LineagesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreThreshold, setScoreThreshold] = useState(0);

  const filteredLineages = useMemo(() => {
    return MOCK_LINEAGES.filter(item => {
      const matchesFilter = filter === 'All' || 
                            (filter === 'Novel' && item.status === 'NOVEL') ||
                            (filter === 'Known' && item.status === 'KNOWN');
      const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore = item.score >= scoreThreshold;
      return matchesFilter && matchesSearch && matchesScore;
    });
  }, [filter, searchQuery, scoreThreshold]);

  const renderItem = ({ item }: { item: typeof MOCK_LINEAGES[0] }) => (
    <TouchableOpacity 
      className="bg-card p-4 mb-3 rounded-xl border border-gray-800"
      onPress={() => router.push(`/lineage/${item.id}` as any)}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="font-bold text-lg text-white">{item.id}</Text>
          <Text className="text-gray-500 text-xs">Discovered: {item.date}</Text>
        </View>
        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded-md mr-2 ${
            item.status === 'NOVEL' ? 'bg-purple-900/30' : 'bg-green-900/30'
          }`}>
            <Text className={`text-xs font-bold ${
              item.status === 'NOVEL' ? 'text-purple-400' : 'text-green-400'
            }`}>{item.status}</Text>
          </View>
          <MaterialCommunityIcons name="star-circle" size={20} color="#FBBF24" />
        </View>
      </View>

      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full border-4 border-accent items-center justify-center mr-3">
          <Text className="text-white text-xs font-bold">{item.score}</Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs">Novelty Score</Text>
          <Text className="text-white font-bold">{item.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Lineages</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="bg-card flex-row items-center p-3 rounded-xl border border-gray-800 mb-4">
        <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput 
          placeholder="Search by Cluster ID..." 
          placeholderTextColor="#64748B"
          className="flex-1 text-white"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-10">
        {['All', 'Novel', 'Known'].map((f, i) => (
          <TouchableOpacity 
            key={i} 
            onPress={() => setFilter(f)}
            className={`px-6 py-2 rounded-full mr-2 ${filter === f ? 'bg-accent' : 'bg-card border border-gray-800'}`}
          >
            <Text className={`text-sm font-medium ${filter === f ? 'text-background' : 'text-gray-400'}`}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slider */}
      <View className="mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-white font-medium">Min Novelty Score</Text>
          <Text className="text-accent font-bold">{scoreThreshold.toFixed(2)}</Text>
        </View>
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#22D3EE"
          maximumTrackTintColor="#1E293B"
          thumbTintColor="#22D3EE"
          value={scoreThreshold}
          onValueChange={setScoreThreshold}
        />
      </View>

      <FlatList
        data={filteredLineages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-10">No lineages found matching criteria.</Text>
        }
      />
    </SafeAreaView>
  );
}
