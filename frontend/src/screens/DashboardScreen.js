import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { walletClient } from '../services/apollo';
import { transactionClient } from '../services/apollo';
import { AuthContext } from '../context/AuthContext';
import colors from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const GET_WALLET = gql`
  query {
    myWallet {
      balance
      points
    }
  }
`;

const GET_RECENT_TRANSACTIONS = gql`
  query {
    myTransactions(limit: 5) {
      transaction_id
      amount
      type
      date
      description
    }
  }
`;

export default function DashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useQuery(
    GET_WALLET,
    { client: walletClient }
  );

  const { data: transactionData, loading: transactionLoading, refetch: refetchTransactions } = useQuery(
    GET_RECENT_TRANSACTIONS,
    { client: transactionClient }
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchWallet(), refetchTransactions()]);
    setRefreshing(false);
  }, [refetchWallet, refetchTransactions]);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Welcome to DosWallet</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance</Text>
          <Text style={styles.balance}>
            {walletLoading
              ? 'Loading...'
              : formatCurrency(walletData?.myWallet?.balance || 0)}
          </Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Points:</Text>
            <Text style={styles.points}>
              {walletLoading
                ? '...'
                : walletData?.myWallet?.points || 0}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Transfer')}
          >
            <Text style={styles.actionButtonText}>Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Transfer', { screen: 'QRIS' })}
          >
            <Text style={styles.actionButtonText}>QRIS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Wallet', { screen: 'TransactionHistory' })}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactionLoading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : !transactionData?.myTransactions?.length ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            transactionData.myTransactions.map((transaction) => (
              <View key={transaction.transaction_id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>
                    {transaction.type.toUpperCase()}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    transaction.type === 'deposit' || transaction.type === 'transfer'
                      ? styles.amountPositive
                      : styles.amountNegative,
                  ]}
                >
                  {transaction.type === 'withdraw' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 5,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  transactionDate: {
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
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 20,
  },
});

