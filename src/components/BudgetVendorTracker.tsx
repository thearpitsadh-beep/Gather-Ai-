import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileX,
  Phone,
  Mail,
  Filter,
  Trash2,
  CreditCard,
  Building,
} from 'lucide-react';
import { ExpenseCategory, ExpenseItem, PaymentStatus } from '../types/event';
import { calculateBudgetSummary } from '../logic/eventCalculations';

interface BudgetVendorTrackerProps {
  totalBudget: number;
  expenses: ExpenseItem[];
  currency: string;
  onUpdateTotalBudget: (newBudget: number) => void;
  onAddExpense: (expense: ExpenseItem) => void;
  onUpdateExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
  isQuickPaymentModalOpen?: boolean;
  onCloseQuickPaymentModal?: () => void;
}

export const BudgetVendorTracker: React.FC<BudgetVendorTrackerProps> = ({
  totalBudget,
  expenses,
  currency,
  onUpdateTotalBudget,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState<ExpenseItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // New expense form
  const [newName, setNewName] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('venue');
  const [newEstimated, setNewEstimated] = useState<number>(0);
  const [newActual, setNewActual] = useState<number>(0);
  const [newPaid, setNewPaid] = useState<number>(0);
  const [newDueDate, setNewDueDate] = useState('2026-11-15');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const summary = calculateBudgetSummary(totalBudget, expenses);
  const today = '2026-10-27';

  // Filtered expenses
  const filteredExpenses = expenses.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newVendor.trim()) return;

    const actual = Number(newActual) || Number(newEstimated) || 0;
    const paid = Number(newPaid) || 0;
    let status: PaymentStatus = 'pending';
    if (paid >= actual && actual > 0) status = 'paid';
    else if (paid > 0) status = 'partial';
    else if (newDueDate < today) status = 'overdue';

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      name: newName,
      vendor: newVendor,
      category: newCategory,
      estimatedCost: Number(newEstimated) || 0,
      actualCost: actual,
      paidAmount: paid,
      dueDate: newDueDate,
      status,
      contactPhone: newPhone,
      contactEmail: newEmail,
      notes: newNotes,
      contractSigned: false,
    };

    onAddExpense(newItem);
    setIsAddModalOpen(false);

    // reset
    setNewName('');
    setNewVendor('');
    setNewEstimated(0);
    setNewActual(0);
    setNewPaid(0);
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentItem) return;

    const newPaidTotal = Math.max(0, paymentItem.paidAmount + Number(paymentAmount));
    let status: PaymentStatus = paymentItem.status;
    if (newPaidTotal >= paymentItem.actualCost) {
      status = 'paid';
    } else if (newPaidTotal > 0) {
      status = 'partial';
    }

    onUpdateExpense({
      ...paymentItem,
      paidAmount: newPaidTotal,
      status,
    });

    setPaymentItem(null);
    setPaymentAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Budget Management & Vendor Payments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track contract allocations, payment milestones, due dates, and audit remaining liabilities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Expense / Vendor
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Budget Cap
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                ${totalBudget.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Total authorized budget</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Committed / Actual
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                ${summary.totalActual.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">({summary.spendPercentage}%)</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {summary.unallocatedBudget >= 0
                ? `$${summary.unallocatedBudget.toLocaleString()} remaining to allocate`
                : `$${Math.abs(summary.unallocatedBudget).toLocaleString()} over total cap`}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Paid Deposits
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-700">
                ${summary.totalPaid.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-emerald-600">Disbursed to date</span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Pending Dues
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-amber-700">
                ${summary.remainingDue.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-amber-600">Total vendor liability</span>
          </div>
        </div>
      </div>

      {/* Category Distribution Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Category Distribution
        </h2>
        <div className="flex items-stretch gap-2.5 overflow-x-auto scrollbar-none pb-1">
          {Object.entries(summary.categoryBreakdown).map(([cat, data]) => (
            <div key={cat} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 min-w-[125px] shrink-0">
              <span className="text-xs font-bold text-slate-800 capitalize block truncate">{cat}</span>
              <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                ${data.actual.toLocaleString()}
              </span>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>{data.count} items</span>
                <span className="text-emerald-600 font-medium">
                  {Math.round((data.paid / (data.actual || 1)) * 100)}% pd
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor or expense..."
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden min-w-[180px]"
          />

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="venue">Venue</option>
              <option value="catering">Catering</option>
              <option value="photography">Photography</option>
              <option value="entertainment">Entertainment</option>
              <option value="decor">Decor</option>
              <option value="permits">Permits</option>
              <option value="logistics">Logistics</option>
              <option value="marketing">Marketing</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid in Full</option>
              <option value="partial">Partial Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue Alert</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          Showing <b>{filteredExpenses.length}</b> of {expenses.length} entries
        </span>
      </div>

      {/* Vendor & Expense Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Expense & Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Estimated</th>
                <th className="py-3 px-4">Actual Cost</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Due Date & Status</th>
                <th className="py-3 px-4">Contract</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No expenses or vendor contracts found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting filters or click above to log a new expense.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => {
                const balance = Math.max(0, item.actualCost - item.paidAmount);
                const isOverdue = item.status === 'overdue' || (item.dueDate < today && balance > 0);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{item.vendor}</span>
                        {item.contactPhone && (
                          <span className="text-slate-400 flex items-center gap-0.5">
                            • <Phone className="w-2.5 h-2.5" /> {item.contactPhone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">${item.estimatedCost.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${item.actualCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">${item.paidAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={balance > 0 ? 'text-amber-700 font-semibold' : 'text-slate-400'}>
                        ${balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">{item.dueDate}</span>
                        {isOverdue ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Overdue
                          </span>
                        ) : item.status === 'paid' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Paid
                          </span>
                        ) : item.status === 'partial' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Partial
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateExpense({ ...item, contractSigned: !item.contractSigned })
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                          item.contractSigned
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle contract signing status"
                      >
                        {item.contractSigned ? <FileCheck className="w-3 h-3 text-emerald-600" /> : <FileX className="w-3 h-3 text-slate-400" />}
                        {item.contractSigned ? 'Signed' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {balance > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentItem(item);
                              setPaymentAmount(balance);
                            }}
                            className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete expense entry"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Record Vendor Payment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Vendor: <b>{paymentItem.vendor}</b> ({paymentItem.name})
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Amount (${currency})
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentItem.actualCost}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Remaining balance due: ${Math.max(0, paymentItem.actualCost - paymentItem.paidAmount).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPaymentItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense / Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Expense & Vendor</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Expense Name / Service *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Wedding Cake & Dessert Table"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Vendor Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="e.g. Sweet Pastry Co."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="venue">Venue</option>
                    <option value="catering">Catering</option>
                    <option value="photography">Photography</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="decor">Decor & Flowers</option>
                    <option value="permits">Permits & Civic</option>
                    <option value="logistics">Logistics & Transport</option>
                    <option value="marketing">Marketing & Printing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Estimated Cost</label>
                  <input
                    type="number"
                    min="0"
                    value={newEstimated}
                    onChange={(e) => setNewEstimated(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Actual Contract Cost</label>
                  <input
                    type="number"
                    min="0"
                    value={newActual}
                    onChange={(e) => setNewActual(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Paid Deposit</label>
                  <input
                    type="number"
                    min="0"
                    value={newPaid}
                    onChange={(e) => setNewPaid(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Special Notes / Deliverables</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key contract clauses, load-in requirements, etc."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
