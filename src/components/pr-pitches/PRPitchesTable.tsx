import React, { memo, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Mail, User, Building2, Edit, Send, Check, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PRPitch } from "@/hooks/usePRManagement";

interface PRPitchTableProps {
  pitches: PRPitch[];
  onPreview: (pitch: PRPitch) => void;
  onEmail: (pitch: PRPitch) => void;
  onStatusChange: (pitchId: string, status: string) => void;
  onJournalistClick: (journalist: any) => void;
}

const PRPitchesTable = memo(({ pitches, onPreview, onEmail, onStatusChange, onJournalistClick }: PRPitchTableProps) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'responded': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'covered': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-3 h-3" />;
      case 'sent': return <Send className="w-3 h-3" />;
      case 'responded': return <Check className="w-3 h-3" />;
      case 'covered': return <ExternalLink className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  }, []);

  const getJournalistName = (journalist: any) => {
    if (!journalist) return 'Unknown';
    return typeof journalist === 'object' ? journalist.name : 'Unknown';
  };

  const getJournalistEmail = (journalist: any) => {
    if (!journalist || typeof journalist !== 'object') return null;
    return journalist.email || null;
  };

  const getJournalistPublication = (journalist: any) => {
    if (!journalist || typeof journalist !== 'object') return 'Unknown';
    return journalist.publication || 'Unknown';
  };

  const getJournalistTitle = (journalist: any) => {
    if (!journalist || typeof journalist !== 'object') return '';
    return journalist.title || '';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Journalist</TableHead>
            <TableHead>Content Item</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pitches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-col items-center">
                  <User className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No PR pitches found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            pitches.map((pitch) => (
              <TableRow key={pitch.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <button 
                        onClick={() => onJournalistClick(pitch.journalist)}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {getJournalistName(pitch.journalist)}
                      </button>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {getJournalistPublication(pitch.journalist)}
                      </div>
                      {getJournalistTitle(pitch.journalist) && (
                        <div className="text-xs text-muted-foreground">
                          {getJournalistTitle(pitch.journalist)}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{pitch.content_item?.title || 'Unknown Content'}</p>
                    <p className="text-xs text-muted-foreground">{pitch.content_item?.content_type}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(pitch.status)}>
                    {getStatusIcon(pitch.status)}
                    <span className="ml-1 capitalize">{pitch.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onPreview(pitch)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEmail(pitch)}
                      disabled={!getJournalistEmail(pitch.journalist)}
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                    <Select
                      value={pitch.status}
                      onValueChange={(newStatus) => onStatusChange(pitch.id, newStatus)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="covered">Covered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});

PRPitchesTable.displayName = 'PRPitchesTable';

export default PRPitchesTable;