import { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';

const Modal = forwardRef(({
  className,
  size = 'md',
  isOpen = false,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  ...props
}, ref) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        ref={ref}
        className={clsx(
          "relative w-full bg-white rounded-2xl shadow-2xl animate-scaleIn",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

Modal.displayName = "Modal";

// Sub-components
const ModalHeader = forwardRef(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex items-center justify-between p-6 border-b border-secondary-100", className)}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {onClose && (
      <button
        onClick={onClose}
        className={clsx("ml-4 p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors")}
      >
        <X size={20} />
      </button>
    )}
  </div>
));
ModalHeader.displayName = "ModalHeader";

const ModalTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h2
    ref={ref}
    className={clsx("text-xl font-semibold text-secondary-900", className)}
    {...props}
  >
    {children}
  </h2>
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx("text-sm text-secondary-600 mt-1", className)}
    {...props}
  >
    {children}
  </p>
));
ModalDescription.displayName = "ModalDescription";

const ModalContent = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("p-6", className)}
    {...props}
  >
    {children}
  </div>
));
ModalContent.displayName = "ModalContent";

const ModalFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex items-center justify-end space-x-3 p-6 border-t border-secondary-100", className)}
    {...props}
  >
    {children}
  </div>
));
ModalFooter.displayName = "ModalFooter";

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
};
