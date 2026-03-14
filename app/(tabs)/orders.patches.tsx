/**
 * PATCH INSTRUCTIONS for app/(tabs)/orders.tsx
 * 
 * These patches handle orders with different item structures from migrated data.
 */

// ============================================
// PATCH 1: Safe order filtering with null checks
// ============================================

// Update the useEffect for filtering (around line 62):

useEffect(() => {
  const filtered = searchOrders(searchQuery, activeFilter);
  // Filter out invalid orders
  setFilteredOrders(filtered.filter((o): o is Order => 
    o != null && typeof o === 'object' && o.id != null
  ));
}, [orders, searchQuery, activeFilter]);

// ============================================
// PATCH 2: Safe order item rendering
// ============================================

// Update renderOrderItem to handle missing data:

const renderOrderItem = ({ item, index }: { item: Order; index: number }) => {
  // Skip invalid orders
  if (!item?.id) return null;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <OrderCard 
        order={{
          ...item,
          // Ensure required fields have fallbacks
          orderNumber: item.orderNumber || `ORDER-${item.id.slice(0, 8)}`,
          status: item.status || 'pending',
          totalAmount: Number(item.totalAmount) || 0,
          itemsCount: Number(item.itemsCount) || (item.items?.length ?? 0),
          items: Array.isArray(item.items) ? item.items : [],
          customer: item.customer || { name: 'Неизвестный клиент' },
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
        }}
        onPress={() => handleOrderPress(item.id)} 
      />
    </Animated.View>
  );
};

// ============================================
// PATCH 3: Handle missing order numbers in search
// ============================================

// Update the handleScan function (around line 84):

const handleScan = (data: string, type: string) => {
  if (!data?.trim()) return;
  
  // Try to find order by scanned number
  const order = getOrderByNumber(data.trim());
  if (order?.id) {
    router.push(`/order/${order.id}`);
  } else {
    // If not found, set it as search query
    Alert.alert(
      'Заказ не найден',
      `Заказ с номером "${data}" не найден. Хотите использовать это значение для поиска?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Искать', onPress: () => setSearchQuery(data.trim()) },
      ]
    );
  }
};

// ============================================
// PATCH 4: Safe order count in header
// ============================================

// Update the badge display (around line 145):

<View style={styles.badge}>
  <Text style={styles.badgeText}>{orders?.length || 0}</Text>
</View>

// ============================================
// PATCH 5: Handle empty/migrated customer names
// ============================================

// Ensure OrderCard or the order rendering handles missing customer data:

// In the OrderCard component or where rendering customer info:
const customerName = order.customer?.name?.trim() 
  || order.customer_name 
  || 'Клиент не указан';
const customerPhone = order.customer?.phone?.trim() 
  || order.customer_phone 
  || '';
