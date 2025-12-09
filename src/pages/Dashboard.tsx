// src/pages/Dashboard.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InventoryItem, getStockLevel } from '../types/inventory';

interface DashboardProps {
  navigation: any;
  items: InventoryItem[];
  onLogout: () => void; // <--- Received from App.tsx
}

export default function Dashboard({ navigation, items, onLogout }: DashboardProps) {
  const insets = useSafeAreaInsets();
  const totalItems = items.length;

  const lowStockItems = items.filter(
    (item) => getStockLevel(item.quantity, item.minLevel) === 'low'
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: insets.top + 20, 
            paddingBottom: insets.bottom + 20 
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* HEADER TEXT & LOGOUT */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.headerTitle}>Overview</Text>
          </View>
          
          {/* Integrated Logout Button */}
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={onLogout}
          >
            <Feather name="log-out" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* SUMMARY STATS (2 Columns) */}
        <View style={styles.statsRow}>
          {/* TOTAL ITEMS */}
          <View style={[styles.statCard, styles.shadow]}>
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="cube-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>

          {/* LOW STOCK */}
          <TouchableOpacity 
            style={[styles.statCard, styles.shadow, { borderColor: '#FECACA', borderWidth: 1 }]}
            onPress={() => navigation.navigate('Inventory', { lowStockOnly: true })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
              <Feather name="alert-triangle" size={24} color="#DC2626" />
            </View>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{lowStockItems.length}</Text>
            <Text style={styles.statLabel}>Low Stock Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS GRID */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          
          {/* POS SALE */}
          <TouchableOpacity
            style={[styles.actionCard, styles.shadow]}
            onPress={() => navigation.navigate('Products')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
              <Feather name="shopping-cart" size={26} color="#EA580C" />
            </View>
            <Text style={styles.actionTitle}>POS Sale</Text>
            <Text style={styles.actionDesc}>New Order</Text>
          </TouchableOpacity>

          {/* INVENTORY */}
          <TouchableOpacity
            style={[styles.actionCard, styles.shadow]}
            onPress={() => navigation.navigate('Inventory')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="list" size={26} color="#2563EB" />
            </View>
            <Text style={styles.actionTitle}>Inventory</Text>
            <Text style={styles.actionDesc}>Manage Items</Text>
          </TouchableOpacity>

          {/* SALES REPORTS */}
          <TouchableOpacity
            style={[styles.actionCard, styles.shadow]}
            onPress={() => navigation.navigate('Sales')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F5F3FF' }]}>
              <Feather name="pie-chart" size={26} color="#7C3AED" />
            </View>
            <Text style={styles.actionTitle}>Reports</Text>
            <Text style={styles.actionDesc}>View Sales</Text>
          </TouchableOpacity>

          {/* ADD ITEM */}
          <TouchableOpacity
            style={[styles.actionCard, styles.shadow]}
            onPress={() => navigation.navigate('Inventory', { openAdd: true })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="plus-square" size={26} color="#059669" />
            </View>
            <Text style={styles.actionTitle}>Add Item</Text>
            <Text style={styles.actionDesc}>Restock</Text>
          </TouchableOpacity>

        </View>

        {/* RECENT ACTIVITY */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.activityCard, styles.shadow]}>
            {recentActivity.length > 0 ? (
              recentActivity.map((act, index) => {
                const isLast = index === recentActivity.length - 1;
                const isAdd = act.type === 'add';
                return (
                  <View key={act.id + index}>
                    <View style={styles.actRow}>
                      <View style={[styles.actDot, { backgroundColor: isAdd ? '#10B981' : '#EF4444' }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.actText}>
                          <Text style={{ fontWeight: '700' }}>
                            {isAdd ? 'Restocked' : 'Sold'}
                          </Text>{' '}
                          {act.quantity} units of {act.itemName}
                        </Text>
                        <Text style={styles.actDate}>
                          {new Date(act.date).toLocaleDateString()} • {act.reason || 'Update'}
                        </Text>
                      </View>
                    </View>
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent activity</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  scrollContent: {
    padding: 20,
    // paddingTop is now handled dynamically via insets in the component
  },

  /* HEADER CONTENT */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  
  logoutBtn: {
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  /* STATS */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24, 
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12, 
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, 
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  /* ACTIONS GRID */
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12, 
    marginBottom: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, 
  },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  actionDesc: { fontSize: 12, color: '#9CA3AF' },

  /* ACTIVITY */
  activitySection: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
  },
  actRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  actDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  actText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  actDate: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 32 },
  
  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#9CA3AF' },

  /* COMMON SHADOW */
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});