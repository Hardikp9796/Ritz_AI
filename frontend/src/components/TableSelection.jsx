import { useState, useEffect } from 'react';
import { Users, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const TableSelection = ({ onSelectTable, currentOrders = [] }) => {
  const [selectedType, setSelectedType] = useState('dine-in');
  const [selectedTable, setSelectedTable] = useState(null);

  // 16 tables for dine-in
  const tables = Array.from({ length: 16 }, (_, i) => ({
    id: `T${String(i + 1).padStart(2, '0')}`,
    number: i + 1,
    type: 'table'
  }));

  // 4 takeaway slots
  const takeawaySlots = Array.from({ length: 4 }, (_, i) => ({
    id: `P${String(i + 1).padStart(2, '0')}`,
    number: i + 1,
    type: 'parcel'
  }));

  const getTableStatus = (tableId) => {
    const order = currentOrders.find(o => o.table_token === tableId && o.status !== 'completed');
    return order ? 'occupied' : 'available';
  };

  const handleTableClick = (item) => {
    setSelectedTable(item.id);
    onSelectTable(item.id, item.type === 'table' ? 'dine-in' : 'takeaway');
  };

  const displayItems = selectedType === 'dine-in' ? tables : takeawaySlots;

  return (
    <div className="space-y-6" data-testid="table-selection">
      {/* Type Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedType('dine-in')}
          className={cn(
            'flex-1 p-4 rounded-lg border-2 transition-all',
            selectedType === 'dine-in'
              ? 'border-orange-500 bg-orange-500/10 text-orange-500'
              : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
          )}
          data-testid="select-dine-in"
        >
          <Users className="w-6 h-6 mx-auto mb-2" />
          <div className="font-secondary text-xl">DINE-IN</div>
          <div className="text-xs mt-1">16 Tables</div>
        </button>
        <button
          onClick={() => setSelectedType('takeaway')}
          className={cn(
            'flex-1 p-4 rounded-lg border-2 transition-all',
            selectedType === 'takeaway'
              ? 'border-green-500 bg-green-500/10 text-green-500'
              : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
          )}
          data-testid="select-takeaway"
        >
          <Package className="w-6 h-6 mx-auto mb-2" />
          <div className="font-secondary text-xl">TAKEAWAY</div>
          <div className="text-xs mt-1">4 Slots</div>
        </button>
      </div>

      {/* Table/Parcel Grid */}
      <div className="grid grid-cols-4 gap-3">
        {displayItems.map((item) => {
          const status = getTableStatus(item.id);
          const isSelected = selectedTable === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTableClick(item)}
              className={cn(
                'relative aspect-square rounded-lg border-2 transition-all p-4',
                'flex flex-col items-center justify-center',
                status === 'occupied' && 'border-red-500 bg-red-500/10',
                status === 'available' && !isSelected && 'border-slate-700 bg-slate-800 hover:border-slate-600',
                isSelected && 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20'
              )}
              data-testid={`table-${item.id}`}
            >
              <div className={cn(
                'font-secondary text-2xl mb-1',
                status === 'occupied' ? 'text-red-400' : isSelected ? 'text-orange-500' : 'text-slate-300'
              )}>
                {item.id}
              </div>
              <Badge
                variant={status === 'occupied' ? 'destructive' : 'secondary'}
                className={cn(
                  'text-xs',
                  status === 'available' && 'bg-green-500/20 text-green-400 border-green-500/50'
                )}
              >
                {status === 'occupied' ? 'Occupied' : 'Available'}
              </Badge>
            </button>
          );
        })}
      </div>

      {selectedTable && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">Selected</p>
              <p className="font-secondary text-2xl text-orange-500">{selectedTable}</p>
            </div>
            <Badge className="bg-orange-500 text-white">
              {selectedType === 'dine-in' ? 'Dine-In' : 'Takeaway'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableSelection;