
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
  const [backendUrl, setBackendUrl] = useState<string>(window.location.origin);
  
  // 保存・テスト状態の管理
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

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const response = await fetch(`${backendUrl}/api/health`);
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

  useEffect(() => {
    testConnection();
  }, []);

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

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-12 animate-fade-in">
            <header className="flex justify-between items-end">
               <div>
                 <h2 className="text-4xl font-bold font-serif">システム設定</h2>
                 <p className="text-gray-500 mt-2">サーバー同期状況</p>
               </div>
               <button onClick={testConnection} className="text-[10px] font-black bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10">再読み込み</button>
            </header>
            
            <div className="bg-luxe-panel p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Backend Connectivity</span>
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${testStatus === 'online' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                       <span className="text-xl font-serif">{testStatus === 'online' ? 'ONLINE' : 'DISCONNECTED'}</span>
                    </div>
                 </div>
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Stripe Public Key</span>
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${serverInfo?.has_pub_key ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                       <span className="text-xl font-serif">{serverInfo?.has_pub_key ? 'RECOGNIZED' : 'MISSING'}</span>
                    </div>
                 </div>
              </div>

              {!serverInfo?.has_pub_key && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3 text-red-500 font-bold uppercase text-xs">
                    <Icons.Alert className="w-5 h-5" /> 公開鍵が設定されていません
                  </div>
                  <p className="text-xs text-red-100/70 leading-relaxed">
                    Renderのダッシュボードで <strong>STRIPE_PUBLISHABLE_KEY</strong> を設定してください。<br/>
                    設定後、自動的に再デプロイが行われ、決済が可能になります。
                  </p>
                  <a 
                    href="https://dashboard.render.com" 
                    target="_blank" 
                    className="inline-block px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg"
                  >
                    Renderダッシュボードを開く
                  </a>
                </div>
              )}

              <div className="pt-8 border-t border-white/5">
                <h4 className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-4">Server Diagnostics</h4>
                <pre className="bg-black/60 p-6 rounded-xl font-mono text-[10px] text-gray-400 overflow-x-auto">
                  {JSON.stringify(serverInfo || { status: 'offline' }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
