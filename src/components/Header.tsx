// src/components/Header.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  showBack?: boolean; // optional back arrow
  onBack?: () => void;
  action?: React.ReactNode; // optional right-side button
}

export default function Header({
  title,
  showBack = false,
  onBack,
  action,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {/* LEFT: Back button or spacer */}
      {showBack ? (
        <TouchableOpacity onPress={onBack}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} /> // keeps the title centered
      )}

      {/* CENTER: Title */}
      <Text style={styles.title}>{title}</Text>

      {/* RIGHT: Optional action button or spacer */}
      {action ? action : <View style={{ width: 24 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});
