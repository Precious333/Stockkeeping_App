// src/pages/InventoryList.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InventoryItem } from '../types/inventory';
import AddItem from './AddItem';

interface InventoryListProps {
  navigation: any;
  route: any;   // ← FIXED: Needed for openAdd param
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
}

export default function InventoryList({
  navigation,
  route,
  items,
  onAddItem,
}: InventoryListProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  // 🔥 Auto-open AddItem modal when coming from Dashboard
  useEffect(() => {
    if (route?.params?.openAdd) {
      setShowAddModal(true);
    }
  }, [route]);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.addText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* ITEMS LIST */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.detailText}>Qty: {item.quantity}</Text>
            </View>
            <Feather name="chevron-right" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      />

      {/* ADD ITEM POPUP */}
      <AddItem
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newItem) => {
          onAddItem(newItem);
          setShowAddModal(false);
        }}
      />
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
  },

  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  category: {
    color: '#6B7280',
    marginTop: 2,
  },
  detailText: {
    marginTop: 6,
    color: '#4B5563',
  },
});
