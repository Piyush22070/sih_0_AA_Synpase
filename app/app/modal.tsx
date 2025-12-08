import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { predictSequence } from '../api/api';

export default function QuickPredictModal() {
  const [sequence, setSequence] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!sequence.trim()) {
      setError('Please enter a DNA sequence');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await predictSequence(sequence.trim());
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze sequence. Please check your input and connection.');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSequence('');
    setResult(null);
    setError(null);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      
      <View className="p-4 border-b border-gray-800 bg-card">
        <Text className="text-xl font-bold text-white text-center">Quick Sequence Analysis</Text>
        <Text className="text-gray-400 text-xs text-center">Real-time AI Classification</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          
          <View className="bg-card p-4 rounded-xl border border-gray-800 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white font-medium">Input DNA Sequence</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text className="text-accent text-xs">Clear</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="bg-background text-white p-3 rounded-lg h-32 text-sm font-mono border border-gray-700"
              multiline
              placeholder="Paste raw sequence (ATGC...)"
              placeholderTextColor="#64748B"
              value={sequence}
              onChangeText={setSequence}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text className="text-gray-500 text-xs mt-2 text-right">
              Length: {sequence.length} bp
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePredict}
            disabled={loading || !sequence}
            className={`p-4 rounded-xl items-center mb-6 ${
              loading || !sequence ? 'bg-gray-700' : 'bg-accent'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#0B1121" />
            ) : (
              <Text className={`font-bold text-lg ${
                loading || !sequence ? 'text-gray-400' : 'text-background'
              }`}>Analyze Sequence</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View className="bg-red-900/20 border border-red-900 p-4 rounded-xl mb-6">
              <View className="flex-row items-center mb-1">
                <Ionicons name="alert-circle" size={20} color="#F87171" />
                <Text className="text-red-400 font-bold ml-2">Analysis Failed</Text>
              </View>
              <Text className="text-red-300 text-sm">{error}</Text>
            </View>
          )}

          {result && (
            <View className="bg-card rounded-xl border border-gray-800 overflow-hidden mb-8">
              <View className="bg-green-900/20 p-4 border-b border-gray-800 flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#4ADE80" />
                <Text className="text-green-400 font-bold text-lg ml-2">Analysis Complete</Text>
              </View>
              
              <View className="p-4">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-gray-400">Sequence Length</Text>
                  <Text className="text-white font-mono">{result.sequence_length}</Text>
                </View>

                <View className="h-[1px] bg-gray-800 mb-4" />

                <Text className="text-white font-bold mb-3">Prediction Results</Text>

                <View className="flex-row justify-between mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-500 text-xs mb-1">Predicted Class</Text>
                    <Text className="text-accent font-bold text-lg">{result.prediction?.class}</Text>
                    <Text className="text-green-400 text-xs">
                      {(result.prediction?.class_prob * 100).toFixed(2)}% Confidence
                    </Text>
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-gray-500 text-xs mb-1">Predicted Genus</Text>
                    <Text className="text-white font-bold text-lg">{result.prediction?.genus}</Text>
                    <Text className="text-green-400 text-xs">
                      {(result.prediction?.genus_prob * 100).toFixed(2)}% Confidence
                    </Text>
                  </View>
                </View>

                <View className="bg-background p-3 rounded-lg border border-gray-700">
                  <Text className="text-gray-400 text-xs mb-1">AI Model Output</Text>
                  <Text className="text-gray-500 text-xs font-mono">
                    {JSON.stringify(result.prediction, null, 2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
