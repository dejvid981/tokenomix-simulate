
import { TokenomicsData, TokenAllocation } from '@/types/tokenomics';
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export const useTokenomicsForm = (data: TokenomicsData, onChange: (data: TokenomicsData) => void) => {
  const handleTotalSupplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    onChange({
      ...data,
      totalSupply: Number(numericValue)
    });
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newAllocations = [...data.allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      category: value
    };
    onChange({
      ...data,
      allocations: newAllocations
    });
  };

  const handleAllocationChange = (index: number, value: number) => {
    const newAllocations = [...data.allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      percentage: value
    };
    onChange({
      ...data,
      allocations: newAllocations
    });
  };

  const handleVestingChange = (index: number, field: keyof TokenAllocation['vesting'], value: any) => {
    const newAllocations = [...data.allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      vesting: {
        ...newAllocations[index].vesting,
        [field]: value
      }
    };
    onChange({
      ...data,
      allocations: newAllocations
    });
  };

  const handleAddAllocation = () => {
    const newAllocation: TokenAllocation = {
      category: "New Team",
      percentage: 0,
      vesting: { cliff: 0, duration: 12, type: "linear" }
    };
    
    onChange({
      ...data,
      allocations: [...data.allocations, newAllocation]
    });
    toast.success("New team allocation added!");
  };

  const handleRemoveAllocation = (index: number) => {
    const totalRemainingPercentage = data.allocations
      .filter((_, i) => i !== index)
      .reduce((sum, allocation) => sum + allocation.percentage, 0);

    if (totalRemainingPercentage > 100) {
      toast.error("Total allocation cannot exceed 100%");
      return;
    }

    const newAllocations = data.allocations.filter((_, i) => i !== index);
    onChange({
      ...data,
      allocations: newAllocations
    });
    toast.success("Team allocation removed!");
  };

  const handleSaveConfiguration = () => {
    try {
      localStorage.setItem('tokenomics-config', JSON.stringify(data));
      
      const totalPercentage = data.allocations.reduce((sum, allocation) => sum + allocation.percentage, 0);
      
      if (totalPercentage !== 100) {
        toast.error("Total allocation must equal 100%");
        return;
      }
      
      toast.success("Configuration saved successfully!");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const handleExportXLSX = () => {
    try {
      const wsData = [
        ['Category', 'Percentage', 'Cliff (months)', 'Vesting Duration (months)', 'Vesting Type', 'Token Amount'],
        ...data.allocations.map(a => [
          a.category,
          a.percentage,
          a.vesting.cliff,
          a.vesting.duration,
          a.vesting.type,
          (a.percentage / 100) * data.totalSupply
        ]),
        [],
        ['Project Details'],
        ['Total Supply', data.totalSupply],
        ['Market Condition', data.marketCondition]
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "4F46E5" }, patternType: 'solid' }
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, 'Tokenomics');
      XLSX.writeFile(wb, 'tokenomics-report.xlsx');
      
      toast.success("XLSX report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to export XLSX");
    }
  };

  return {
    handleTotalSupplyChange,
    handleCategoryChange,
    handleAllocationChange,
    handleVestingChange,
    handleAddAllocation,
    handleRemoveAllocation,
    handleSaveConfiguration,
    handleExportXLSX,
  };
};
