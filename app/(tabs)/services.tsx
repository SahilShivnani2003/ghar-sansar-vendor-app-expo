import { propertyAPI } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function Services() {
  const router = useRouter();
  const vendor = useAuthStore((state) => state.vendor);
  const [services, setServices] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    if (!vendor) return;

    try {
      const response = await propertyAPI.getVendorProperties(vendor._id)
      setServices(response.data.properties);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyAPI.deleteProperty(serviceId);
              loadServices();
              Alert.alert('Success', 'Service deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete service');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-service')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Services Yet</Text>
            <Text style={styles.emptyText}>
              Start by adding your first service to attract customers
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-service')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((service) => (
            <View key={service._id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIcon}>
                  <Image source={{ uri:service.images.url }} resizeMode='contain' />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.title}</Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    service.status === 'active' ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <Text style={styles.statusText}>{service.status}</Text>
                </View>
              </View>

              <Text style={styles.serviceDescription} numberOfLines={2}>
                {service.description}
              </Text>

              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>₹{service.price}</Text>
                </View>
                {/* <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>{service.duration}</Text>
                </View> */}
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.detailText}>{service.location}</Text>
                </View>
              </View>

              <View style={styles.serviceActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => router.push(`/add-service?id=${service.id}`)}
                >
                  <Ionicons name="pencil" size={18} color="#6366f1" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteService(service.id)}
                >
                  <Ionicons name="trash" size={18} color="#ef4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginRight: 12
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#ede9fe',
  },
  editButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});