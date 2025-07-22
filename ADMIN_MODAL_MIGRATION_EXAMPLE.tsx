/**
 * Admin Modal Migration Guide
 * This demonstrates how to migrate admin page modals to the centralized system
 */

// BEFORE: Scattered modal states (legacy approach)
/*
const [showEditModal, setShowEditModal] = useState(false);
const [showCreateModal, setShowCreateModal] = useState(false);
const [showReadModal, setShowReadModal] = useState(false);
const [showDossierCreateModal, setShowDossierCreateModal] = useState(false);
const [showDossierEditModal, setShowDossierEditModal] = useState(false);
const [showAnnouncementCreateModal, setShowAnnouncementCreateModal] = useState(false);
const [editingEntry, setEditingEntry] = useState(null);
const [readingEntry, setReadingEntry] = useState(null);
*/

// AFTER: Centralized modal management (modern approach)
import { useReadModal } from '@/hooks/useReadModal';
import { useFormModal } from '@/hooks/useModalHooks';
import { FormModal, useConfirmModalComponent } from '@/components/ModalComponents';
import { ReadModal } from '@/components/ReadModal';

// Example interfaces
interface CrimsonEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface CrimsonEntryForm {
  id?: string;
  title: string;
  content: string;
  category: string;
}

export default function AdminCrimsonPage() {
  // Reading modals for different content types
  const entryReadModal = useReadModal<CrimsonEntry>();
  
  // Form modals for creation/editing
  const entryFormModal = useFormModal<CrimsonEntryForm>();
  
  // Confirmation modal
  const { openConfirmModal, ConfirmModalComponent } = useConfirmModalComponent();

  // Example API functions (implement according to your backend)
  const deleteEntry = async (entryId: string) => {
    // Implementation here
  };
  
  const updateEntry = async (data: CrimsonEntryForm) => {
    // Implementation here
  };
  
  const createEntry = async (data: CrimsonEntryForm) => {
    // Implementation here
  };
  
  const loadEntries = async () => {
    // Implementation here
  };

  // Example handlers
  const handleDeleteEntry = (entryId: string) => {
    openConfirmModal({
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this entry? This action cannot be undone.',
      onConfirm: () => deleteEntry(entryId),
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
  };

  const handleCreateEntry = () => {
    entryFormModal.openModal({
      title: '',
      content: '',
      category: 'general'
    });
  };

  const handleEditEntry = (entry: CrimsonEntry) => {
    entryFormModal.openModal({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      category: entry.category
    });
  };

  const handleReadEntry = (entry: CrimsonEntry) => {
    entryReadModal.openModal(entry);
  };

  const handleSubmitEntry = async () => {
    if (!entryFormModal.formData) return;
    
    entryFormModal.setIsSubmitting(true);
    try {
      if (entryFormModal.formData.id) {
        await updateEntry(entryFormModal.formData);
      } else {
        await createEntry(entryFormModal.formData);
      }
      entryFormModal.closeModal();
      await loadEntries(); // Refresh data
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      entryFormModal.setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Entry Create/Edit Modal */}
      <FormModal
        isOpen={entryFormModal.isOpen}
        onClose={entryFormModal.closeModal}
        title={entryFormModal.formData?.id ? 'Edit Entry' : 'Create Entry'}
        theme="crimson"
        size="lg"
        onSubmit={handleSubmitEntry}
        isSubmitting={entryFormModal.isSubmitting}
        submitText={entryFormModal.formData?.id ? 'Update Entry' : 'Create Entry'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-gothic-crimson mb-2">Title</label>
            <input
              type="text"
              value={entryFormModal.formData?.title || ''}
              onChange={(e) => entryFormModal.updateFormData({ title: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Content</label>
            <textarea
              value={entryFormModal.formData?.content || ''}
              onChange={(e) => entryFormModal.updateFormData({ content: e.target.value })}
              rows={8}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            />
          </div>
          
          <div>
            <label className="block text-gothic-crimson mb-2">Category</label>
            <select
              value={entryFormModal.formData?.category || 'general'}
              onChange={(e) => entryFormModal.updateFormData({ category: e.target.value })}
              className="w-full p-3 bg-gothic-charcoal border border-gothic-crimson/30 rounded-md text-gothic-silver"
            >
              <option value="general">General</option>
              <option value="story">Story</option>
              <option value="lore">Lore</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* Entry Read Modal */}
      <ReadModal
        isOpen={entryReadModal.isOpen}
        onClose={entryReadModal.closeModal}
        title={entryReadModal.selectedItem?.title || 'Reading Entry'}
        theme="crimson"
        size="xl"
        author="Admin"
        category={entryReadModal.selectedItem?.category}
        publishedAt={entryReadModal.selectedItem?.created_at}
      >
        <div className="p-6">
          <div className="prose prose-gothic-crimson max-w-none">
            {entryReadModal.selectedItem?.content}
          </div>
        </div>
      </ReadModal>

      {/* Confirmation Modal */}
      {ConfirmModalComponent}
    </div>
  );
}

// Key Benefits of This Migration:
// ✅ Consistent accessibility across all modals
// ✅ Simplified state management with hooks
// ✅ Reduced boilerplate code
// ✅ Type-safe modal interactions
// ✅ Automatic focus and scroll management
// ✅ Dark Neo-Gothic theming consistency
// ✅ Reusable modal components
// ✅ Centralized modal behavior
