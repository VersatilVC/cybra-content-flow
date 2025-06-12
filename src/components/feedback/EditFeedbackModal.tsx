
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bug, Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';
import { FeedbackSubmission } from '@/hooks/useFeedback';

const editFeedbackSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(['bug', 'feature_request', 'improvement', 'general_feedback']),
});

type EditFeedbackFormData = z.infer<typeof editFeedbackSchema>;

interface EditFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: FeedbackSubmission | null;
  onSave: (data: { id: string; title: string; description: string; category: string }) => void;
  isUpdating: boolean;
}

const EditFeedbackModal: React.FC<EditFeedbackModalProps> = ({
  open,
  onOpenChange,
  feedback,
  onSave,
  isUpdating,
}) => {
  const form = useForm<EditFeedbackFormData>({
    resolver: zodResolver(editFeedbackSchema),
    defaultValues: {
      title: feedback?.title || '',
      description: feedback?.description || '',
      category: feedback?.category || 'general_feedback',
    },
  });

  // Reset form when feedback changes
  React.useEffect(() => {
    if (feedback) {
      form.reset({
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
      });
    }
  }, [feedback, form]);

  const handleSubmit = (data: EditFeedbackFormData) => {
    if (!feedback) return;
    
    onSave({
      id: feedback.id,
      title: data.title,
      description: data.description,
      category: data.category,
    });
    
    onOpenChange(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return <Bug className="w-4 h-4" />;
      case 'feature_request':
        return <Lightbulb className="w-4 h-4" />;
      case 'improvement':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bug':
        return 'Bug Report';
      case 'feature_request':
        return 'Feature Request';
      case 'improvement':
        return 'Improvement';
      case 'general_feedback':
        return 'General Feedback';
      default:
        return category;
    }
  };

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Feedback Submission</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter feedback title"
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your feedback in detail"
                      rows={6}
                      {...field}
                      disabled={isUpdating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isUpdating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['bug', 'feature_request', 'improvement', 'general_feedback'] as const).map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            {getCategoryLabel(category)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFeedbackModal;
