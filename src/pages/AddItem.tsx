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
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CATEGORIES } from '../types/inventory';
import { nanoid } from 'nanoid/non-secure';
import { formatPrice } from '../utils/format';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddItemProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
}

export default function AddItem({ visible, onClose, onSave }: AddItemProps) {
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>(CATEGORIES[0]);
  const [quantity, setQuantity] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');

  // UI State
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Reset when opening
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
    if (!name.trim() || !quantity || !minLevel || !price) {
      alert("Please fill in all required fields (Name, Qty, Min Level, Price)");
      return;
    }

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* STOP PROPAGATION ON CARD CLICK */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <View style={styles.sheetContainer}>
                {/* DRAG HANDLE */}
                <View style={styles.dragHandle} />

                {/* HEADER */}
                <View style={styles.header}>
                  <Text style={styles.title}>Add New Item</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Feather name="x" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* --- NAME INPUT --- */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Item Name <Text style={styles.req}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="box" size={18} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. Doxy Gen 200mg"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                      />
                    </View>
                  </View>

                  {/* --- CATEGORY SELECT --- */}
                  <View style={[styles.inputGroup, { zIndex: 20 }]}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                      style={[styles.inputWrapper, styles.dropdownTrigger]}
                      onPress={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="shape-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                        <Text style={styles.inputText}>{category}</Text>
                      </View>
                      <Feather name={dropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
                    </TouchableOpacity>

                    {/* DROPDOWN LIST */}
                    {dropdownOpen && (
                      <View style={styles.dropdownList}>
                        <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                          {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                              key={cat}
                              style={[
                                styles.dropdownItem,
                                category === cat && styles.dropdownItemActive
                              ]}
                              onPress={() => {
                                setCategory(cat);
                                setDropdownOpen(false);
                              }}
                            >
                              <Text style={[
                                styles.dropdownItemText,
                                category === cat && styles.dropdownItemTextActive
                              ]}>{cat}</Text>
                              {category === cat && <Feather name="check" size={16} color="#2563EB" />}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* --- ROW: QUANTITY & MIN LEVEL --- */}
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.label}>Quantity <Text style={styles.req}>*</Text></Text>
                      <View style={styles.inputWrapper}>
                        <Feather name="layers" size={18} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="0"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={quantity}
                          onChangeText={setQuantity}
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Min Level <Text style={styles.req}>*</Text></Text>
                      <View style={styles.inputWrapper}>
                        <Feather name="alert-circle" size={18} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="5"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={minLevel}
                          onChangeText={setMinLevel}
                        />
                      </View>
                    </View>
                  </View>

                  {/* --- PRICE --- */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Unit Price (₦) <Text style={styles.req}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                      <Text style={[styles.inputIcon, { fontSize: 16, fontWeight: '700', color: '#9CA3AF' }]}>₦</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                      />
                    </View>
                    {price ? (
                      <Text style={styles.helperText}>Preview: {formatPrice(Number(price))}</Text>
                    ) : null}
                  </View>

                  {/* --- LOCATION --- */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Storage Location</Text>
                    <View style={styles.inputWrapper}>
                      <Feather name="map-pin" size={18} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. Shelf A, Row 3"
                        placeholderTextColor="#9CA3AF"
                        value={location}
                        onChangeText={setLocation}
                      />
                    </View>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* FOOTER BUTTON */}
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save Item</Text>
                    <Feather name="check-circle" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    height: SCREEN_HEIGHT * 0.85, // Takes up 85% of screen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  
  scrollContent: {
    padding: 20,
  },

  /* INPUT STYLES */
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  req: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },

  /* ROW */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  /* DROPDOWN */
  dropdownTrigger: {
    justifyContent: 'space-between',
  },
  dropdownList: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
  },
  dropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },

  helperText: {
    fontSize: 12,
    color: '#16A34A',
    marginTop: 6,
    fontWeight: '500',
  },

  /* FOOTER */
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});