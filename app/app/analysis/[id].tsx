import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSample } = useStore();
  const sample = getSample(id);

  if (!sample) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-white">Sample not found</Text>
      </SafeAreaView>
    );
  }

  const analysis = sample.latestAnalysis || {};
  const results = analysis.results || [];
  const totalSequences = analysis.count || analysis.total_sequences || 0;

  // Calculate Analytics
  const analytics = useMemo(() => {
    if (!results.length) return null;

    const classCounts: Record<string, number> = {};
    let highConf = 0;
    let medConf = 0;
    let lowConf = 0;
    let novelCount = 0;

    results.forEach((r: any) => {
      // Taxonomy
      const cls = r.prediction?.class || 'Unknown';
      classCounts[cls] = (classCounts[cls] || 0) + 1;

      // Confidence
      const prob = r.prediction?.class_prob || 0;
      if (prob > 0.9) highConf++;
      else if (prob > 0.7) medConf++;
      else {
        lowConf++;
        novelCount++; // Treat low confidence as potential novel
      }
    });

    const sortedClasses = Object.entries(classCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / results.length) * 100
      }));

    return {
      classes: sortedClasses,
      novelCount,
      confidence: {
        high: (highConf / results.length) * 100,
        medium: (medConf / results.length) * 100,
        low: (lowConf / results.length) * 100
      }
    };
  }, [results]);

  const renderPredictionItem = ({ item, index }: { item: any, index: number }) => {
    const isNovel = (item.prediction?.class_prob || 0) < 0.7;
    
    return (
      <View className={`bg-card p-4 rounded-xl border mb-3 ${isNovel ? 'border-purple-500/50' : 'border-gray-800'}`}>
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-lg mr-2">{item.header || `Sequence ${index + 1}`}</Text>
            {isNovel && (
              <View className="bg-purple-900/50 px-2 py-0.5 rounded border border-purple-500/30">
                <Text className="text-purple-300 text-[10px] font-bold">NOVEL?</Text>
              </View>
            )}
          </View>
          <View className={`${isNovel ? 'bg-purple-900/30' : 'bg-green-900/30'} px-2 py-1 rounded-md`}>
            <Text className={`${isNovel ? 'text-purple-400' : 'text-green-400'} text-xs font-bold`}>
              {(item.prediction?.class_prob * 100).toFixed(1)}% Conf.
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-gray-500 text-xs">Class</Text>
            <Text className="text-accent font-medium">{item.prediction?.class || 'Unknown'}</Text>
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Genus</Text>
            <Text className="text-white font-medium">{item.prediction?.genus || 'Unknown'}</Text>
          </View>
        </View>

        <View className="mt-2 pt-2 border-t border-gray-800">
           <Text className="text-gray-500 text-xs">Sequence Length: <Text className="text-gray-300">{item.sequence_length}</Text></Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: 'Analysis Results',
        headerStyle: { backgroundColor: '#0B1121' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        ),
      }} />
      
      <FlatList
        data={results}
        renderItem={renderPredictionItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-3xl font-bold text-white">Predictions</Text>
                <Text className="text-gray-500">Based on AI Model v2.1</Text>
              </View>
              <View className="bg-card px-4 py-2 rounded-xl border border-gray-800 items-center">
                <Text className="text-gray-400 text-xs">Total Sequences</Text>
                <Text className="text-white font-bold text-xl">{totalSequences}</Text>
              </View>
            </View>

            {analytics && (
              <>
                {/* Novelty Alert */}
                {analytics.novelCount > 0 && (
                  <View className="bg-purple-900/20 border border-purple-500/50 p-4 rounded-xl mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                        <MaterialCommunityIcons name="dna" size={24} color="#D8B4FE" />
                      </View>
                      <View>
                        <Text className="text-white font-bold text-lg">Potential Novel Species</Text>
                        <Text className="text-purple-200 text-xs">
                          {analytics.novelCount} sequences have low confidence scores.
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity className="bg-purple-600 px-3 py-2 rounded-lg">
                      <Text className="text-white font-bold text-xs">Review</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Taxonomy Distribution Chart */}
                <View className="bg-card p-4 rounded-xl border border-gray-800 mb-4">
                  <Text className="text-white font-bold mb-4">Taxonomy Distribution (Top 5)</Text>
                  {analytics.classes.map((cls, i) => (
                    <View key={i} className="mb-3">
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-300 text-xs font-medium">{cls.name}</Text>
                        <Text className="text-gray-400 text-xs">{cls.percentage.toFixed(1)}%</Text>
                      </View>
                      <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <View 
                          className="h-full bg-accent rounded-full" 
                          style={{ width: `${cls.percentage}%` }} 
                        />
                      </View>
                    </View>
                  ))}
                </View>

                {/* Confidence Quality Chart */}
                <View className="bg-card p-4 rounded-xl border border-gray-800 mb-4">
                  <Text className="text-white font-bold mb-4">Model Confidence</Text>
                  <View className="flex-row h-4 rounded-full overflow-hidden mb-2">
                    <View className="bg-green-500 h-full" style={{ width: `${analytics.confidence.high}%` }} />
                    <View className="bg-yellow-500 h-full" style={{ width: `${analytics.confidence.medium}%` }} />
                    <View className="bg-red-500 h-full" style={{ width: `${analytics.confidence.low}%` }} />
                  </View>
                  <View className="flex-row justify-between">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                      <Text className="text-gray-400 text-xs">High ({analytics.confidence.high.toFixed(0)}%)</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                      <Text className="text-gray-400 text-xs">Med ({analytics.confidence.medium.toFixed(0)}%)</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                      <Text className="text-gray-400 text-xs">Low ({analytics.confidence.low.toFixed(0)}%)</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
            
            <Text className="text-white font-bold text-lg mt-2 mb-2">Detailed Results</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
            <Text className="text-gray-500">No predictions available yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
