import React, { memo, useCallback, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Mail, User, Building2, Edit, Send, Check, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PRPitch {
  id: string;
  status: string;
  created_at: string;
  journalist?: {
    name: string;
    title: string;
    publication: string;
    email?: string;
  };
  content_item?: {
    title: string;
    content_type: string;
  };
}

interface PRPitchesTableProps {
  pitches: PRPitch[];
  onPreview: (pitch: PRPitch) => void;
  onEmail: (pitch: PRPitch) => void;
  onStatusChange: (pitchId: string, status: string) => void;
  onJournalistClick?: (journalist: any) => void;
}

const PRPitchesTable: React.FC<PRPitchesTableProps> = memo(({
  pitches,
  onPreview,
  onEmail,
  onStatusChange,
  onJournalistClick
}) => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Journalist</TableHead>
            <TableHead>Publication</TableHead>
            <TableHead>Content Item</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pitches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      {onJournalistClick && pitch.journalist ? (
                        <button
                          onClick={() => onJournalistClick(pitch.journalist)}
                          className="font-medium text-primary hover:underline text-left"
                        >
                          {pitch.journalist.name}
                        </button>
                      ) : (
                        <p className="font-medium">{pitch.journalist?.name || 'Unknown'}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{pitch.journalist?.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{pitch.journalist?.publication || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{pitch.content_item?.title || 'Unknown'}</p>
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
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onPreview(pitch)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {pitch.journalist?.email && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onEmail(pitch)}
                        className="h-8 w-8 p-0"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                    <Select
                      value={pitch.status}
                      onValueChange={(newStatus) => onStatusChange(pitch.id, newStatus)}
                    >
                      <SelectTrigger className="w-24 h-8">
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