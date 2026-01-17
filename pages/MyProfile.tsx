
import React from 'react';
import { UserProfile, SubscriptionPlan } from '../types';
import { Icons } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

interface MyProfileProps {
  user: UserProfile;
  onAdminMode: () => void;
  onLogout: () => void;
}

const MyProfile: React.FC<MyProfileProps> = ({ user, onAdminMode, onLogout }) => {
  const navigate = useNavigate();

  const getPlanName = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.Platinum: return 'PLATINUM';
      case SubscriptionPlan.Premium: return 'PREMIUM';
      case SubscriptionPlan.Standard: return 'STANDARD';
      default: return 'GUEST';
    }
  };

  return (
    <div className="min-h-screen bg-luxe-black pb-32 md:pl-32">
      {/* Header Visual */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img src={user.imageUrls[0]} className="w-full h-full object-cover" alt="Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxe-black via-luxe-black/20 to-transparent" />
        
        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">{user.name}</h1>
              <span className="text-2xl font-light text-gray-300">{user.age}</span>
              {user.isVerified && <Icons.Verify className="w-6 h-6 text-gold-400" />}
            </div>
            <p className="text-gold-400 font-black uppercase tracking-[0.3em] text-xs">
              {user.occupation} / {user.location}
            </p>
          </div>
          <button 
            onClick={() => navigate('/profile/edit')}
            className="bg-gold-500 text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gold-500/20 active:scale-95 transition-all"
          >
            編集する
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Membership Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-luxe-panel to-luxe-charcoal p-8 rounded-[2rem] border border-gold-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Icons.Diamond className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Membership Status</span>
                <Icons.Sparkles className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <div className="text-3xl font-serif text-gold-400 mb-1">{getPlanName(user.subscription)}</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-widest">ランク: {user.status}</div>
              </div>
              <button 
                onClick={() => navigate('/subscription')}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-gold-200 uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-all"
              >
                アップグレード
              </button>
            </div>
          </div>

          <div className="bg-luxe-panel/30 p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-[9px] text-gray-500 uppercase font-black tracking-widest">認証ステータス</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">本人確認</span>
                <span className="text-green-500 font-bold">済</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">年収証明</span>
                <span className="text-gray-600">未提出</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">独身証明</span>
                <span className="text-gray-600">未提出</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-luxe-panel/20 p-8 rounded-[2rem] border border-white/5">
            <h3 className="text-[10px] text-gold-500 uppercase font-black tracking-[0.3em] mb-6">自己紹介</h3>
            <p className="text-gray-200 text-lg font-light leading-relaxed italic">
              "{user.bio}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">年収</span>
              <p className="text-white text-xl font-bold">{user.income}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">学歴</span>
              <p className="text-white text-xl font-medium">{user.education}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">身長 / 体型</span>
              <p className="text-white text-xl font-medium">{user.height}cm / {user.bodyType}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">趣味・関心</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {user.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gold-100 font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex items-center justify-between">
            <button onClick={onAdminMode} className="text-[9px] text-gray-700 uppercase font-black hover:text-gold-500 transition-colors">System Admin</button>
            <button onClick={onLogout} className="text-[9px] text-red-900 uppercase font-black hover:text-red-500 transition-colors">Logout Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
