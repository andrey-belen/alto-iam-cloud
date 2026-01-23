import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

// AICODE-NOTE: Property display card for grid layout

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      to={`/properties/${property.id}`}
      className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
          <svg
            className="w-6 h-6 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>

        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            property.enabled
              ? 'bg-success-100 text-success-700'
              : 'bg-slate-100 text-slate-600'
          )}
        >
          {property.enabled ? 'Active' : 'Inactive'}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
        {property.displayName || property.realm}
      </h3>

      <p className="text-sm text-slate-500 mb-4">Realm: {property.realm}</p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1 text-slate-600">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-sm">
            {property.userCount ?? 0} user{property.userCount !== 1 ? 's' : ''}
          </span>
        </div>

        <span className="text-sm text-primary-600 font-medium group-hover:underline">
          View details
        </span>
      </div>
    </Link>
  );
}

export default PropertyCard;
