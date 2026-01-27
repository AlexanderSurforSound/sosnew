'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Filter, RefreshCw, Home, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PropertiesPage() {
  const [search, setSearch] = useState('');
  const [village, setVillage] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-properties', page, village, search],
    queryFn: () => api.getProperties({ page, pageSize: 20, village, search }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500">Manage all vacation rental properties</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Sync All
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            className="input w-48"
          >
            <option value="">All Villages</option>
            <option value="rodanthe">Rodanthe</option>
            <option value="waves">Waves</option>
            <option value="salvo">Salvo</option>
            <option value="avon">Avon</option>
            <option value="buxton">Buxton</option>
            <option value="frisco">Frisco</option>
            <option value="hatteras">Hatteras</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 20 + 1} to{' '}
                {Math.min(page * 20, data.total)} of {data.total} properties
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
  );
}

function PropertyCard({ property }: { property: any }) {
  return (
    <div className="card overflow-hidden">
      <div className="relative h-40">
        {property.images?.[0] ? (
          <Image
            src={property.images[0].url}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Home className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              property.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {property.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{property.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {property.bedrooms} BR • {property.bathrooms} BA • Sleeps {property.sleeps}
        </p>
        <p className="text-sm text-gray-500">{property.village?.name}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-primary-600 font-semibold">
            ${property.baseRate}/night
          </span>
          <Link
            href={`/properties/${property.id}`}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
