// src/pages/AddItem.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../types/inventory';
import { nanoid } from 'nanoid/non-secure';
import { formatPrice } from '../utils/format';

interface AddItemProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
}

export default function AddItem({ visible, onClose, onSave }: AddItemProps) {
  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>(CATEGORIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [quantity, setQuantity] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');

  // Reset form
  useEffect(() => {
    if (visible) {
      setName('');
      setCategory(CATEGORIES[0]);
      setQuantity('');
      setMinLevel('');
      setPrice('');
      setLocation('');
      setDropdownOpen(false);
    }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim() || !quantity || !minLevel || !price) return;

    const newItem = {
      id: nanoid(),
      name: name.trim(),
      category,
      quantity: Number(quantity),
      minLevel: Number(minLevel),
      price: Number(price),
      location: location.trim(),
      history: [],
    };

    onSave(newItem);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.center}>
          <View style={styles.card}>

            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Add Item</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* FORM */}
            <ScrollView style={{ maxHeight: 430 }} showsVerticalScrollIndicator={false}>
              <View style={styles.form}>

                {/* NAME */}
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter name"
                  value={name}
                  onChangeText={setName}
                />

                {/* CATEGORY */}
                <Text style={styles.label}>Category</Text>

                <View style={{ zIndex: 2000 }}>
                  <TouchableOpacity
                    style={[styles.input, styles.dropdownTrigger]}
                    onPress={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <Text>{category}</Text>
                    <Feather
                      name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#374151"
                    />
                  </TouchableOpacity>

                  {dropdownOpen && (
                    <View style={styles.dropdown}>
                      <ScrollView>
                        {CATEGORIES.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[
                              styles.dropdownItem,
                              category === cat && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setCategory(cat);
                              setDropdownOpen(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownText,
                                category === cat && styles.dropdownTextActive,
                              ]}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* QUANTITY */}
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />

                {/* MIN LEVEL */}
                <Text style={styles.label}>Minimum Level</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={minLevel}
                  onChangeText={setMinLevel}
                />

                {/* PRICE */}
                <Text style={styles.label}>Price</Text>

                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />

                  <Text style={styles.pricePreview}>
                    {formatPrice(Number(price || 0))}
                  </Text>
                </View>

                {/* LOCATION */}
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Shelf A, Box 02..."
                  value={location}
                  onChangeText={setLocation}
                />

              </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save Item</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ========= STYLES ========= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'visible', // IMPORTANT: allows dropdown to expand outside
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  form: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },

  label: {
    marginTop: 14,
    color: '#374151',
    fontWeight: '600',
  },

  input: {
    marginTop: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 10,
  },

  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    maxHeight: 250,
    zIndex: 9999,
    elevation: 10,
  },

  dropdownItem: {
    padding: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownText: {
    color: '#111827',
  },
  dropdownTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  pricePreview: {
    marginTop: 4,
    color: '#6B7280',
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
