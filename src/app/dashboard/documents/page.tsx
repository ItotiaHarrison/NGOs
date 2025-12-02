'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export default function DocumentsPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }

    if (user?.organization) {
      // Fetch documents
      fetchDocuments();
    }
  }, [user, isLoading, router]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/organization/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF and image files (JPG, PNG) are allowed');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/organization/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await fetchDocuments();
      e.target.value = ''; // Reset input
    } catch (err) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/organization/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDocuments();
      }
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tierLimits = {
    BASIC_FREE: 0,
    SELF_ASSESSMENT: 5,
    DARAJA_VERIFIED: 999,
  };

  const maxDocuments = tierLimits[user.organization?.tier as keyof typeof tierLimits] || 0;
  const canUpload = documents.length < maxDocuments;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-green-600">Daraja Directory</h1>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-green-600 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Documents</h2>
          <p className="mt-2 text-gray-600">
            Upload and manage your organization's documents ({documents.length}/{maxDocuments === 999 ? '∞' : maxDocuments})
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {maxDocuments === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Upgrade to Upload Documents</h3>
            <p className="text-blue-800 mb-4">
              Document uploads are available for Self-Assessment and Daraja Verified tiers.
            </p>
            <Link
              href="/dashboard/upgrade"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              View Upgrade Options
            </Link>
          </div>
        ) : (
          <>
            {canUpload && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Upload Document (PDF, JPG, PNG - Max 10MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                  />
                </label>
                {uploading && (
                  <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                )}
              </div>
            )}

            {!canUpload && maxDocuments !== 999 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  You've reached your document limit. Upgrade to Daraja Verified for unlimited uploads.
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {documents.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No documents uploaded yet
                </div>
              ) : (
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-sm">
                            {doc.type === 'application/pdf' ? 'PDF' : 'IMG'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
