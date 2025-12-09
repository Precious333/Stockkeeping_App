// src/pages/ItemDetail.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { InventoryItem, getStockLevel } from '../types/inventory';
import StockAdjustModal from '../components/StockAdjustModal';
import EditItemModal from '../components/EditItemModal';
import { formatPrice } from '../utils/format';

interface ItemDetailProps {
  navigation: any;
  route: any;
  items: InventoryItem[];
  onUpdate: (item: InventoryItem, fromEditScreen?: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ItemDetail({
  navigation,
  route,
  items,
  onUpdate,
  onDelete,
}: ItemDetailProps) {
  const { id } = route.params;
  const item = items.find((i) => i.id === id);

  const [showAdjust, setShowAdjust] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!item) return null;

  // STOCK LEVEL LOGIC
  const stockLevel = getStockLevel(item.quantity, item.minLevel);
  const isLowStock = stockLevel === 'low';
  const isOutOfStock = item.quantity <= 0;

  // Dynamic Colors based on stock
  const statusColor = isOutOfStock
    ? '#9CA3AF'
    : isLowStock
    ? '#DC2626'
    : '#16A34A';

  const statusBg = isOutOfStock
    ? '#F3F4F6'
    : isLowStock
    ? '#FEF2F2'
    : '#F0FDF4';

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => onDelete(item.id) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER NAV */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Item Details</Text>
        <TouchableOpacity onPress={() => setShowEdit(true)} style={styles.editIconBtn}>
          <Feather name="edit-2" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.iconBox}>
             <MaterialCommunityIcons 
               name={isOutOfStock ? "package-variant-closed" : "pill"} 
               size={32} 
               color="#2563EB" 
             />
          </View>
          
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.sku}>SKU: {item.sku || 'N/A'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{item.category}</Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
              </Text>
            </View>
          </View>
        </View>

        {/* STATS GRID */}
        <View style={styles.gridContainer}>
          {/* Price */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Unit Price</Text>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>{formatPrice(item.price)}</Text>
            <Feather name="tag" size={16} color="#A7F3D0" style={styles.statIcon} />
          </View>

          {/* Quantity */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Quantity</Text>
            <Text style={styles.statValue}>{item.quantity}</Text>
            <Feather name="layers" size={16} color="#BFDBFE" style={styles.statIcon} />
          </View>

          {/* Min Level */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Min Level</Text>
            <Text style={styles.statValue}>{item.minLevel}</Text>
            <Feather name="alert-circle" size={16} color="#FECACA" style={styles.statIcon} />
          </View>

          {/* Total Value */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={[styles.statValue, { fontSize: 16 }]}>{formatPrice(item.price * item.quantity)}</Text>
            <Feather name="dollar-sign" size={16} color="#E5E7EB" style={styles.statIcon} />
          </View>
        </View>

        {/* LOCATION / INFO */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{item.location || 'Not assigned'}</Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.adjustBtn} 
            onPress={() => setShowAdjust(true)}
          >
            <Feather name="sliders" size={18} color="#fff" />
            <Text style={styles.adjustBtnText}>Adjust Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* HISTORY TIMELINE */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History Log</Text>
          
          {item.history?.length ? (
            item.history.map((h, index) => {
              const isLast = index === (item.history?.length || 0) - 1;
              const isAdd = h.type === 'add';
              const isRemove = h.type === 'remove';
              
              return (
                <View key={h.id} style={styles.timelineRow}>
                  {/* Left Line & Dot */}
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot, 
                      { backgroundColor: isAdd ? '#10B981' : isRemove ? '#EF4444' : '#3B82F6' }
                    ]} />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Content */}
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineType}>
                        {isAdd ? 'Stock Added' : isRemove ? 'Stock Removed' : 'Edited'}
                      </Text>
                      <Text style={styles.timelineDate}>
                        {new Date(h.date).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <Text style={styles.timelineDesc}>
                       {isAdd ? '+' : isRemove ? '-' : ''}{h.quantity} units • {h.reason || 'No reason'}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={{ color: '#9CA3AF' }}>No history records yet.</Text>
            </View>
          )}
        </View>
        
        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODALS */}
      <StockAdjustModal
        visible={showAdjust}
        itemName={item.name}
        currentStock={item.quantity}
        onClose={() => setShowAdjust(false)}
        onAdjust={(type, qty, reason) => {
          const updated: InventoryItem = {
            ...item,
            quantity: type === 'add'
              ? item.quantity + qty
              : Math.max(0, item.quantity - qty),
            history: [
              {
                id: String(Date.now()),
                date: new Date().toISOString(),
                type,
                quantity: qty,
                reason,
                previousQuantity: item.quantity,
                newQuantity: type === 'add' ? item.quantity + qty : item.quantity - qty,
              },
              ...(item.history ?? []),
            ],
          };
          onUpdate(updated);
        }}
      />

      <EditItemModal
        visible={showEdit}
        item={item}
        onClose={() => setShowEdit(false)}
        onSave={(updated) => {
          onUpdate(updated, true);
          setShowEdit(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  /* NAV BAR */
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 8 },
  navTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  editIconBtn: { padding: 8, backgroundColor: '#EFF6FF', borderRadius: 8 },

  scrollContent: { padding: 16 },

  /* HERO CARD */
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  sku: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  catBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  catText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },

  /* STATS GRID */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  statLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statIcon: { position: 'absolute', right: 10, bottom: 10, opacity: 0.5 },

  /* INFO CARD */
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#6B7280', marginLeft: 8, marginRight: 8 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  /* ACTIONS */
  actionRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  adjustBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  adjustBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 },
  
  deleteBtn: {
    width: 50,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  /* HISTORY TIMELINE */
  historySection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, color: '#111827' },
  
  timelineRow: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', marginRight: 12, width: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, zIndex: 2 },
  timelineLine: {
    width: 2,
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    top: 10,
    bottom: -30, // extend to next dot
    zIndex: 1,
  },
  timelineContent: { flex: 1 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  timelineType: { fontSize: 14, fontWeight: '600', color: '#374151' },
  timelineDate: { fontSize: 12, color: '#9CA3AF' },
  timelineDesc: { fontSize: 13, color: '#6B7280' },

  emptyHistory: { alignItems: 'center', paddingVertical: 10 },
});