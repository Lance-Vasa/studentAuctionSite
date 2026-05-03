import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

type ProfileData = {
  id: string;
  email: string;
  rating: number;
  created_at: string;
  activeListings: number;
  soldListings: number;
};

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me/profile');
        setProfile(response.data);
      } catch (error) {
        setPageError('Unable to load profile right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill out both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const response = await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });
      setPasswordMessage(response.data?.message ?? 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      setPasswordError(error?.response?.data?.message ?? 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordError('');
    setPasswordMessage('');
    setCurrentPassword('');
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (isUpdatingPassword) {
      return;
    }
    setIsPasswordModalOpen(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Please enter your password to delete your account.');
      return;
    }

    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Type DELETE to confirm account removal.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await api.delete('/users/me', {
        data: {
          password: deletePassword,
        },
      });
      logout();
      navigate('/register');
    } catch (error: any) {
      setDeleteError(error?.response?.data?.message ?? 'Failed to delete account.');
      setIsDeletingAccount(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteError('');
    setDeletePassword('');
    setDeleteConfirmText('');
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeletingAccount) {
      return;
    }
    setIsDeleteModalOpen(false);
  };

  if (loading) {
    return <div className="text-center py-10">Loading your profile...</div>;
  }

  if (pageError) {
    return <div className="text-center py-10 text-red-600">{pageError}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-[#C8102E] font-nebraska">Your Profile</h1>
        {profile && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-gray-900 font-medium break-all">{profile.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Account ID</p>
              <p className="text-gray-900 font-medium break-all">{profile.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Member Since</p>
              <p className="text-gray-900 font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Rating</p>
              <p className="text-gray-900 font-medium">{profile.rating.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-gray-500">Active Listings</p>
              <p className="text-gray-900 font-medium">{profile.activeListings}</p>
            </div>
            <div>
              <p className="text-gray-500">Sold Listings</p>
              <p className="text-gray-900 font-medium">{profile.soldListings}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
        <button
          type="button"
          onClick={openPasswordModal}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-md text-white bg-[#C8102E] hover:bg-[#a00d25]"
        >
          Change Password
        </button>
        {passwordMessage && <p className="mt-3 text-sm text-green-700">{passwordMessage}</p>}
      </div>

      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
        >
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 id="change-password-title" className="text-lg font-semibold text-gray-900">
                Change Password
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Enter your current password and a new password.
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 px-6 py-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#C8102E] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#C8102E] focus:outline-none"
                  required
                />
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-[#C8102E] hover:bg-[#a00d25] disabled:opacity-60"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Confirm Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <h2 className="text-xl font-semibold text-red-700">Delete Account</h2>
        <p className="mt-2 text-sm text-gray-600">
          This permanently deletes your account and your related marketplace data.
        </p>
        <button
          type="button"
          onClick={openDeleteModal}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-md text-white bg-red-700 hover:bg-red-800"
        >
          Delete Account
        </button>
      </div>

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 id="delete-account-title" className="text-lg font-semibold text-red-700">
                Confirm Account Deletion
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                This action cannot be undone. Enter your password and type DELETE to continue.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4 px-6 py-4">
              <div>
                <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700">Confirm Your Password</label>
                <input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-700">Type DELETE to confirm</label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-600 focus:outline-none"
                  required
                />
              </div>
              {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isDeletingAccount}
                  className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount}
                  className="inline-flex items-center px-4 py-2 rounded-md text-white bg-red-700 hover:bg-red-800 disabled:opacity-60"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
