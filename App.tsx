
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Discover from './pages/Discover.tsx';
import Footprints from './pages/Footprints.tsx';
import LikesReceived from './pages/LikesReceived.tsx';
import Chat from './pages/Chat.tsx';
import Landing from './pages/Landing.tsx';
import Verification from './pages/Verification.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import MyProfile from './pages/MyProfile.tsx';
import EditProfile from './pages/EditProfile.tsx';
import Subscription from './pages/Subscription.tsx';
import ProfileDetailModal from './pages/ProfileDetailModal.tsx';
import { UserProfile, Gender, AccountStatus, SubscriptionPlan, Footprint, LikeReceived } from './types.ts';
import { generateEliteProfiles } from './services/geminiService.ts';
import { Icons } from './components/Icons.tsx';

const INITIAL_ME: UserProfile = {
  id: 'me',
  name: 'タクミ',
  age: 29,
  gender: Gender.Male,
  occupation: '経営者',
  income: '2000万円~',
  education: '東京大学',
  location: '港区',
  height: 182,
  bodyType: '細マッチョ',
  bio: '価値観の合う方と洗練された時間を過ごしたいと思っています。',
  imageUrls: ['https://picsum.photos/seed/me/400/400'],
  tags: ['ゴルフ', 'ワイン', '旅行'],
  isVerified: true,
  status: AccountStatus.Gold,
  subscription: SubscriptionPlan.Free,
};

