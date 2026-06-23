import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '@/styles';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing.lg};
  overflow-y: auto;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(4, 6, 5, 0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
`;

const ModalContainer = styled.div`
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 160px),
    ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.default};
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.xl};
  position: relative;
  z-index: 1;

  @media (max-width: ${theme.breakpoints.mobile}) {
    max-height: calc(100vh - ${theme.spacing.lg});
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.secondary};
  font-size: 20px;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </Overlay>,
    document.body
  );
}
