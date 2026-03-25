import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const AV_BG = ['#E1F5EE', '#E6F1FB', '#FAECE7', '#FBEAF0', '#FAEEDA', '#E3E8FC', '#FFF0E5'];
const AV_TX = ['#085041', '#0C447C', '#712B13', '#72243E', '#633806', '#2637A1', '#85421B'];

export default function ExpenseSplitter({ tripId }) {
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [members, setMembers] = useState([]); // [{ _id, name, email }]
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'log', 'settle'
  const [tripPhase, setTripPhase] = useState('pre'); // 'pre', 'live', 'done'
  
  // Add Form State
  const [addPhase, setAddPhase] = useState('pre');
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState('✈');
  const [paidBy, setPaidBy] = useState('');
  const [splitAmong, setSplitAmong] = useState([]); // array of _ids

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`/finance/data/${tripId}`);
      setExpenses(data.expenses);
      setSettlements(data.settlements);
      setTrip(data.trip);
      setTripPhase(data.trip.phase || 'pre');
      
      // Combine createdBy and members
      const allMembers = [];
      if (data.trip.createdBy) allMembers.push(data.trip.createdBy);
      if (data.trip.members) {
        data.trip.members.forEach(m => {
          if (!allMembers.find(existing => existing._id === m._id)) {
            allMembers.push(m);
          }
        });
      }
      setMembers(allMembers);
      
      // Defaults
      if (allMembers.length > 0) {
        if (!paidBy) setPaidBy(allMembers[0]._id);
        if (splitAmong.length === 0) setSplitAmong(allMembers.map(m => m._id));
      }
    } catch (err) {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) fetchData();
  }, [tripId]);

  const handleUpdateTripPhase = async (newPhase) => {
    setTripPhase(newPhase);
    try {
      await axios.put(`/finance/update-phase/${tripId}`, { phase: newPhase });
      toast.success('Trip phase updated');
    } catch (e) {
      toast.error('Failed to update phase');
    }
  };

  const handleToggleSplit = (mId) => {
    setSplitAmong(prev => 
      prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
    );
  };

  const handleAddExpense = async () => {
    if (!desc || !amt || splitAmong.length === 0) return toast.error('Fill required fields');
    
    const toastId = toast.loading('Adding expense...');
    try {
      await axios.post(`/finance/add-expense/${tripId}`, {
        desc,
        amt: Number(amt),
        paidBy,
        splitAmong,
        cat,
        phase: addPhase
      });
      toast.success('Expense added!', { id: toastId });
      setDesc('');
      setAmt('');
      fetchData(); // Reload all data accurately
      setActiveTab('log');
    } catch (e) {
      toast.error('Failed to add expense', { id: toastId });
    }
  };

  const handleSettle = async (fromId, toId, amount) => {
    const toastId = toast.loading('Recording payment...');
    try {
      await axios.post(`/finance/add-settlement/${tripId}`, {
        from: fromId,
        to: toId,
        amt: amount
      });
      toast.success('Payment recorded', { id: toastId });
      fetchData();
    } catch (e) {
      toast.error('Failed to record payment', { id: toastId });
    }
  };

  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const getAvatarStyle = (i) => ({ background: AV_BG[i % AV_BG.length], color: AV_TX[i % AV_TX.length] });

  // Computed Values
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amt, 0), [expenses]);
  
  const balances = useMemo(() => {
    const bal = {};
    members.forEach(m => bal[m._id] = 0);
    
    expenses.forEach(e => {
      const share = e.amt / e.splitAmong.length;
      if (bal[e.paidBy._id] !== undefined) bal[e.paidBy._id] += e.amt;
      e.splitAmong.forEach(sm => {
        if (bal[sm._id] !== undefined) bal[sm._id] -= share;
      });
    });
    
    settlements.forEach(s => {
      if (bal[s.from._id] !== undefined) bal[s.from._id] -= s.amt;
      if (bal[s.to._id] !== undefined) bal[s.to._id] += s.amt;
    });
    
    return bal;
  }, [members, expenses, settlements]);

  const txns = useMemo(() => {
    const cr = [], db = [];
    Object.entries(balances).forEach(([mId, b]) => {
      if (b > 0.5) cr.push({ mId, b: Math.round(b) });
      else if (b < -0.5) db.push({ mId, b: Math.round(-b) });
    });
    
    const result = [];
    let i = 0, j = 0;
    while (i < cr.length && j < db.length) {
      const a = Math.min(cr[i].b, db[j].b);
      result.push({ from: db[j].mId, to: cr[i].mId, amt: a });
      cr[i].b -= a;
      db[j].b -= a;
      if (cr[i].b < 1) i++;
      if (db[j].b < 1) j++;
    }
    return result;
  }, [balances]);

  if (loading) return <div className="text-center py-6 text-gray-500">Loading Expense data...</div>;
  if (!trip) return <div className="text-center py-6 text-red-500">Trip not found</div>;

  return (
    <div className="max-w-xl mx-auto bg-gray-50/30 rounded-3xl p-6 border border-gray-100 shadow-sm font-sans" style={{fontFamily: 'system-ui, sans-serif'}}>
      
      {/* Topbar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{trip.title}</h2>
          <p className="text-xs text-gray-500 mt-1">{members.length} members · {tripPhase.toUpperCase()}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${tripPhase === 'pre' ? 'bg-[#FAEEDA] text-[#633806]' : tripPhase === 'live' ? 'bg-[#E1F5EE] text-[#085041]' : 'bg-[#E6F1FB] text-[#0C447C]'}`}>
           <div className={`w-2 h-2 rounded-full ${tripPhase === 'pre' ? 'bg-[#854F0B]' : tripPhase === 'live' ? 'bg-[#0F6E56]' : 'bg-[#185FA5]'}`}></div>
           <span>{tripPhase === 'pre' ? 'Pre-trip' : tripPhase === 'live' ? 'Trip is live!' : 'Completed'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['add', 'log', 'settle'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${activeTab === tab ? 'bg-gray-900 text-white border-gray-900' : 'bg-transparent text-gray-500 border-gray-200'}`}
          >
            {tab === 'add' ? '+ Add' : tab === 'log' ? 'Log' : 'Settle Up'}
          </button>
        ))}
      </div>

      {/* Add Tab */}
      {activeTab === 'add' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500 mb-2">Phase</div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setAddPhase('pre')} className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${addPhase === 'pre' ? 'bg-[#FAEEDA] text-[#633806] border-[#EF9F27]' : 'bg-transparent text-gray-500 border-gray-200'}`}>Pre-trip booking</button>
              <button onClick={() => setAddPhase('live')} className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${addPhase === 'live' ? 'bg-[#E1F5EE] text-[#085041] border-[#5DCAA5]' : 'bg-transparent text-gray-500 border-gray-200'}`}>During trip</button>
            </div>

            <div className="text-xs text-gray-500 mb-1">Description</div>
            <input value={desc} onChange={e => setDesc(e.target.value)} type="text" placeholder="e.g. Flight tickets..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 mb-4" />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Amount (₹)</div>
                <input value={amt} onChange={e => setAmt(e.target.value)} type="number" min="0" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <select value={cat} onChange={e => setCat(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400">
                  <option value="✈">✈ Flight</option>
                  <option value="🏨">🏨 Hotel</option>
                  <option value="🍽">🍽 Food</option>
                  <option value="🚗">🚗 Transport</option>
                  <option value="🏄">🏄 Activity</option>
                  <option value="🛒">🛒 Shopping</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-1">Paid by</div>
            <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 mb-4">
              {members.map(m => <option key={m._id} value={m._id}>{m.name || m.email.split('@')[0]}</option>)}
            </select>

            <div className="text-xs text-gray-500 mb-2">Split with</div>
            <div className="flex flex-wrap gap-2 mb-5">
              {members.map(m => (
                <div key={m._id} onClick={() => handleToggleSplit(m._id)} className={`px-3 py-1.5 border rounded-full text-xs cursor-pointer transition-colors ${splitAmong.includes(m._id) ? 'bg-[#E6F1FB] text-[#0C447C] border-[#85B7EB]' : 'text-gray-500 border-gray-200'}`}>
                  {m.name || m.email.split('@')[0]}
                </div>
              ))}
            </div>

            <button onClick={handleAddExpense} className="w-full bg-gray-900 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-800 transition-colors">Add Expense</button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500 mb-3">Trip phase control</div>
            <div className="flex gap-2">
              <button onClick={() => handleUpdateTripPhase('pre')} className={`flex-1 py-1.5 text-xs rounded-md border ${tripPhase === 'pre' ? 'bg-gray-100 font-bold border-gray-300' : 'border-gray-200 text-gray-500'}`}>Pre-trip</button>
              <button onClick={() => handleUpdateTripPhase('live')} className={`flex-1 py-1.5 text-xs rounded-md border text-[#085041] ${tripPhase === 'live' ? 'bg-[#E1F5EE] border-[#5DCAA5] font-bold' : 'border-gray-200'}`}>Trip started</button>
              <button onClick={() => handleUpdateTripPhase('done')} className={`flex-1 py-1.5 text-xs rounded-md border text-[#0C447C] ${tripPhase === 'done' ? 'bg-[#E6F1FB] border-[#85B7EB] font-bold' : 'border-gray-200'}`}>Trip ended</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Tab */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
             <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm"><div className="text-[10px] text-gray-500 mb-1">Total spent</div><div className="text-base font-bold text-gray-900">{fmt(totalSpent)}</div></div>
             <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm"><div className="text-[10px] text-gray-500 mb-1">Per person</div><div className="text-base font-bold text-gray-900">{fmt(totalSpent / (members.length || 1))}</div></div>
             <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm"><div className="text-[10px] text-gray-500 mb-1">Expenses</div><div className="text-base font-bold text-gray-900">{expenses.length}</div></div>
          </div>

          <div className="bg-white p-4 justify-between border border-gray-100 rounded-2xl shadow-sm flex flex-col">
            {['pre', 'live'].map(ph => {
               const list = expenses.filter(e => e.phase === ph);
               return (
                 <div key={ph} className="mb-4 last:mb-0">
                   <div className="text-xs font-semibold text-gray-500 tracking-wide mb-2 uppercase">{ph === 'pre' ? 'Pre-trip bookings' : 'During trip'}</div>
                   {list.length === 0 ? <div className="text-xs text-center text-gray-400 py-3">None yet</div> : (
                     <div className="space-y-3">
                       {list.map(e => (
                         <div key={e._id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                           <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-sm border border-gray-100 flex-shrink-0">{e.cat}</div>
                           <div className="flex-1 min-w-0">
                             <div className="text-sm font-semibold text-gray-900 truncate">{e.desc}</div>
                             <div className="text-[10px] text-gray-500 mt-0.5">Split among {e.splitAmong.length} · {fmt(e.amt / e.splitAmong.length)} each</div>
                           </div>
                           <div className="text-right flex-shrink-0">
                             <div className="text-sm font-bold text-gray-900">{fmt(e.amt)}</div>
                             <div className="text-[10px] text-gray-500 mt-0.5">by {e.paidBy.name?.split(' ')[0] || e.paidBy.email?.split('@')[0]}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {/* Settle Up Tab */}
      {activeTab === 'settle' && (
        <div className="space-y-3">
          {/* Balances */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 tracking-wide mb-4 uppercase">Balances</div>
            
            <div className="space-y-3">
              {members.map((m, idx) => {
                const b = balances[m._id] || 0;
                const pos = b >= 0;
                const maxAbs = Math.max(...Object.values(balances).map(Math.abs), 1);
                const w = Math.round((Math.abs(b) / maxAbs) * 100);
                const style = getAvatarStyle(idx);
                return (
                  <div key={m._id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={style}>{(m.name || m.email)[0].toUpperCase()}</div>
                    <div className="text-xs font-semibold text-gray-900 w-16 truncate">{m.name?.split(' ')[0] || m.email?.split('@')[0]}</div>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pos ? 'bg-[#1D9E75]' : 'bg-[#E24B4A]'}`} style={{ width: `${w}%` }}></div>
                    </div>
                    <div className={`text-xs font-bold w-16 text-right ${pos ? 'text-[#0F6E56]' : 'text-[#A32D2D]'}`}>{pos ? '+' : '-'}{fmt(Math.abs(b))}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settled Txns */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 tracking-wide mb-3 uppercase">Past Settlements</div>
            {settlements.length === 0 ? <div className="text-xs text-center text-gray-400 py-2">No early payments yet</div> : (
              <div className="space-y-2">
                {settlements.map(s => {
                  const fromName = s.from.name?.split(' ')[0] || s.from.email?.split('@')[0];
                  const toName = s.to.name?.split(' ')[0] || s.to.email?.split('@')[0];
                  return (
                    <div key={s._id} className="flex items-center justify-between">
                      <div className="text-[11px] text-gray-600 flex items-center gap-1">
                        <span className="font-bold text-gray-800">{fromName}</span> paid <span className="font-bold text-gray-800">{toName}</span> <span className="text-[#0F6E56] font-bold">{fmt(s.amt)}</span>
                      </div>
                      <div className="text-[9px] bg-[#E1F5EE] text-[#085041] px-2 py-0.5 rounded-full font-bold">Done</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* To Settle */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs font-semibold text-gray-500 tracking-wide mb-3 uppercase">To Settle Up</div>
            {txns.length === 0 ? <div className="text-xs text-center text-[#085041] py-2 font-bold bg-[#E1F5EE] rounded-lg">All settled up! 🎉</div> : (
              <div className="space-y-3 border-t border-gray-50 pt-2">
                {txns.map((t, idx) => {
                  const fromMember = members.find(m => m._id === t.from);
                  const toMember = members.find(m => m._id === t.to);
                  const fromName = fromMember?.name?.split(' ')[0] || fromMember?.email?.split('@')[0];
                  const toName = toMember?.name?.split(' ')[0] || toMember?.email?.split('@')[0];
                  return (
                    <div key={idx} className="flex items-center gap-2 pb-2 last:pb-0 border-b border-gray-50 last:border-0">
                       <div className="flex-1 text-xs text-gray-600 text-center flex items-center gap-1 justify-center">
                         <span className="font-semibold">{fromName}</span> <span className="text-gray-400">→</span> <span className="font-semibold">{toName}</span>
                       </div>
                       <div className="text-sm font-bold text-[#A32D2D] w-14 text-right">{fmt(t.amt)}</div>
                       <button onClick={() => handleSettle(t.from, t.to, t.amt)} className="text-[10px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 px-2.5 py-1 rounded-md transition-colors ml-2">Mark paid</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
