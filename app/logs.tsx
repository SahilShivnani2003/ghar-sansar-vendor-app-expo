import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { logAPI } from '../utils/api';
import { Log } from '../types';
import { format } from 'date-fns';

export default function Logs() {
  const router = useRouter();
  const vendor = useAuthStore((state) => state.vendor);
  const [logs, setLogs] = useState<Log[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    if (!vendor) return;

    try {
      const response = await logAPI.getLogs(vendor.id);
      setLogs(response.data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const getLogIcon = (action: string) => {
    if (action.includes('LOGIN')) return 'log-in';
    if (action.includes('REGISTER')) return 'person-add';
    if (action.includes('CREATE')) return 'add-circle';
    if (action.includes('UPDATE')) return 'pencil';
    if (action.includes('DELETE')) return 'trash';
    if (action.includes('PURCHASE')) return 'card';
    return 'document-text';
  };

  const getLogColor = (action: string) => {
    if (action.includes('DELETE')) return '#ef4444';
    if (action.includes('CREATE')) return '#10b981';
    if (action.includes('UPDATE')) return '#6366f1';
    if (action.includes('LOGIN')) return '#8b5cf6';
    return '#6b7280';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Activity Logs</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Logs Yet</Text>
            <Text style={styles.emptyText}>Your activity logs will appear here</Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View key={log.id} style={styles.logItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${getLogColor(log.action)}20` }]}>
                <Ionicons name={getLogIcon(log.action) as any} size={20} color={getLogColor(log.action)} />
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logAction}>{log.action.replace(/_/g, ' ')}</Text>
                <Text style={styles.logDetails}>{log.details}</Text>
                <Text style={styles.logTime}>
                  {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                </Text>
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
  backButton: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 16,
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
  logItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  logDetails: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  bottomPadding: {
    height: 24,
  },
});