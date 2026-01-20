import { useState, useEffect, useCallback } from 'react';
import { getProperties, getProperty } from '@/services/properties';
import type { Property } from '@/types';

// AICODE-NOTE: Custom hook for property (realm) data fetching

interface UsePropertiesResult {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProperties(): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getProperties();

    if (response.success && response.data) {
      setProperties(response.data);
    } else {
      setError(response.error || 'Failed to fetch properties');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
  };
}

interface UsePropertyResult {
  property: Property | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProperty(propertyId: string | undefined): UsePropertyResult {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await getProperty(propertyId);

    if (response.success && response.data) {
      setProperty(response.data);
    } else {
      setError(response.error || 'Failed to fetch property');
    }

    setIsLoading(false);
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return {
    property,
    isLoading,
    error,
    refetch: fetchProperty,
  };
}

export default useProperties;
