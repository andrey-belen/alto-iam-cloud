// AICODE-NOTE: Site access management component (placeholder)
// Will show checklist of properties for a user to control which sites they can access
// This is for Alto admins to manage granular access (more specific than client_prefix)

interface SiteAccessManagerProps {
  userId: string;
  userEmail: string;
  onClose: () => void;
}

export function SiteAccessManager({
  userId,
  userEmail,
  onClose,
}: SiteAccessManagerProps) {
  // Placeholder - actual implementation will:
  // 1. Fetch all properties the admin can see
  // 2. Fetch current site access for this user
  // 3. Show checkboxes for each property
  // 4. Allow grant/revoke with API calls

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Manage Site Access
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Control which properties <strong>{userEmail}</strong> can access.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Placeholder content */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-amber-800 font-medium text-sm">
                Coming Soon
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Site access management will allow you to control which specific
                properties this user can access. You'll be able to:
              </p>
              <ul className="text-amber-700 text-sm mt-2 list-disc list-inside space-y-1">
                <li>View all properties available to your organization</li>
                <li>Grant or revoke access to individual properties</li>
                <li>See when access was granted and by whom</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mock property list placeholder */}
        <div className="border border-slate-200 rounded-lg p-4 mb-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
            Property Access Preview
          </p>
          <div className="space-y-2">
            {['marriott-hk', 'marriott-sg', 'marriott-tokyo'].map((property) => (
              <div
                key={property}
                className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg opacity-60"
              >
                <span className="text-sm text-slate-600">{property}</span>
                <div className="w-10 h-5 bg-slate-300 rounded-full relative cursor-not-allowed">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Hidden for now - actual userId for debugging */}
        <input type="hidden" value={userId} />
      </div>
    </div>
  );
}

export default SiteAccessManager;
