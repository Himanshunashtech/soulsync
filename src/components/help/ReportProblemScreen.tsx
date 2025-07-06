
import React from 'react';
import InfoScreen from '../InfoScreen';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ReportProblemScreenProps {
  onNavigate: (screen: string) => void;
}

const ReportProblemScreen: React.FC<ReportProblemScreenProps> = ({ onNavigate }) => {
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. We will review your report shortly.",
    });
    onNavigate('settings');
  };

  return (
    <InfoScreen title="Report a Problem" onBack={() => onNavigate('settings')}>
      <div className="space-y-6">
        <div>
          <Label htmlFor="problem-description" className="text-slate-300">Describe the problem</Label>
          <Textarea id="problem-description" placeholder="Please be as detailed as possible..." className="bg-transparent border-white/20 mt-2 min-h-[120px] focus:ring-pink-500" />
        </div>
        <Button onClick={handleSubmit} className="w-full bg-pink-500 hover:bg-pink-600">Submit Report</Button>
      </div>
    </InfoScreen>
  );
};
export default ReportProblemScreen;
