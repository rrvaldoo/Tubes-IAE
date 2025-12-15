import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { walletClient } from '../services/apollo';
import colors from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const GET_WALLET = gql`
  query {
    myWallet {
      wallet_id
      balance
      points
      created_at
      updated_at
    }
  }
`;

export default function WalletScreen({ navigation }) {
  const { data, loading, refetch } = useQuery(GET_WALLET, {
    client: walletClient,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount || 0);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.title}>My Wallet</Text>
        <Text style={styles.balance}>
          {loading ? 'Loading...' : formatCurrency(data?.myWallet?.balance || 0)}
        </Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points:</Text>
          <Text style={styles.points}>
            {loading ? '...' : data?.myWallet?.points || 0}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('TransactionHistory')}
        >
          <Text style={styles.cardTitle}>Transaction History</Text>
          <Text style={styles.cardSubtitle}>View all your transactions</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Wallet Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet ID:</Text>
            <Text style={styles.infoValue}>
              {loading ? '...' : data?.myWallet?.wallet_id || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {loading
                ? '...'
                : data?.myWallet?.created_at
                ? new Date(data.myWallet.created_at).toLocaleDateString('id-ID')
                : 'N/A'}
            </Text>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 10,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 15,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  pointsLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 5,
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

