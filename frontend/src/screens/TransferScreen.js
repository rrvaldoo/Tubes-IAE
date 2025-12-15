import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { transactionClient } from '../services/apollo';
import colors from '../theme/colors';

const TRANSFER_MUTATION = gql`
  mutation Transfer($receiverId: Int!, $amount: Decimal!, $description: String) {
    transfer(receiverId: $receiverId, amount: $amount, description: $description) {
      transaction_id
      amount
      type
      date
    }
  }
`;

export default function TransferScreen({ navigation }) {
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferMutation, { loading }] = useMutation(TRANSFER_MUTATION, {
    client: transactionClient,
    refetchQueries: ['GetWallet', 'GetRecentTransactions'],
  });

  const handleTransfer = async () => {
    if (!receiverId || !amount) {
      Alert.alert('Error', 'Please fill in receiver ID and amount');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const { data } = await transferMutation({
        variables: {
          receiverId: parseInt(receiverId),
          amount: transferAmount,
          description: description || null,
        },
      });

      if (data.transfer) {
        Alert.alert('Success', 'Transfer completed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        setReceiverId('');
        setAmount('');
        setDescription('');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Transfer failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Transfer Money</Text>
        <Text style={styles.subtitle}>Send money to another DosWallet user</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Receiver User ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter receiver's user ID"
            placeholderTextColor={colors.textSecondary}
            value={receiverId}
            onChangeText={setReceiverId}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add a note"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleTransfer}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Transfer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => navigation.navigate('QRIS')}
          >
            <Text style={styles.qrButtonText}>Scan QR Code for Payment</Text>
          </TouchableOpacity>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  qrButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

