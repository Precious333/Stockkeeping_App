// src/pages/Dashboard.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { InventoryItem, getStockLevel } from '../types/inventory';
import { formatPrice } from '../utils/format';

export default function Dashboard({ navigation, items }) {
  const totalItems = items.length;

  const lowStockItems = items.filter(
    (item) => getStockLevel(item.quantity, item.minLevel) === 'low'
  );

  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * (item.price ?? 0),
    0
  );

  const recentActivity = items
    .flatMap((item) =>
      item.history?.map((h) => ({
        ...h,
        itemName: item.name,
        itemId: item.id,
      })) ?? []
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Dashboard</Text>

        {/* FIXED BUTTON */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Inventory', { openAdd: true })}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="package-variant" size={20} color="#2563EB" />
          <Text style={styles.statLabel}>Total Items</Text>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>{totalItems}</Text>
        </View>

        <View style={styles.statCard}>
          <Feather name="alert-triangle" size={20} color="#DC2626" />
          <Text style={styles.statLabel}>Low Stock</Text>
          <Text style={[styles.statValue, { color: '#DC2626' }]}>
            {lowStockItems.length}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#16A34A' }}>₦</Text>
          <Text style={styles.statLabel}>Total Value</Text>
          <Text style={[styles.statValue, { color: '#16A34A' }]}>
            {formatPrice(totalValue)}
          </Text>
        </View>
      </View>

      {/* RECENT ACTIVITY */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Feather name="trending-up" size={20} color="#374151" />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {recentActivity.length ? (
          recentActivity.map((act) => (
            <View key={act.id} style={styles.activityRow}>
              <View
                style={[
                  styles.activityIcon,
                  {
                    backgroundColor:
                      act.type === 'add' ? '#ECFDF5' : '#FEF2F2',
                  },
                ]}
              >
                <Feather
                  name={act.type === 'add' ? 'plus' : 'alert-triangle'}
                  size={16}
                  color={act.type === 'add' ? '#16A34A' : '#DC2626'}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>
                  {act.type === 'add' ? 'Added' : 'Removed'} {act.quantity} units
                </Text>
                <Text style={styles.activityItem}>{act.itemName}</Text>
                <Text style={styles.activityReason}>{act.reason}</Text>
              </View>

              <Text style={styles.activityDate}>
                {new Date(act.date).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No activity yet</Text>
        )}
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Inventory')}
        >
          <MaterialCommunityIcons name="package-variant" size={24} color="#2563EB" />
          <Text style={styles.quickTitle}>Inventory List</Text>
          <Text style={styles.quickText}>View all items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Inventory', { openAdd: true })}
        >
          <Feather name="plus" size={24} color="#16A34A" />
          <Text style={styles.quickTitle}>Add New Item</Text>
          <Text style={styles.quickText}>Register new stock</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#fff',
    padding: 14,
    width: '48%',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statLabel: { color: '#6B7280', fontSize: 12, marginTop: 6 },
  statValue: { fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 20,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginLeft: 6 },
  activityRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityIcon: { padding: 8, borderRadius: 10, marginRight: 10 },
  activityTitle: { fontWeight: '700', fontSize: 14 },
  activityItem: { color: '#6B7280', fontSize: 13 },
  activityReason: { color: '#9CA3AF', fontSize: 12 },
  activityDate: { fontSize: 11, color: '#6B7280' },
  empty: { textAlign: 'center', padding: 16, color: '#6B7280' },
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  quickAction: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickTitle: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  quickText: { fontSize: 13, color: '#6B7280', marginTop: 4 },
});
