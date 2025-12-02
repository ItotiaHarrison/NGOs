'use client';

import { useEffect, useState } from 'react';
import { formatKES, formatUSD, getPaymentMethodName, getPaymentStatusDisplay } from '@/lib/payment-utils';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string | null;
  status: string;
  tier: string;
  createdAt: string;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.payments);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
        <p className="text-gray-600">Your payment history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const statusDisplay = getPaymentStatusDisplay(transaction.status);
        const statusColors = {
          green: 'bg-green-100 text-green-800',
          yellow: 'bg-yellow-100 text-yellow-800',
          red: 'bg-red-100 text-red-800',
          gray: 'bg-gray-100 text-gray-800',
        };

        return (
          <div
            key={transaction.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-gray-900">
                    Upgrade to {transaction.tier.replace('_', ' ')}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[statusDisplay.color as keyof typeof statusColors]
                    }`}
                  >
                    {statusDisplay.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {getPaymentMethodName(transaction.paymentMethod)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {transaction.currency === 'KES'
                        ? formatKES(transaction.amount)
                        : formatUSD(transaction.amount)}
                    </span>
                  </div>

                  {transaction.transactionId && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Transaction ID:</span>
                      <span className="ml-2 text-gray-900 font-mono text-xs">
                        {transaction.transactionId}
                      </span>
                    </div>
                  )}

                  <div className="col-span-2">
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(transaction.createdAt).toLocaleString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
