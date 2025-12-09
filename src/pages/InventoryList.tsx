// src/pages/InventoryList.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { InventoryItem, getStockLevel, CATEGORIES } from '../types/inventory';
import AddItem from './AddItem';
import { formatPrice } from '../utils/format';

interface InventoryListProps {
  navigation: any;
  route: any;
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
}

const ALL_CATEGORY = 'All';
const FILTER_CATEGORIES = [ALL_CATEGORY, ...CATEGORIES];

export default function InventoryList({
  navigation,
  route,
  items,
  onAddItem,
}: InventoryListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [search, setSearch] = useState('');
  
  // Navigation Params
  const lowStockOnly: boolean = route?.params?.lowStockOnly ?? false;

  // Effects
  useEffect(() => {
    if (route?.params?.openAdd) {
      setShowAddModal(true);
      // Reset param so it doesn't reopen on back nav
      navigation.setParams({ openAdd: false });
    }
    if (lowStockOnly) {
      setSelectedCategory(ALL_CATEGORY);
    }
  }, [route, lowStockOnly]);

  // Filtering Logic
  const filtered = useMemo(() => {
    return items.filter((item) => {
      // 1. Stock Filter
      const computedLevel = item.quantity <= item.minLevel ? 'low' : 'good';
      const passesLowFilter = !lowStockOnly || computedLevel === 'low';

      // 2. Category Filter
      const matchCat = selectedCategory === ALL_CATEGORY || item.category === selectedCategory;
      
      // 3. Search Filter
      const term = search.toLowerCase().trim();
      const matchSearch =
        term.length === 0 ||
        item.name.toLowerCase().includes(term) ||
        (item.sku?.toLowerCase() ?? '').includes(term);

      return passesLowFilter && matchCat && matchSearch;
    });
  }, [items, lowStockOnly, selectedCategory, search]);

  // Render Single Item
  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isLowStock = item.quantity <= item.minLevel;
    const isOutOfStock = item.quantity === 0;

    return (
      <TouchableOpacity
        style={[styles.card, isLowStock && styles.cardLowStock]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
      >
        {/* ICON */}
        <View style={[styles.iconBox, isLowStock && { backgroundColor: '#FEE2E2' }]}>
          <MaterialCommunityIcons 
            name={isOutOfStock ? "package-variant-closed" : "pill"} 
            size={24} 
            color={isLowStock ? "#DC2626" : "#2563EB"} 
          />
        </View>

        {/* DETAILS */}
        <View style={styles.cardContent}>
          <View style={styles.rowTop}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            {isLowStock && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertText}>Low</Text>
              </View>
            )}
          </View>

          <View style={styles.rowMid}>
             <View style={styles.catBadge}>
                <Text style={styles.catText}>{item.category}</Text>
             </View>
          </View>
          
          <View style={styles.rowBot}>
             <Text style={styles.price}>{formatPrice(item.price)}</Text>
             <Text style={[styles.quantity, isOutOfStock && { color: '#9CA3AF' }]}>
                {isOutOfStock ? 'Out of Stock' : `${item.quantity} Qty`}
             </Text>
          </View>
        </View>

        {/* CHEVRON */}
        <Feather name="chevron-right" size={20} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {lowStockOnly ? 'Low Stock Items' : 'Inventory'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            placeholder="Search name or SKU..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
             <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x-circle" size={16} color="#9CA3AF" />
             </TouchableOpacity>
          )}
        </View>

        {/* CATEGORY CHIPS */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {FILTER_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.chip,
                  selectedCategory === cat && styles.chipActive
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === cat && styles.chipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* RESULT COUNT */}
      <View style={styles.listHeader}>
         <Text style={styles.countText}>
           Showing {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
         </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="package" size={48} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters or search</Text>
          </View>
        }
      />

      {/* FLOATING ACTION BUTTON (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setShowAddModal(true)}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ADD ITEM MODAL */}
      <AddItem
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(item) => {
          onAddItem(item);
          setShowAddModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* HEADER SECTION */
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  /* SEARCH */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
  },

  /* CHIPS */
  chipsContainer: { height: 38 },
  chipsScroll: { paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  chipTextActive: { color: '#2563EB', fontWeight: '600' },

  /* LIST Styles */
  listHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  countText: { fontSize: 13, color: '#6B7280' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  /* CARD */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardLowStock: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: { flex: 1, marginRight: 8 },
  
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    maxWidth: '80%',
  },
  alertBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  rowMid: { marginBottom: 6 },
  catBadge: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },

  rowBot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: { fontSize: 14, fontWeight: '700', color: '#059669' },
  quantity: { fontSize: 13, fontWeight: '600', color: '#4B5563' },

  /* EMPTY STATE */
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});