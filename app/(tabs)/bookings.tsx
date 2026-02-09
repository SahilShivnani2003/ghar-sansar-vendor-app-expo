import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { bookingAPI } from '../../utils/api';

export default function Bookings() {
  const vendor = useAuthStore((state) => state.vendor);
  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    if (!vendor) return;

    try {
      const response = await bookingAPI.getVendorBookings(vendor._id);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, { status });
      loadBookings();
      Alert.alert('Success', `Booking ${status} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const getStatusCount = (status: string) => {
    if (status === 'all') return bookings.length;
    return bookings.filter((b) => b.status === status).length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>{bookings.length} total bookings</Text>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, filter === key && styles.filterChipActive]}
              onPress={() => setFilter(key as any)}
            >
              <Text
                style={[styles.filterChipText, filter === key && styles.filterChipTextActive]}
              >
                {label}
              </Text>
              {getStatusCount(key) > 0 && (
                <View style={[styles.countBadge, filter === key && styles.countBadgeActive]}>
                  <Text style={[styles.countText, filter === key && styles.countTextActive]}>
                    {getStatusCount(key)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'You have no bookings yet'
                : `No ${filter} bookings`}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking._id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.customerName}>{booking.service?.title}</Text>
                  <Text style={styles.serviceName}>{booking.user?.name}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    booking.status === 'pending' && styles.statusPending,
                    booking.status === 'confirmed' && styles.statusConfirmed,
                    booking.status === 'completed' && styles.statusCompleted,
                    booking.status === 'cancelled' && styles.statusCancelled,
                  ]}
                >
                  <Text style={styles.statusText}>{booking.status}</Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>{booking.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>{booking.time}</Text>
                </View>
                {/* <View style={styles.detailRow}>
                  <Ionicons name="cash" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>₹{booking.amount?.toFixed(2) || '0.00'}</Text>
                </View> */}
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Ionicons name="mail" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{booking.user?.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{booking.user?.phone}</Text>
                </View>
              </View>

              {booking.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => handleUpdateStatus(booking._id, 'confirmed')}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleUpdateStatus(booking._id, 'cancelled')}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status === 'confirmed' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => handleUpdateStatus(booking._id, 'completed')}
                >
                  <Text style={styles.completeButtonText}>Mark as Completed</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filterWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 6,
    height: 36,
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
  },
  countTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusConfirmed: {
    backgroundColor: '#dbeafe',
  },
  statusCompleted: {
    backgroundColor: '#d1fae5',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  contactInfo: {
    gap: 8,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fee2e2',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#6366f1',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});