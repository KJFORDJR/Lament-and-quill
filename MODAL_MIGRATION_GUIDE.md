# Centralized Modal System Migration Guide

## Overview
The new centralized modal system provides consistent behavior, accessibility features, and simplified state management across the entire application.

## Key Benefits
✅ **Unified Accessibility**: All modals inherit comprehensive WCAG 2.1 AA compliance  
✅ **Consistent Behavior**: Focus management, scroll prevention, keyboard navigation  
✅ **Simplified State**: Centralized modal management reduces boilerplate  
✅ **Type Safety**: Full TypeScript support with proper typing  
✅ **Performance**: Memoized hooks prevent unnecessary re-renders  

## Available Modal Types

### 1. ReadModal (Already Implemented)
```tsx
import { useReadModal } from '@/hooks/useReadModal';
import { ReadModal } from '@/components/ReadModal';

const { isOpen, selectedItem, openModal, closeModal } = useReadModal<ItemType>();

<ReadModal
  isOpen={isOpen}
  onClose={closeModal}
  title={selectedItem?.title || 'Reading'}
  theme="crimson"
>
  {selectedItem?.content}
</ReadModal>
```

### 2. Standard Modal (Base Modal Component)
```tsx
import Modal from '@/components/Modal';
import { useModalState } from '@/hooks/useModalHooks';

const { isOpen, openModal, closeModal } = useModalState();

<Modal
  isOpen={isOpen}
  onClose={closeModal}
  title="Standard Modal"
  theme="silver"
>
  <div className="p-6">Your content here</div>
</Modal>
```

### 3. Form Modal
```tsx
import { FormModal } from '@/components/ModalComponents';
import { useFormModal } from '@/hooks/useModalHooks';

const { isOpen, formData, isSubmitting, openModal, closeModal, setIsSubmitting } = useFormModal();

<FormModal
  isOpen={isOpen}
  onClose={closeModal}
  title="Create Entry"
  theme="crimson"
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
>
  <div className="space-y-4">
    <input type="text" placeholder="Title" />
    <textarea placeholder="Content"></textarea>
  </div>
</FormModal>
```

### 4. Confirmation Modal
```tsx
import { useConfirmModalComponent } from '@/components/ModalComponents';

const { openConfirmModal, ConfirmModalComponent } = useConfirmModalComponent();

// To show a confirmation
openConfirmModal({
  title: 'Delete Entry',
  message: 'Are you sure you want to delete this entry? This action cannot be undone.',
  onConfirm: () => handleDelete(),
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger'
});

// In your JSX
{ConfirmModalComponent}
```

## Migration Steps

### Step 1: Replace Custom createPortal Implementations
**Before:**
```tsx
{showModal && createPortal(
  <div className="fixed inset-0 bg-black/70...">
    <div className="modal-content">...</div>
  </div>,
  document.body
)}
```

**After:**
```tsx
<Modal isOpen={showModal} onClose={closeModal} title="Modal Title">
  <div className="p-6">...</div>
</Modal>
```

### Step 2: Standardize State Management
**Before:**
```tsx
const [showModal, setShowModal] = useState(false);
const [modalData, setModalData] = useState(null);
```

**After:**
```tsx
const { isOpen, selectedItem, openModal, closeModal } = useReadModal();
// or
const { isOpen, openModal, closeModal } = useModalState();
```

### Step 3: Update Form Modals
**Before:**
```tsx
const [showCreateModal, setShowCreateModal] = useState(false);
const [formData, setFormData] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

**After:**
```tsx
const { isOpen, formData, isSubmitting, openModal, closeModal, updateFormData, setIsSubmitting } = useFormModal();
```

## Current Status

### ✅ Already Using Enhanced Modal System:
- **Dossier page** (`/dossier`) - ReadModal
- **Crimson Ledger** (`/crimson-ledger`) - ReadModal  
- **Crimson Confessions** (`/crimson-confessions`) - ReadModal
- **Fragments of Lament** (`/fragments-of-lament`) - ReadModal
- **Forum page** (`/forum`) - Base Modal
- **AnnouncementsSection** component - Modal

### ⚠️ Needs Migration:
- **Admin Crimson page** (`/admin/crimson`) - 4 custom modals
- **Admin Silver page** (`/admin/silver`) - 1 custom modal  
- **Admin Orders page** (`/admin/orders`) - Custom order modal

## Accessibility Features (Automatically Included)

All modals now include:
- ✅ **Focus Trapping**: Tab navigation stays within modal
- ✅ **Focus Restoration**: Returns focus to trigger element on close
- ✅ **Scroll Prevention**: Prevents background scrolling (iOS compatible)
- ✅ **Screen Reader Support**: Proper ARIA attributes and announcements
- ✅ **Keyboard Navigation**: ESC to close, Tab/Shift+Tab cycling
- ✅ **Touch Prevention**: Prevents accidental touch scrolling on mobile

## Next Steps

1. **Immediate**: All user-facing modals are working with full accessibility ✅
2. **Phase 2**: Migrate admin page modals to use centralized system
3. **Phase 3**: Add specialized modal types as needed (image galleries, etc.)

The centralized modal system ensures consistent Dark Neo-Gothic theming and professional accessibility standards across your entire application! 🎭
