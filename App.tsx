// App.tsx (root)
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './src/pages/Dashboard';
import InventoryList from './src/pages/InventoryList';
import ItemDetail from './src/pages/ItemDetail';
import { InventoryItem } from './src/types/inventory';
import { loadData, saveData } from './src/storage/storage';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  ItemDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const sampleData: InventoryItem[] = [
  {
    id: '1',
    name: 'Doxy gen',
    category: 'Antibiotics',
    quantity: 40,
    minLevel: 10,
    price: 500,
    location: 'Shelf A',
    history: [],
  },
];

export default function App() {
  const [items, setItems] = useState<InventoryItem[] | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await loadData();
      if (raw) {
        try {
          setItems(JSON.parse(raw));
        } catch {
          setItems(sampleData);
        }
      } else {
        setItems(sampleData);
      }
    })();
  }, []);

  useEffect(() => {
    if (items !== null) {
      saveData(JSON.stringify(items));
    }
  }, [items]);

  const addItem = (item: InventoryItem) => {
    setItems((prev) => (prev ? [item, ...prev] : [item]));
  };

  const updateItem = (updated: InventoryItem, fromEditScreen = false) => {
    setItems((prev) =>
      prev?.map((i) => {
        if (i.id !== updated.id) return i;

        // EDIT ITEM SCREEN — DO NOT CHANGE QUANTITY OR HISTORY
        if (fromEditScreen) {
          return {
            ...i,
            name: updated.name,
            category: updated.category,
            minLevel: updated.minLevel,
            price: updated.price,
            location: updated.location,
          };
        }

        // STOCK ADJUSTMENT — ALLOW ALL FIELDS TO CHANGE
        return updated;
      }) || []
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev?.filter((i) => i.id !== id) || []);
  };

  if (items === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" options={{ title: 'Dashboard' }}>
          {(props) => <Dashboard {...props} items={items} />}
        </Stack.Screen>

        <Stack.Screen name="Inventory" options={{ title: 'Inventory' }}>
          {(props) => (
            <InventoryList {...props} items={items} onAddItem={addItem} />
          )}
        </Stack.Screen>

        <Stack.Screen name="ItemDetail" options={{ title: 'Item Detail' }}>
          {(props) => (
            <ItemDetail
              {...props}
              items={items}
              onUpdate={updateItem}
              onDelete={(id) => {
                deleteItem(id);
                props.navigation.goBack();
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
