// src/pages/SalesScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InventoryItem } from '../types/inventory';
import { formatPrice } from '../utils/format';

interface Props {
  navigation: any;
  items: InventoryItem[];
}

export default function SalesScreen({ navigation, items }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper to check if two dates are the same day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // 1. EXTRACT SALES DATA
  const salesData = useMemo(() => {
    const sales: any[] = [];

    items.forEach((item) => {
      if (item.history) {
        item.history.forEach((h) => {
          // Filter for "remove" type and "Sale" reason
          const isSale = h.type === 'remove' && h.reason?.includes('Sale');
          const isDateMatch = isSameDay(new Date(h.date), selectedDate);

          if (isSale && isDateMatch) {
            sales.push({
              id: h.id,
              itemName: item.name,
              quantity: h.quantity,
              // Note: This uses current price. If price changed, history might be slightly off 
              // unless we store historical price in history log (future improvement).
              unitPrice: item.price, 
              total: h.quantity * (item.price || 0),
              time: new Date(h.date),
            });
          }
        });
      }
    });

    // Sort by time (newest first)
    return sales.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [items, selectedDate]);

  // 2. CALCULATE TOTALS
  const totalRevenue = salesData.reduce((sum, s) => sum + s.total, 0);
  const totalItemsSold = salesData.reduce((sum, s) => sum + s.quantity, 0);

  const renderSaleRow = ({ item }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.timeText}>
          {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.itemDetail}>
            {item.quantity} x {formatPrice(item.unitPrice)}
          </Text>
        </View>
      </View>
      <Text style={styles.rowTotal}>{formatPrice(item.total)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Report</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* DATE PICKER STRIP */}
      <View style={styles.dateStrip}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.arrowBtn}>
          <Feather name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.dateDisplay}>
          <Feather name="calendar" size={16} color="#6B7280" style={{ marginRight: 8 }} />
          <Text style={styles.dateText}>
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Today" 
              : selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => changeDate(1)} 
          style={[styles.arrowBtn, isSameDay(selectedDate, new Date()) && styles.disabledArrow]}
          disabled={isSameDay(selectedDate, new Date())}
        >
          <Feather name="chevron-right" size={24} color={isSameDay(selectedDate, new Date()) ? "#D1D5DB" : "#374151"} />
        </TouchableOpacity>
      </View>

      {/* SUMMARY CARDS */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, styles.greenCard]}>
          <Text style={styles.cardLabel}>Total Revenue</Text>
          <Text style={styles.cardValue}>{formatPrice(totalRevenue)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Transactions</Text>
          <Text style={[styles.cardValue, { color: '#111827' }]}>{salesData.length}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Items Sold</Text>
          <Text style={[styles.cardValue, { color: '#111827' }]}>{totalItemsSold}</Text>
        </View>
      </View>

      {/* TRANSACTIONS LIST */}
      <Text style={styles.sectionTitle}>Transactions</Text>
      
      <FlatList
        data={salesData}
        keyExtractor={(item) => item.id}
        renderItem={renderSaleRow}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="bar-chart-2" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No sales recorded for this date.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  dateStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateDisplay: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  arrowBtn: { padding: 8 },
  disabledArrow: { opacity: 0.3 },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  greenCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7' },
  cardLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  cardValue: { fontSize: 16, fontWeight: '700', color: '#16A34A' },

  sectionTitle: { marginLeft: 16, marginTop: 8, marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#6B7280' },
  
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 12, color: '#9CA3AF', marginRight: 12, width: 40 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemDetail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rowTotal: { fontSize: 15, fontWeight: '700', color: '#111827' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 14 },
});