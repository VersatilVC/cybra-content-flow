import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Plus, Users } from "lucide-react";
import { usePRManagement } from "@/hooks/usePRManagement";
import { useToast } from "@/hooks/use-toast";

interface AddJournalistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JournalistFormData {
  name: string;
  title: string;
  publication: string;
  email?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  type: string;
  journalist_influence: string;
  coverage_frequency: string;
  expertise_level: string;
  relationship_status: string;
  best_contact_method: string;
  coverage_type?: string;
  audience_match?: string;
  pitch_angle?: string;
  timing_considerations?: string;
  publication_tier?: string;
  publication_circulation?: string;
  competitive_coverage?: string;
}

export const AddJournalistModal: React.FC<AddJournalistModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createJournalist } = usePRManagement();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<JournalistFormData>({
    defaultValues: {
      type: 'traditional_journalist',
      journalist_influence: 'medium',
      coverage_frequency: 'monthly',
      expertise_level: 'knowledgeable',
      relationship_status: 'cold_contact',
      best_contact_method: 'email'
    }
  });

  const onSubmit = async (data: JournalistFormData) => {
    try {
      createJournalist({
        ...data,
        relevance_score: 50 // Default score for manually added journalists
      });
      
      toast({
        title: "Journalist Added",
        description: `${data.name} has been added to your journalist database.`,
      });
      
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add journalist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Add New Journalist
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Senior Tech Reporter"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="publication">Publication *</Label>
              <Input
                id="publication"
                {...register('publication', { required: 'Publication is required' })}
                placeholder="TechCrunch"
              />
              {errors.publication && (
                <p className="text-sm text-destructive mt-1">{errors.publication.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Journalist Type</Label>
              <Select onValueChange={(value) => setValue('type', value)} defaultValue="traditional_journalist">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional_journalist">Traditional Journalist</SelectItem>
                  <SelectItem value="blogger">Blogger</SelectItem>
                  <SelectItem value="influencer">Influencer</SelectItem>
                  <SelectItem value="analyst">Industry Analyst</SelectItem>
                  <SelectItem value="freelance">Freelance Writer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="best_contact_method">Best Contact Method</Label>
                <Select onValueChange={(value) => setValue('best_contact_method', value)} defaultValue="email">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  {...register('linkedin_url')}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div>
                <Label htmlFor="twitter_handle">Twitter Handle</Label>
                <Input
                  id="twitter_handle"
                  {...register('twitter_handle')}
                  placeholder="@johndoe"
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Professional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="journalist_influence">Influence Level</Label>
                <Select onValueChange={(value) => setValue('journalist_influence', value)} defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coverage_frequency">Coverage Frequency</Label>
                <Select onValueChange={(value) => setValue('coverage_frequency', value)} defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expertise_level">Expertise Level</Label>
                <Select onValueChange={(value) => setValue('expertise_level', value)} defaultValue="knowledgeable">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="knowledgeable">Knowledgeable</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="relationship_status">Relationship Status</Label>
                <Select onValueChange={(value) => setValue('relationship_status', value)} defaultValue="cold_contact">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="established">Established</SelectItem>
                    <SelectItem value="warm_lead">Warm Lead</SelectItem>
                    <SelectItem value="cold_contact">Cold Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Additional Information</h3>
            
            <div>
              <Label htmlFor="pitch_angle">Pitch Angle</Label>
              <Textarea
                id="pitch_angle"
                {...register('pitch_angle')}
                placeholder="What angle works best when pitching to this journalist?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="timing_considerations">Timing Considerations</Label>
              <Textarea
                id="timing_considerations"
                {...register('timing_considerations')}
                placeholder="Best times to reach out, deadlines, etc."
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Users className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Journalist
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};