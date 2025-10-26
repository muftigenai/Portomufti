import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CrudDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formId: string;
  children: React.ReactNode;
}

export const CrudDialog = ({ isOpen, onClose, title, formId, children }: CrudDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" form={formId}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};