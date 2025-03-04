import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Download } from 'lucide-react';
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface QuestionnaireData {
  launchingToken: string;
  projectGoal: string;
  fundraisingMethod: string;
  vcConnections: string;
  capitalNeeded: string;
  launchpadListing: string;
  dexLiquidity: string;
  stakingRewards: string;
  legalSupport: string;
  aiOptimization: string;
}

export const TokenomicsQuestionnaire = () => {
  const [answers, setAnswers] = useState<QuestionnaireData>({
    launchingToken: '',
    projectGoal: '',
    fundraisingMethod: '',
    vcConnections: '',
    capitalNeeded: '',
    launchpadListing: '',
    dexLiquidity: '',
    stakingRewards: '',
    legalSupport: '',
    aiOptimization: ''
  });

  const handleAnswerChange = (question: keyof QuestionnaireData, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const questions = [
    {
      id: 'launchingToken',
      question: 'Are you launching a token for your project?',
      options: ['Yes', 'No']
    },
    {
      id: 'projectGoal',
      question: 'What is your project\'s primary goal?',
      options: ['DeFi', 'DAO', 'GameFi', 'NFT', 'Infrastructure']
    },
    {
      id: 'fundraisingMethod',
      question: 'Which fundraising method are you considering?',
      options: ['IDO', 'Private Sale', 'Launchpad', 'Fair Launch']
    },
    {
      id: 'vcConnections',
      question: 'Do you have connections with VCs or launchpads?',
      options: ['Yes', 'No', 'Need Help']
    },
    {
      id: 'capitalNeeded',
      question: 'How much capital do you need to raise?',
      options: ['<$100K', '$100K-$500K', '$500K-$1M+']
    },
    {
      id: 'launchpadListing',
      question: 'Are you looking for a launchpad listing?',
      options: ['Yes', 'No']
    },
    {
      id: 'dexLiquidity',
      question: 'Do you plan to provide liquidity on a DEX?',
      options: ['Yes', 'No', 'Not Sure']
    },
    {
      id: 'stakingRewards',
      question: 'Do you want staking and rewards for your token?',
      options: ['Yes', 'No']
    },
    {
      id: 'legalSupport',
      question: 'Do you need legal & compliance support?',
      options: ['Yes', 'No', 'Need Guidance']
    },
    {
      id: 'aiOptimization',
      question: 'Would you like to integrate UnlockFi\'s AI-based tokenomics optimization?',
      options: ['Yes', 'No']
    }
  ];

  const handleExportXLSX = () => {
    try {
      const wsData = [
        ['Question', 'Answer'],
        ...questions.map(q => [
          q.question,
          answers[q.id as keyof QuestionnaireData] || 'Not answered'
        ])
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Style headers
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "4F46E5" }, patternType: 'solid' }
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Questionnaire');
      XLSX.writeFile(wb, 'tokenomics-questionnaire.xlsx');
      
      toast.success("Questionnaire exported successfully!");
    } catch (error) {
      toast.error("Failed to export questionnaire");
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = "Question,Answer\n";
      questions.forEach(q => {
        const answer = answers[q.id as keyof QuestionnaireData] || 'Not answered';
        csvContent += `"${q.question}","${answer}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tokenomics-questionnaire.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Questionnaire exported successfully!");
    } catch (error) {
      toast.error("Failed to export questionnaire");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id}>
            <Label className="text-base">{q.question}</Label>
            <RadioGroup
              value={answers[q.id as keyof QuestionnaireData]}
              onValueChange={(value) => handleAnswerChange(q.id as keyof QuestionnaireData, value)}
              className="mt-2"
            >
              {q.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.toLowerCase()} 
                    id={`${q.id}-${option}`}
                  />
                  <Label htmlFor={`${q.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button 
          variant="outline"
          onClick={handleExportXLSX}
          className="flex-1"
        >
          <Download className="mr-2" />
          Export XLSX
        </Button>
        <Button 
          variant="outline"
          onClick={handleExportCSV}
          className="flex-1"
        >
          <Download className="mr-2" />
          Export CSV
        </Button>
      </div>
    </Card>
  );
};
