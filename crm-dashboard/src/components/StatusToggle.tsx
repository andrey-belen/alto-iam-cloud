import { useState } from 'react';
import { cn } from '@/lib/utils';
import { enableUser, disableUser } from '@/services/users';

// AICODE-NOTE: Toggle switch for enabling/disabling users

interface StatusToggleProps {
  enabled: boolean;
  onChange?: (enabled: boolean) => void;
  disabled?: boolean;
  propertyId: string;
  userId: string;
}

export function StatusToggle({
  enabled,
  onChange,
  disabled = false,
  propertyId,
  userId,
}: StatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentEnabled, setCurrentEnabled] = useState(enabled);

  const handleToggle = async () => {
    if (disabled || isUpdating) return;

    setIsUpdating(true);
    const newEnabled = !currentEnabled;

    try {
      const response = newEnabled
        ? await enableUser(propertyId, userId)
        : await disableUser(propertyId, userId);

      if (response.success) {
        setCurrentEnabled(newEnabled);
        onChange?.(newEnabled);
      } else {
        console.error('Failed to update user status:', response.error);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isUpdating}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        currentEnabled ? 'bg-success-500' : 'bg-slate-300',
        (disabled || isUpdating) && 'opacity-50 cursor-not-allowed'
      )}
      aria-pressed={currentEnabled}
      aria-label={currentEnabled ? 'Disable user' : 'Enable user'}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          currentEnabled ? 'translate-x-5' : 'translate-x-0'
        )}
      >
        {isUpdating && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </span>
    </button>
  );
}

export default StatusToggle;
