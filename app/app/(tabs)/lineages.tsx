import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

import { useStore } from '../../store/useStore';
import { ClusterSummary } from '../../types';



export default function LineagesScreen() {
  const router = useRouter();
  const { samples, initializeStore } = useStore();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreThreshold, setScoreThreshold] = useState(0.5);

  useEffect(() => {
    initializeStore();
  }, []);

  // Aggregate all clusters from all samples into a single list of "Lineages"
  const allLineages = useMemo(() => {
    const lineages: (ClusterSummary & { 
      sourceFileId: string; 
      sourceFileName: string; 
      date: string;
      status: 'NOVEL' | 'KNOWN';
    })[] = [];

    samples.forEach(sample => {
      if (sample.latestAnalysis?.cluster_summary) {
        sample.latestAnalysis.cluster_summary.forEach(cluster => {
          lineages.push({
            ...cluster,
            sourceFileId: sample.fileId,
            sourceFileName: sample.fileName || 'Unknown Sample',
            date: sample.collectionTime || sample.uploadDate || new Date().toISOString(),
            status: cluster.novelty_score > 0.7 ? 'NOVEL' : 'KNOWN'
          });
        });
      }
    });

    // Sort by novelty score descending
    return lineages.sort((a, b) => b.novelty_score - a.novelty_score);
  }, [samples]);

  const filteredLineages = useMemo(() => {
    return allLineages.filter(item => {
      const matchesFilter = filter === 'All' || 
                            (filter === 'Novel' && item.status === 'NOVEL') ||
                            (filter === 'Known' && item.status === 'KNOWN');
      const matchesSearch = item.cluster_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.sourceFileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore = item.novelty_score >= scoreThreshold;
      return matchesFilter && matchesSearch && matchesScore;
    });
  }, [allLineages, filter, searchQuery, scoreThreshold]);

  const renderItem = ({ item }: { item: typeof allLineages[0] }) => (
    <TouchableOpacity 
      className="bg-card p-4 mb-3 rounded-xl border border-gray-800"
      onPress={() => router.push(`/sample/${item.sourceFileId}` as any)}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="font-bold text-lg text-white">OSU-{item.cluster_id.substring(0, 8)}</Text>
          <Text className="text-gray-500 text-xs">Source: {item.sourceFileName}</Text>
        </View>
        <View className="flex-row items-center">
          <View className={`px-2 py-1 rounded-md mr-2 ${
            item.status === 'NOVEL' ? 'bg-purple-900/30' : 'bg-green-900/30'
          }`}>
            <Text className={`text-xs font-bold ${
              item.status === 'NOVEL' ? 'text-purple-400' : 'text-green-400'
            }`}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-400 text-xs">Novelty Score</Text>
          <Text className="text-accent font-bold text-xs">{(item.novelty_score * 100).toFixed(1)}%</Text>
        </View>
        <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <View 
            className="h-full bg-accent" 
            style={{ width: `${item.novelty_score * 100}%` }} 
          />
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-800 pt-3">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="dna" size={16} color="#64748B" />
          <Text className="text-gray-400 text-xs ml-1">{item.size} Sequences</Text>
        </View>
        <Text className="text-gray-500 text-xs">{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <Text className="text-3xl font-bold text-white mb-2">Lineages</Text>
      <Text className="text-gray-400 mb-6">Global Discovery Log</Text>

      {/* Search & Filter */}
      <View className="flex-row space-x-3 mb-4">
        <View className="flex-1 bg-card border border-gray-800 rounded-xl flex-row items-center px-4 py-3">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput 
            placeholder="Search OSUs..." 
            placeholderTextColor="#64748B"
            className="flex-1 ml-3 text-white font-medium"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 max-h-10">
        {['All', 'Novel', 'Known'].map((f, i) => (
          <TouchableOpacity 
            key={i} 
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-full mr-2 ${filter === f ? 'bg-accent' : 'bg-card border border-gray-700'}`}
          >
            <Text className={`text-sm font-medium ${filter === f ? 'text-background' : 'text-gray-300'}`}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Novelty Threshold Slider */}
      <View className="bg-card p-4 rounded-xl border border-gray-800 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-400 text-xs font-bold uppercase">Min Novelty Score</Text>
          <Text className="text-accent font-bold text-xs">{(scoreThreshold * 100).toFixed(0)}%</Text>
        </View>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          value={scoreThreshold}
          onValueChange={setScoreThreshold}
          minimumTrackTintColor="#22D3EE"
          maximumTrackTintColor="#334155"
          thumbTintColor="#fff"
        />
      </View>

      <FlatList
        data={filteredLineages}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.sourceFileId}-${item.cluster_id}-${index}`}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
            <MaterialCommunityIcons name="dna" size={48} color="#334155" />
            <Text className="text-gray-500 mt-4">No lineages found matching criteria.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
