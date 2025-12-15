import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { notificationClient } from '../services/apollo';
import colors from '../theme/colors';

const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int, $offset: Int) {
    myNotifications(limit: $limit, offset: $offset) {
      notification_id
      message
      date
      read_status
    }
  }
`;

const MARK_AS_READ = gql`
  mutation MarkAsRead($notificationId: Int!) {
    markAsRead(notificationId: $notificationId) {
      notification_id
      read_status
    }
  }
`;

const MARK_ALL_AS_READ = gql`
  mutation {
    markAllAsRead
  }
`;

export default function NotificationScreen() {
  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    client: notificationClient,
    variables: { limit: 50, offset: 0 },
  });

  const [markAsRead] = useMutation(MARK_AS_READ, {
    client: notificationClient,
    refetchQueries: [{ query: GET_NOTIFICATIONS, variables: { limit: 50, offset: 0 } }],
  });

  const [markAllAsRead] = useMutation(MARK_ALL_AS_READ, {
    client: notificationClient,
    refetchQueries: [{ query: GET_NOTIFICATIONS, variables: { limit: 50, offset: 0 } }],
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ variables: { notificationId } });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read_status && styles.unreadNotification,
      ]}
      onPress={() => !item.read_status && handleMarkAsRead(item.notification_id)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationDate}>{formatDate(item.date)}</Text>
      </View>
      {!item.read_status && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const unreadCount = data?.myNotifications?.filter((n) => !n.read_status).length || 0;

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={data?.myNotifications || []}
        renderItem={renderNotification}
        keyExtractor={(item) => item.notification_id.toString()}
        refreshing={loading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  markAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: colors.primaryLight + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

