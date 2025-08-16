import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Mail, ExternalLink, Calendar, Edit, Send, Check, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PRPitch {
  id: string;
  status: string;
  created_at: string;
  sent_at?: string;
  responded_at?: string;
  subject_line?: string;
  pitch_content?: string;
  notes?: string;
  coverage_url?: string;
  journalist?: {
    name: string;
    title: string;
    publication: string;
    email?: string;
    linkedin_url?: string;
    twitter_handle?: string;
  };
  content_item?: {
    title: string;
    content_type: string;
    summary?: string;
  };
}

interface PRPitchPreviewModalProps {
  pitch: PRPitch | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRPitchPreviewModal: React.FC<PRPitchPreviewModalProps> = ({
  pitch,
  isOpen,
  onClose
}) => {
  if (!pitch) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'responded': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'covered': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'responded': return <Check className="w-4 h-4" />;
      case 'covered': return <ExternalLink className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleEmailJournalist = () => {
    if (pitch.journalist?.email) {
      const subject = encodeURIComponent(pitch.subject_line || `Re: ${pitch.content_item?.title}`);
      const body = encodeURIComponent(pitch.pitch_content || '');
      window.open(`mailto:${pitch.journalist.email}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            PR Pitch Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(pitch.status)}>
              {getStatusIcon(pitch.status)}
              <span className="ml-2 capitalize">{pitch.status}</span>
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Created {formatDate(pitch.created_at)}
            </div>
          </div>

          {/* Journalist Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Journalist Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{pitch.journalist?.name}</h4>
                    <p className="text-sm text-muted-foreground">{pitch.journalist?.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{pitch.journalist?.publication}</span>
                </div>
              </div>
              <div className="space-y-2">
                {pitch.journalist?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{pitch.journalist.email}</span>
                  </div>
                )}
                {pitch.journalist?.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={pitch.journalist.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Content Item Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Content Item</h3>
            <div className="space-y-2">
              <h4 className="font-medium">{pitch.content_item?.title}</h4>
              <p className="text-sm text-muted-foreground">{pitch.content_item?.content_type}</p>
              {pitch.content_item?.summary && (
                <p className="text-sm">{pitch.content_item.summary}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Pitch Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Pitch Details</h3>
            {pitch.subject_line && (
              <div>
                <label className="font-medium text-sm">Subject Line:</label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{pitch.subject_line}</p>
              </div>
            )}
            {pitch.pitch_content && (
              <div>
                <label className="font-medium text-sm">Pitch Content:</label>
                <div className="text-sm mt-1 p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {pitch.pitch_content}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          {(pitch.sent_at || pitch.responded_at) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Created: {formatDate(pitch.created_at)}</span>
                  </div>
                  {pitch.sent_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span>Sent: {formatDate(pitch.sent_at)}</span>
                    </div>
                  )}
                  {pitch.responded_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Responded: {formatDate(pitch.responded_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Notes and Coverage */}
          {(pitch.notes || pitch.coverage_url) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Additional Information</h3>
                {pitch.notes && (
                  <div>
                    <label className="font-medium text-sm">Notes:</label>
                    <p className="text-sm mt-1">{pitch.notes}</p>
                  </div>
                )}
                {pitch.coverage_url && (
                  <div>
                    <label className="font-medium text-sm">Coverage URL:</label>
                    <a 
                      href={pitch.coverage_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block mt-1"
                    >
                      {pitch.coverage_url}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {pitch.journalist?.email && (
              <Button onClick={handleEmailJournalist}>
                <Mail className="w-4 h-4 mr-2" />
                Email Journalist
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PRPitchPreviewModal;