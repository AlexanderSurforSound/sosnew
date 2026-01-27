'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Star, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function GuestsPage() {
  const [search, setSearch] = useState('');
  const [loyaltyTier, setLoyaltyTier] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-guests', page, loyaltyTier, search],
    queryFn: () => api.getGuests({ page, pageSize: 20, loyaltyTier, search }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-500">Manage registered guests and loyalty program</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Guests</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Legend Members</p>
          <p className="text-2xl font-bold text-purple-600">0</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Islander Members</p>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Adventurer Members</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={loyaltyTier}
            onChange={(e) => setLoyaltyTier(e.target.value)}
            className="input w-48"
          >
            <option value="">All Tiers</option>
            <option value="Explorer">Explorer</option>
            <option value="Adventurer">Adventurer</option>
            <option value="Islander">Islander</option>
            <option value="Legend">Legend</option>
          </select>
        </div>
      </div>

      {/* Guests Table */}
      <div className="card">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loyalty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Stays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lifetime Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.items.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {guest.firstName?.charAt(0)}
                              {guest.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {guest.firstName} {guest.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Member since {guest.createdAt?.split('T')[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {guest.email}
                          </div>
                          {guest.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              {guest.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <LoyaltyBadge tier={guest.loyaltyTier} />
                        <p className="text-xs text-gray-500 mt-1">
                          {guest.loyaltyPoints?.toLocaleString()} pts
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{guest.totalStays}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          ${guest.lifetimeValue?.toLocaleString() ?? 0}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/guests/${guest.id}`}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 20 + 1} to{' '}
                  {Math.min(page * 20, data.total)} of {data.total} guests
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LoyaltyBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    Explorer: 'bg-gray-100 text-gray-800',
    Adventurer: 'bg-green-100 text-green-800',
    Islander: 'bg-blue-100 text-blue-800',
    Legend: 'bg-purple-100 text-purple-800',
  };

  const style = styles[tier] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${style}`}>
      <Star className="w-3 h-3" />
      {tier}
    </span>
  );
}
