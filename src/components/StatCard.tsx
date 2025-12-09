// src/components/StatCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: keyof typeof Feather.glyphMap; // This ensures you only use valid icon names
  color?: 'blue' | 'red' | 'green' | 'yellow';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({
  label,
  value,
  iconName,
  color = 'blue',
  trend
}: StatCardProps) {
  
  const getTheme = () => {
    switch (color) {
      case 'red': return { bg: '#FEF2F2', text: '#DC2626' };
      case 'green': return { bg: '#ECFDF5', text: '#059669' };
      case 'yellow': return { bg: '#FFFBEB', text: '#D97706' };
      default: return { bg: '#EFF6FF', text: '#2563EB' }; // blue
    }
  };

  const theme = getTheme();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
          
          {trend && (
            <Text style={[
              styles.trend, 
              { color: trend.isPositive ? '#16A34A' : '#DC2626' }
            ]}>
              {trend.value}
            </Text>
          )}
        </View>

        <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
          <Feather name={iconName} size={20} color={theme.text} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  trend: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});