
import React, { useState, useEffect } from 'react';
import { UserProfile, AccountStatus, SubscriptionPlan } from '../types';
import { Icons } from '../components/Icons';

interface AdminPanelProps {
  allUsers: UserProfile[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, onUpdateUser, onExit }) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'billing' | 'settings'>('approvals');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>(localStorage.getItem('BACKEND_URL') || '');
  const [stripePubKey, setStripePubKey] = useState<string>(localStorage.getItem('STRIPE_PUB_KEY') || '');
  
  // 保存・テスト状態の管理
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'online' | 'error'>('idle');
  const [serverInfo, setServerInfo] = useState<any>(null);

  const mockTransactions = [
    { id: 'TXN-001', user: 'タクミ', plan: 'Platinum', amount: '¥48,000', date: '2024-05-20', status: 'Succeeded' },
    { id: 'TXN-002', user: 'ケンタロウ', plan: 'Standard', amount: '¥6,500', date: '2024-05-19', status: 'Succeeded' },
    { id: 'TXN-003', user: 'ショウタ', plan: 'Premium', amount: '¥29,800', date: '2024-05-18', status: 'Succeeded' },
  ];

  const pendingUsers = allUsers.filter(u => u.status === AccountStatus.Pending || u.status === AccountStatus.Approved);

  const handleStatusChange = (user: UserProfile, newStatus: AccountStatus) => {
    onUpdateUser({ ...user, status: newStatus });
    setSelectedUser(null);
  };

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    localStorage.setItem('BACKEND_URL', backendUrl);
    localStorage.setItem('STRIPE_PUB_KEY', stripePubKey);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const testConnection = async () => {
    if (!backendUrl) {
      setTestStatus('error');
      return;
    }
    setTestStatus('testing');
    try {
      const cleanUrl = backendUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/api/health`);
      if (response.ok) {
        const data = await response.json();
        setServerInfo(data);
        setTestStatus('online');
      } else {
        throw new Error();
      }
    } catch (e) {
      setTestStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-72 bg-[#111] border-r border-white/5 flex flex-col p-8 z-20">
        <h1 className="text-xl font-bold mb-10 flex items-center gap-3">
           <Icons.Admin className="w-6 h-6 text-blue-500" /> Luxe Admin
        </h1>
        <nav className="space-y-4 flex-1">
          <button 
            onClick={() => setActiveTab('approvals')} 
            className={`w-full text-left p-4 rounded-xl text-sm transition-all flex items-center justify-between ${activeTab === 'approvals' ? 'bg-blue-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            審査管理
            {pendingUsers.length > 0 && <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full">{pendingUsers.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('billing')} 
            className={`w-full text-left p-4 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTab === 'billing' ? 'bg-blue-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Icons.Card className="w-4 h-4" /> 売上管理
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full text-left p-4 rounded-xl text-sm transition-all flex items-center gap-3 ${activeTab === 'settings' ? 'bg-blue-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Icons.Settings className="w-4 h-4" /> システム設定
          </button>
        </nav>
        <button onClick={onExit} className="text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors mt-auto">Logout System</button>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
        {activeTab === 'approvals' && (
          <div className="animate-fade-in space-y-8">
            <header>
               <h2 className="text-4xl font-bold font-serif">審査管理</h2>
               <p className="text-gray-500 mt-2">入会希望者のプロフィール審査</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {pendingUsers.length === 0 ? (
                  <div className="text-gray-600 py-10 italic">現在保留中のユーザーはいません</div>
                ) : (
                  pendingUsers.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => setSelectedUser(user)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedUser?.id === user.id ? 'bg-blue-600/10 border-blue-500' : 'bg-luxe-panel border-white/5 hover:border-white/20'}`}
                    >
                      <img src={user.imageUrls[0]} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{user.name}</span>
                          <span className="text-xs text-gray-500">{user.age}歳</span>
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.occupation}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedUser && (
                <div className="bg-luxe-panel p-8 rounded-[2.5rem] border border-white/10 animate-fade-in">
                  <img src={selectedUser.imageUrls[0]} className="w-full aspect-square rounded-2xl object-cover mb-6 shadow-2xl" />
                  <h3 className="text-2xl font-serif font-bold mb-6">{selectedUser.name}, {selectedUser.age}歳</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleStatusChange(selectedUser, AccountStatus.Pending)} className="py-4 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold uppercase">否認</button>
                    <button onClick={() => handleStatusChange(selectedUser, AccountStatus.Gold)} className="py-4 rounded-xl bg-green-600 text-white text-xs font-bold uppercase">承認</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="animate-fade-in space-y-8">
            <header>
               <h2 className="text-4xl font-bold font-serif">売上管理</h2>
               <p className="text-gray-500 mt-2">Stripe決済履歴と収益分析</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-luxe-panel p-6 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">月間売上 (MAY)</span>
                  <p className="text-3xl font-serif text-gold-400 mt-2">¥84,300</p>
               </div>
               <div className="bg-luxe-panel p-6 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">アクティブ会員</span>
                  <p className="text-3xl font-serif text-blue-400 mt-2">128名</p>
               </div>
               <div className="bg-luxe-panel p-6 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">継続率</span>
                  <p className="text-3xl font-serif text-green-400 mt-2">94.2%</p>
               </div>
            </div>
            <div className="bg-luxe-panel rounded-2xl border border-white/5 overflow-hidden">
               <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500">
                     <tr>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {mockTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                           <td className="p-4 font-mono text-[10px] text-gray-400">{tx.id}</td>
                           <td className="p-4 font-bold">{tx.user}</td>
                           <td className="p-4"><span className="px-2 py-1 bg-gold-500/10 text-gold-400 rounded text-[10px] font-bold">{tx.plan}</span></td>
                           <td className="p-4 font-bold text-white">{tx.amount}</td>
                           <td className="p-4 text-gray-500 text-xs">{tx.date}</td>
                           <td className="p-4 text-green-500 font-bold text-xs flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {tx.status}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-12 animate-fade-in">
            <header className="flex justify-between items-end">
               <div>
                 <h2 className="text-4xl font-bold font-serif">システム設定</h2>
                 <p className="text-gray-500 mt-2">API連携とインフラ設定</p>
               </div>
               <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${testStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : testStatus === 'error' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${testStatus === 'online' ? 'text-green-500' : testStatus === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
                    Backend: {testStatus === 'online' ? 'ONLINE' : testStatus === 'error' ? 'OFFLINE' : 'CHECKING...'}
                 </span>
               </div>
            </header>
            
            <div className="bg-luxe-panel p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Backend URL</label>
                    <button 
                      onClick={testConnection} 
                      disabled={testStatus === 'testing' || !backendUrl}
                      className="text-[9px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest disabled:opacity-30 flex items-center gap-1"
                    >
                      {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={backendUrl} 
                    onChange={(e) => { setBackendUrl(e.target.value); setTestStatus('idle'); }} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm focus:border-blue-500/50 outline-none transition-all"
                    placeholder="https://your-app.onrender.com"
                  />
                  {testStatus === 'online' && serverInfo && (
                    <div className="mt-3 p-4 bg-green-500/5 border border-green-500/10 rounded-xl space-y-1">
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">✓ Connection Verified</p>
                      <p className="text-[9px] text-green-400/60 font-mono">Server ID: {serverInfo.identity} | Mode: {serverInfo.stripe_mode}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Stripe Publishable Key</label>
                  <input 
                    type="text" 
                    value={stripePubKey} 
                    onChange={(e) => setStripePubKey(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm focus:border-blue-500/50 outline-none transition-all"
                    placeholder="pk_test_..."
                  />
                </div>
              </div>
              
              <button 
                onClick={handleSaveSettings}
                disabled={saveStatus !== 'idle'}
                className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
                  saveStatus === 'saving' ? 'bg-blue-900/50 text-blue-300 cursor-wait' :
                  saveStatus === 'saved' ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' :
                  'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-[0.98]'
                }`}
              >
                {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {saveStatus === 'saved' && <Icons.Verify className="w-4 h-4" />}
                {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '保存完了！' : '接続設定を保存する'}
              </button>
            </div>
            
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
               <Icons.Alert className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
               <div className="text-xs text-blue-100/70 leading-relaxed">
                  <p className="font-bold text-blue-400 mb-1">デプロイの手順：</p>
                  1. GitHubにリポジトリを作成し、全てのファイルをアップロードします。<br/>
                  2. Renderで「Web Service」を作成し、GitHubと連携します。<br/>
                  3. Renderの設定(Environment)に <span className="text-white font-mono">STRIPE_SECRET_KEY</span> を登録します。<br/>
                  4. デプロイ完了後、発行されたURLをここに貼り付けて「接続テスト」を行ってください。
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;

