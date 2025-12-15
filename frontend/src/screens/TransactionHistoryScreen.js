import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { transactionClient } from '../services/apollo';
import colors from '../theme/colors';

const GET_TRANSACTIONS = gql`
  query GetTransactions($limit: Int, $offset: Int) {
    myTransactions(limit: $limit, offset: $offset) {
      transaction_id
      amount
      type
      payment_method
      date
      description
      receiver_id
    }
  }
`;

export default function TransactionHistoryScreen() {
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data, loading, refetch } = useQuery(GET_TRANSACTIONS, {
    client: transactionClient,
    variables: { limit, offset },
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionType}>{item.type.toUpperCase()}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        {item.description && (
          <Text style={styles.transactionDescription}>{item.description}</Text>
        )}
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === 'deposit' || (item.type === 'transfer' && item.receiver_id)
            ? styles.amountPositive
            : styles.amountNegative,
        ]}
      >
        {item.type === 'withdraw' ? '-' : '+'}
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.myTransactions || []}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.transaction_id.toString()}
        refreshing={loading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
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
  transactionItem: {
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
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  transactionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountPositive: {
    color: colors.success,
  },
  amountNegative: {
    color: colors.error,
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

