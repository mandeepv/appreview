import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

interface LearningModule {
  id: string;
  icon: string;
  label: string;
  title: string;
  description: string;
  color: string;
}

const learningModules: LearningModule[] = [
  {
    id: '1',
    icon: '❤️',
    label: 'FOUNDATION',
    title: 'Connection First',
    description: 'Learn how to deeply fuel their correcting behavior.',
    color: '#FFE4ED',
  },
  {
    id: '2',
    icon: '🌙',
    label: 'HIGH IMPACT',
    title: 'Sleep Success',
    description: 'Gentle routines for peaceful nights and happier mornings.',
    color: '#FFE4ED',
  },
  {
    id: '3',
    icon: '🗣️',
    label: 'SKILL',
    title: 'Toddler Talk',
    description: 'Magic phrases that diffuse tantrums instantly.',
    color: '#E3F2FF',
  },
  {
    id: '4',
    icon: '🌸',
    label: 'WELLNESS',
    title: "Mom's Calm",
    description: 'Finding your center in the middle of chaos.',
    color: '#F5E6FF',
  },
];

export default function LearnScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What You'll Learn</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationPlaceholder}>
          <Text style={styles.illustrationEmoji}>👩‍👦</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Your Growth Path</Text>
        <Text style={styles.subtitle}>
          Short, 5-minute daily lessons designed for busy moms.
        </Text>
      </View>

      <View style={styles.modulesContainer}>
        {learningModules.map((module) => (
          <View key={module.id} style={styles.moduleCard}>
            <View style={[styles.iconCircle, { backgroundColor: module.color }]}>
              <Text style={styles.moduleIcon}>{module.icon}</Text>
            </View>
            <View style={styles.moduleContent}>
              <Text style={styles.moduleLabel}>{module.label}</Text>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  illustrationContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  illustrationPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5E6D8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modulesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleIcon: {
    fontSize: 24,
  },
  moduleContent: {
    flex: 1,
  },
  moduleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E94B8F',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