const GlobalMatchOverlay: React.FC<{ 
  me: UserProfile; 
  matchedUser: UserProfile | null; 
  onClose: () => void;
  onGoToChat: () => void;
}> = ({ me, matchedUser, onClose, onGoToChat }) => {
  if (!matchedUser) return null;
  return (
    <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in">
      <div className="relative z-10 text-center space-y-8 px-8 w-full max-w-md">
        <header className="space-y-3 animate-bounce-slow">
          <Icons.Sparkles className="w-16 h-16 mx-auto text-gold-400" />
          <h2 className="text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-100 to-gold-500 italic">MATCHED</h2>
        </header>
        <div className="flex items-center justify-center gap-6 py-6">
          <img src={me.imageUrls[0]} className="w-24 h-24 rounded-full border-2 border-gold-500 shadow-2xl" alt="Me" />
          <Icons.Heart className="w-10 h-10 text-gold-500 fill-gold-500 animate-pulse" />
          <img src={matchedUser.imageUrls[0]} className="w-24 h-24 rounded-full border-2 border-gold-500 shadow-2xl" alt="Matched" />
        </div>
        <p className="text-gray-200 text-xl">{matchedUser.name}さんとマッチングしました！</p>
        <div className="flex flex-col gap-4 w-full pt-4">
          <button onClick={onGoToChat} className="w-full py-4 bg-gold-500 rounded-full text-black font-bold uppercase tracking-widest">メッセージを送る</button>
          <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-white text-[10px] uppercase font-bold">閉じる</button>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC<{
  meProfile: UserProfile;
  setMeProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  allUsers: UserProfile[];
  loadingUsers: boolean;
  matches: UserProfile[];
  setMatches: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  footprints: Footprint[];
  setFootprints: React.Dispatch<React.SetStateAction<Footprint[]>>;
  receivedLikes: LikeReceived[];
  setReceivedLikes: React.Dispatch<React.SetStateAction<LikeReceived[]>>;
  handleLogout: () => void;
  setAppRole: (role: 'NONE' | 'USER' | 'ADMIN') => void;
}> = ({ meProfile, setMeProfile, allUsers, loadingUsers, matches, setMatches, footprints, setFootprints, receivedLikes, setReceivedLikes, handleLogout, setAppRole }) => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [justMatchedUser, setJustMatchedUser] = useState<UserProfile | null>(null);

  const targetGenderUsers = useMemo(() => {
    const matchedIds = new Set(matches.map(m => m.id));
    return allUsers.filter(u => 
      u.gender !== meProfile.gender && 
      !matchedIds.has(u.id)
    );
  }, [allUsers, matches, meProfile.gender]);

  const handleOpenDetail = (profile: UserProfile) => setSelectedProfile(profile);
  const handleCloseDetail = () => setSelectedProfile(null);

  const handleLikeInDetail = () => {
    if (!selectedProfile) return;
    const profile = selectedProfile;
    setMatches(prev => [...prev, profile]);
    setReceivedLikes(prev => prev.filter(l => l.user.id !== profile.id));
    setJustMatchedUser(profile);
    handleCloseDetail();
  };

  return (
    <div className="min-h-screen bg-luxe-black text-white font-sans">
      {!selectedProfile && <Navigation hasNewFootprints={footprints.some(f => f.isNew)} hasNewLikes={receivedLikes.some(l => l.isNew)} />}
      
      <GlobalMatchOverlay me={meProfile} matchedUser={justMatchedUser} onClose={() => setJustMatchedUser(null)} onGoToChat={() => { setJustMatchedUser(null); window.location.hash = '#/messages'; }} />
      <ProfileDetailModal profile={selectedProfile} isMatched={matches.some(m => m.id === selectedProfile?.id)} onClose={handleCloseDetail} onLike={handleLikeInDetail} />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard meProfile={meProfile} userGender={meProfile.gender} onOpenProfile={handleOpenDetail} matches={matches} setMatches={setMatches} onMatch={setJustMatchedUser} />} />
        <Route path="/discover" element={<Discover meProfile={meProfile} profiles={targetGenderUsers} loading={loadingUsers} matches={matches} setMatches={setMatches} onOpenProfile={handleOpenDetail} />} />
        <Route path="/likes" element={<LikesReceived likes={receivedLikes} setLikes={setReceivedLikes} onOpenProfile={handleOpenDetail} />} />
        <Route path="/footprints" element={<Footprints footprints={footprints} setFootprints={setFootprints} meProfile={meProfile} matches={matches} setMatches={setMatches} onOpenProfile={handleOpenDetail} />} />
        <Route path="/messages" element={<Chat matches={matches} mySubscription={meProfile.subscription} onOpenProfile={handleOpenDetail} />} />
        <Route path="/profile" element={<MyProfile user={meProfile} onAdminMode={() => setAppRole('NONE')} onLogout={handleLogout} />} />
        <Route path="/profile/edit" element={<EditProfile user={meProfile} onSave={setMeProfile} />} />
        <Route path="/subscription" element={<Subscription currentPlan={meProfile.subscription} onSelectPlan={(plan) => setMeProfile(prev => ({...prev, subscription: plan}))} />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  const [appRole, setAppRole] = useState<'NONE' | 'USER' | 'ADMIN'>('NONE');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [meProfile, setMeProfile] = useState<UserProfile>(INITIAL_ME);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<LikeReceived[]>([]);

  useEffect(() => {
    const init = async () => {
      setLoadingUsers(true);
      try {
        const [females, males] = await Promise.all([
          generateEliteProfiles(15, Gender.Female),
          generateEliteProfiles(15, Gender.Male)
        ]);
        setAllUsers([...females, ...males]);
      } catch (err) { console.error(err); } finally { setLoadingUsers(false); }
    };
    init();
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === '0000') { setIsAdminAuthenticated(true); setAppRole('ADMIN'); }
    else { alert('パスコード: 0000'); setAdminPasscode(''); }
  };

  if (appRole === 'NONE') {
    return (
      <div className="min-h-screen bg-luxe-black flex flex-col items-center justify-center p-6">
        <div className="mb-16 text-center">
          <Icons.Diamond className="w-16 h-16 text-gold-400 mx-auto mb-4" />
          <h1 className="text-4xl font-serif text-white">Luxe & Rose <span className="text-gold-500">System</span></h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <button onClick={() => setAppRole('USER')} className="h-64 bg-luxe-panel rounded-3xl border border-gold-500/10 flex flex-col items-center justify-center gap-4 hover:border-gold-500/50 transition-all">
            <Icons.User className="w-10 h-10 text-gold-400" />
            <span className="text-xl font-serif">アプリを開始</span>
          </button>
          <div className="h-64 bg-luxe-panel rounded-3xl border border-white/5 flex flex-col items-center justify-center p-8">
            <form onSubmit={handleAdminAuth} className="w-full space-y-4">
              <Icons.Admin className="w-10 h-10 text-gray-700 mx-auto" />
              <input type="password" placeholder="PASSCODE" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center text-white focus:outline-none" />
              <button type="submit" className="w-full py-2 bg-white/5 text-gray-400 text-xs rounded-xl">管理者ログイン</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (appRole === 'ADMIN') return <AdminPanel allUsers={allUsers} onUpdateUser={(u) => setAllUsers(prev => prev.map(o => o.id === u.id ? u : o))} onExit={() => setAppRole('NONE')} />;
  if (!isAuthenticated) return <Landing onEnter={() => setIsAuthenticated(true)} />;
  if (!isVerified) return <Verification onComplete={() => setIsVerified(true)} />;

  return (
    <HashRouter>
      <AppContent 
        meProfile={meProfile} setMeProfile={setMeProfile} allUsers={allUsers} loadingUsers={loadingUsers} 
        matches={matches} setMatches={setMatches} footprints={footprints} setFootprints={setFootprints} 
        receivedLikes={receivedLikes} setReceivedLikes={setReceivedLikes} handleLogout={() => setIsAuthenticated(false)} setAppRole={setAppRole}
      />
    </HashRouter>
  );
};

export default App;
