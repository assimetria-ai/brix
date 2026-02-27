import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/@system/Button/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/@system/Card/Card';
import { Input } from '@/app/components/@system/Form/Form';
import { Alert } from '@/app/components/@system/Alert/Alert';
import { Modal } from '@/app/components/@system/Modal/Modal';
import { EmptyState } from '@/app/components/@system/EmptyState/EmptyState';

interface Page {
  id: number;
  name: string;
  slug: string;
  template_id: number | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  preview_url: string | null;
}

export function PagesListPage() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPages();
    loadTemplates();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pages', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Failed to load pages');
      
      const data = await response.json();
      setPages(data.pages || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const createPage = async () => {
    if (!newPageName.trim()) {
      setError('Page name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      const slug = newPageSlug.trim() || newPageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newPageName,
          slug,
          template_id: selectedTemplate
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create page');
      }
      
      const newPage = await response.json();
      setShowCreateModal(false);
      setNewPageName('');
      setNewPageSlug('');
      setSelectedTemplate(null);
      navigate(`/app/pages/${newPage.id}/edit`);
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page');
      setCreating(false);
    }
  };

  const deletePage = async (pageId: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete page');
      
      await loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  const duplicatePage = async (pageId: number) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Failed to duplicate page');
      
      await loadPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate page');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-gray-600 mt-1">Build beautiful pages with the visual editor</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + New Page
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Get started by creating your first page"
          actionLabel="Create Page"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card key={page.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{page.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">/{page.slug}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      page.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {page.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Created {new Date(page.created_at).toLocaleDateString()}
                  </p>
                  {page.published_at && (
                    <p className="text-sm text-gray-600">
                      Published {new Date(page.published_at).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/app/pages/${page.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicatePage(page.id)}
                      title="Duplicate"
                    >
                      📋
                    </Button>
                    {page.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                        title="View"
                      >
                        👁️
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePage(page.id)}
                      title="Delete"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Page Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewPageName('');
            setNewPageSlug('');
            setSelectedTemplate(null);
            setError(null);
          }}
          title="Create New Page"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Name *</label>
              <Input
                type="text"
                value={newPageName}
                onChange={(e) => {
                  setNewPageName(e.target.value);
                  if (!newPageSlug) {
                    setNewPageSlug(
                      e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                    );
                  }
                }}
                placeholder="My Awesome Page"
                disabled={creating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL Slug *</label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">/</span>
                <Input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(
                    e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  )}
                  placeholder="my-awesome-page"
                  disabled={creating}
                />
              </div>
            </div>

            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Start from Template (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`p-3 border rounded-lg text-left ${
                      selectedTemplate === null ? 'border-primary bg-primary/5' : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <div className="font-medium">Blank Page</div>
                    <div className="text-xs text-gray-500">Start from scratch</div>
                  </button>
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      className={`p-3 border rounded-lg text-left ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                {error}
              </Alert>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPageName('');
                  setNewPageSlug('');
                  setSelectedTemplate(null);
                  setError(null);
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={createPage} disabled={creating || !newPageName.trim()}>
                {creating ? 'Creating...' : 'Create Page'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
