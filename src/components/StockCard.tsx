// src/components/StockCard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { InventoryItem, getStockLevel } from '../types/inventory';

interface StockCardProps {
  item: InventoryItem;
  onPress?: () => void;
}

export default function StockCard({ item, onPress }: StockCardProps) {
  const minLevel = item.minLevel; // fixed
  const stockLevel = getStockLevel(item.quantity, minLevel);

  const config = {
    low: {
      textColor: '#B91C1C',
      bgColor: '#FEF2F2',
      label: 'Low Stock',
      icon: <Feather name="alert-triangle" size={16} color="#B91C1C" />,
    },
    medium: {
      textColor: '#B45309',
      bgColor: '#FFFBEB',
      label: 'Medium',
      icon: (
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={16}
          color="#B45309"
        />
      ),
    },
    good: {
      textColor: '#15803D',
      bgColor: '#F0FDF4',
      label: 'In Stock',
      icon: (
        <MaterialCommunityIcons
          name="package-variant-closed"
          size={16}
          color="#15803D"
        />
      ),
    },
  }[stockLevel];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.sku}>SKU: {item.sku}</Text>

          <View style={styles.tagsRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: config.bgColor },
              ]}
            >
              <Text style={[styles.statusText, { color: config.textColor }]}>
                {config.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.right}>
          <View style={styles.qtyRow}>
            {config.icon}
            <Text style={styles.quantity}>{item.quantity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  left: { flex: 1, paddingRight: 10 },
  title: { fontSize: 16, fontWeight: '600' },
  sku: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: { fontSize: 12, color: '#4B5563' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  quantity: { marginLeft: 6, fontSize: 18, fontWeight: '700' },
});
