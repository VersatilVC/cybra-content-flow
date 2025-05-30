
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Calendar, Settings } from 'lucide-react';
import { useAutoGeneration } from '@/hooks/useAutoGeneration';

export default function AutoGenerationControls() {
  const { schedule, generateNow, updateSchedule, isGenerating, isUpdatingSchedule } = useAutoGeneration();
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>(schedule?.frequency || 'weekly');
  const [isActive, setIsActive] = useState(schedule?.is_active || false);

  const handleScheduleUpdate = () => {
    updateSchedule({ frequency, is_active: isActive });
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value as 'daily' | 'weekly' | 'monthly' | 'quarterly');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Auto-Generation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Generate Ideas Now</h3>
            <p className="text-sm text-gray-600">Immediately generate new content ideas</p>
          </div>
          <Button 
            onClick={() => generateNow()} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Now'}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Scheduled Generation
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule-active">Enable Scheduled Generation</Label>
              <Switch
                id="schedule-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div>
              <Label htmlFor="frequency">Generation Frequency</Label>
              <Select value={frequency} onValueChange={handleFrequencyChange}>
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

            {schedule && (
              <div className="text-sm text-gray-600">
                <p>Current schedule: {schedule.frequency}</p>
                <p>Next run: {new Date(schedule.next_run_at).toLocaleString()}</p>
                <p>Status: {schedule.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            )}

            <Button 
              onClick={handleScheduleUpdate}
              disabled={isUpdatingSchedule}
              variant="outline"
              className="w-full"
            >
              {isUpdatingSchedule ? 'Updating...' : 'Update Schedule'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
