
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

// ... (残りのApp.tsxの内容は提供されたものと同様、インポート部分のみを厳密に修正)
const INITIAL_ME: UserProfile = {
  id: 'me',
  name: 'タクミ',
  age: 29,
  gender: Gender.Male,
  occupation: '建築家',
  income: '2000万円~',
  education: '東京大学',
  location: '港区',
  height: 182,
  bodyType: '細マッチョ',
  bio: '空の境界をデザインし、ミューズを探しています。コーヒー愛好家です。',
  imageUrls: ['https://picsum.photos/seed/me/400/400', 'https://picsum.photos/seed/me2/400/400', 'https://picsum.photos/seed/me3/400/400'],
  tags: ['デザイン', 'コーヒー', '建築', 'アート'],
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
    <div className="fixed inset-0 z-[20000000] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-600/30 via-transparent to-transparent opacity-70"></div>
      <div className="relative z-10 text-center space-y-8 px-8 w-full max-w-md">
        <header className="space-y-3 animate-bounce-slow">
          <Icons.Sparkles className="w-16 h-16 mx-auto text-gold-400 drop-shadow-[0_0_25px_rgba(212,175,55,1)]" />
          <h2 className="text-6xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-100 to-gold-500 italic">MATCHED</h2>
        </header>
        <div className="flex items-center justify-center gap-6 py-6">
          <img src={me.imageUrls[0]} className="w-28 h-28 rounded-full object-cover border-4 border-gold-500 shadow-2xl animate-slide-in-left" alt="Me" />
          <Icons.Heart className="w-12 h-12 text-gold-500 fill-gold-500 animate-pulse" />
          <img src={matchedUser.imageUrls[0]} className="w-28 h-28 rounded-full object-cover border-4 border-gold-500 shadow-2xl animate-slide-in-right" alt="Matched" />
        </div>
        <p className="text-gray-200 text-xl font-serif">{matchedUser.name}さんと繋和りました</p>
        <div className="flex flex-col gap-4 w-full pt-4">
          <button onClick={onGoToChat} className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full text-black font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">メッセージを送る</button>
          <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em]">閉じる</button>
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
      !matchedIds.has(u.id) && 
      (u.status === AccountStatus.Gold || u.status === AccountStatus.Black || u.status === AccountStatus.Approved)
    );
  }, [allUsers, matches, meProfile.gender]);

  const handleOpenDetail = (profile: UserProfile) => {
    setSelectedProfile(profile);
  };

  const handleCloseDetail = () => {
    setSelectedProfile(null);
  };

  const handleLikeInDetail = () => {
    if (!selectedProfile) return;
    const profile = selectedProfile;
    
    setMatches(prev => {
      if (prev.find(p => p.id === profile.id)) return prev;
      return [profile, ...prev];
    });

    setReceivedLikes(prev => prev.filter(l => l.user.id !== profile.id));
    setJustMatchedUser(profile);
    handleCloseDetail();
  };

  const isSelectedMatched = matches.some(m => m.id === selectedProfile?.id);

  return (
    <div className="min-h-screen bg-luxe-black text-white font-sans selection:bg-gold-500 selection:text-black">
      {!selectedProfile && (
        <Navigation 
          hasNewFootprints={footprints.some(f => f.isNew)} 
          hasNewLikes={receivedLikes.some(l => l.isNew)}
        />
      )}
      
      <GlobalMatchOverlay 
        me={meProfile} 
        matchedUser={justMatchedUser} 
        onClose={() => setJustMatchedUser(null)} 
        onGoToChat={() => {
          setJustMatchedUser(null);
          window.location.hash = '#/messages';
        }}
      />

      <ProfileDetailModal 
        profile={selectedProfile} 
        isMatched={isSelectedMatched}
        onClose={handleCloseDetail} 
        onLike={handleLikeInDetail}
        onReject={handleCloseDetail}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              meProfile={meProfile}
              userGender={meProfile.gender}
              onOpenProfile={handleOpenDetail}
              matches={matches} 
              setMatches={setMatches} 
              onMatch={(p) => setJustMatchedUser(p)} 
            />
          } 
        />
        <Route 
          path="/discover" 
          element={
            <Discover 
              meProfile={meProfile}
              profiles={targetGenderUsers}
              loading={loadingUsers}
              matches={matches}
              setMatches={setMatches}
              onOpenProfile={handleOpenDetail}
            />
          } 
        />
        <Route 
          path="/likes" 
          element={
            <LikesReceived 
              likes={receivedLikes} 
              setLikes={setReceivedLikes} 
              onOpenProfile={handleOpenDetail} 
            />
          } 
        />
        <Route 
          path="/footprints" 
          element={
            <Footprints 
              footprints={footprints} 
              setFootprints={setFootprints} 
              meProfile={meProfile} 
              matches={matches} 
              setMatches={setMatches} 
              onOpenProfile={handleOpenDetail}
            />
          } 
        />
        <Route path="/messages" element={<Chat matches={matches} mySubscription={meProfile.subscription} onOpenProfile={handleOpenDetail} />} />
        <Route path="/profile" element={<MyProfile user={meProfile} onAdminMode={() => setAppRole('NONE')} onLogout={handleLogout} />} />
        <Route path="/profile/edit" element={<EditProfile user={meProfile} onSave={setMeProfile} />} />
        <Route path="/subscription" element={<Subscription currentPlan={meProfile.subscription} onSelectPlan={(plan) => {
          setMeProfile(prev => ({
            ...prev,
            subscription: plan,
            subscriptionUntil: Date.now() + 30 * 24 * 60 * 60 * 1000
          }));
        }} />} />
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

  const handleLogout = () => {
    setAppRole('NONE');
    setIsAuthenticated(false);
    setIsVerified(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoadingUsers(true);
      try {
        const [females, males] = await Promise.all([
          generateEliteProfiles(15, Gender.Female),
          generateEliteProfiles(15, Gender.Male)
        ]);
        const users = [...females, ...males];
        setAllUsers(users);

        const targetGender = INITIAL_ME.gender === Gender.Male ? Gender.Female : Gender.Male;
        const potentialVisitors = users.filter(u => u.gender === targetGender);
        
        const initialFootprints: Footprint[] = potentialVisitors.slice(0, 5).map((visitor, idx) => ({
          id: `fp-${idx}`,
          visitor,
          timestamp: Date.now() - (idx * 3600000),
          isNew: idx < 2
        }));
        setFootprints(initialFootprints);

        const initialLikes: LikeReceived[] = potentialVisitors.slice(5, 8).map((user, idx) => ({
          id: `like-${idx}`,
          user,
          timestamp: Date.now() - (idx * 1800000),
          isNew: true
        }));
        setReceivedLikes(initialLikes);

      } catch (err) {
        console.error("Initialization error", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    init();
  }, []);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === '0000') {
      setIsAdminAuthenticated(true);
      setAppRole('ADMIN');
    } else {
      alert('パスコードが正しくありません (デモ用: 0000)');
      setAdminPasscode('');
    }
  };

  if (appRole === 'NONE') {
    return (
      <div className="min-h-screen bg-luxe-black flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="mb-16 text-center">
          <Icons.Diamond className="w-16 h-16 text-gold-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          <h1 className="text-4xl font-serif text-white tracking-tighter">Luxe & Rose <span className="text-gold-500 italic">Systems</span></h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <button onClick={() => setAppRole('USER')} className="group relative h-80 bg-gradient-to-br from-luxe-charcoal to-black rounded-[2rem] border border-gold-500/10 flex flex-col items-center justify-center gap-6 hover:border-gold-500/50 transition-all duration-500 overflow-hidden shadow-2xl">
            <div className="bg-gold-500/10 p-5 rounded-full group-hover:bg-gold-500/20 transition-colors">
              <Icons.User className="w-10 h-10 text-gold-400" />
            </div>
            <div className="text-center z-10">
              <span className="block text-2xl font-serif text-white mb-1">Client Application</span>
              <span className="text-[10px] text-gold-500/60 uppercase tracking-[0.2em] font-black">会員ポータルへ</span>
            </div>
          </button>
          <div className="group relative h-80 bg-[#0a0a0a] rounded-[2rem] border border-white/5 flex flex-col items-center justify-center p-8 transition-all duration-500 hover:border-blue-500/30 shadow-2xl">
             {isAdminAuthenticated ? (
                <div className="text-center space-y-6">
                   <Icons.Admin className="w-10 h-10 text-blue-400 mx-auto" />
                   <button onClick={() => setAppRole('ADMIN')} className="w-full py-3 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20">管理画面を開く</button>
                </div>
             ) : (
                <form onSubmit={handleAdminAuth} className="w-full space-y-6">
                   <Icons.Admin className="w-10 h-10 text-gray-700 mx-auto" />
                   <input type="password" placeholder="PASSCODE" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50 transition-all text-sm tracking-[0.5em]" />
                   <button type="submit" className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/5">認証</button>
                </form>
             )}
          </div>
        </div>
      </div>
    );
  }

  if (appRole === 'ADMIN') {
    return <AdminPanel allUsers={allUsers} onUpdateUser={(u) => setAllUsers(prev => prev.map(old => old.id === u.id ? u : old))} onExit={() => setAppRole('NONE')} />;
  }

  if (!isAuthenticated) {
    return <Landing onEnter={() => setIsAuthenticated(true)} />;
  }

  if (!isVerified) {
    return <Verification onComplete={() => setIsVerified(true)} />;
  }

  return (
    <HashRouter>
      <AppContent 
        meProfile={meProfile} 
        setMeProfile={setMeProfile} 
        allUsers={allUsers} 
        loadingUsers={loadingUsers} 
        matches={matches} 
        setMatches={setMatches} 
        footprints={footprints} 
        setFootprints={setFootprints} 
        receivedLikes={receivedLikes}
        setReceivedLikes={setReceivedLikes}
        handleLogout={handleLogout} 
        setAppRole={setAppRole}
      />
    </HashRouter>
  );
};

export default App;
