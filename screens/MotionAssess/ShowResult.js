import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const ShowResult = ({ 
  evaluationScore, 
  frameScores, 
  worstFrames, 
  onReset 
}) => {
  return (
    <ScrollView style={styles.resultsContainer} contentContainerStyle={styles.resultsContent}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>动作评估得分</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{evaluationScore}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <Text style={styles.scoreDescription}>
          {evaluationScore >= 90 ? "优秀" : evaluationScore >= 80 ? "良好" : "需要改进"}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>每帧得分</Text>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContent}
        >
          <LineChart
            data={{
              labels: ["January", "February", "March", "April", "May", "June"],
              datasets: [
                {
                  data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100
                  ]
                }
              ]
            }}
            width={Math.max(width - 40, frameScores.length * 50)}
            height={220}
            yAxisLabel="$"
            yAxisSuffix="k"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#3b82f6",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </ScrollView>
      </View>

      <View style={styles.worstFramesContainer}>
        <Text style={styles.worstFramesTitle}>需要改进的动作帧</Text>
        <View style={styles.worstFramesGrid}>
          {worstFrames.map((frame, index) => (
            <View key={index} style={styles.worstFrameItem}>
              <View style={styles.worstFrameInfo}>
                <Text style={styles.worstFrameNumber}>帧 {frame.frame}</Text>
                <Text style={styles.worstFrameScore}>得分: {frame.score}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>重新选择</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultsContent: {
    paddingBottom: 30,
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  scoreMax: {
    fontSize: 16,
    color: "#64748b",
  },
  scoreDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3b82f6",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  chartScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
    textAlign: 'center',
  },
  worstFramesContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  worstFramesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
  },
  worstFramesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  worstFrameItem: {
    width: "30%",
    marginBottom: 15,
  },
  worstFrameInfo: {
    alignItems: "center",
  },
  worstFrameNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  worstFrameScore: {
    fontSize: 12,
    color: "#64748b",
  },
  resetButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ShowResult;