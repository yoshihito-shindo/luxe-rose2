
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
      case SubscriptionPlan.Platinum: return 'Platinum Annual';
      case SubscriptionPlan.Premium: return 'Premium 6-Month';
      case SubscriptionPlan.Standard: return 'Standard 1-Month';
      default: return 'Free Member';
    }
  };

  return (
    <div className="p-8 md:pl-32 max-w-4xl mx-auto pb-24 text-white animate-fade-in relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gold-100">マイページ</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">My Membership</p>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={onAdminMode}
            className="text-[9px] text-gray-600 hover:text-gold-500 uppercase tracking-widest transition-colors flex items-center gap-2 font-bold"
          >
            <Icons.Admin className="w-3 h-3" />
            Admin
          </button>
          <button 
            onClick={onLogout}
            className="text-[9px] text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-2 font-bold"
          >
            <Icons.Logout className="w-3 h-3" />
            Logout
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="aspect-[3/4] rounded-xl overflow-hidden border border-gold-500/30 relative shadow-2xl shadow-gold-900/20 group">
            <img src={user.imageUrls[0]} alt="Me" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 px-3 py-2 rounded text-[10px] text-gold-200 backdrop-blur-md border border-gold-500/20 uppercase tracking-[0.2em] font-black text-center">
              {user.status === 'Gold' ? 'Gold Membership' : 'Premium Member'}
            </div>
          </div>

          <div className="bg-luxe-panel p-6 rounded-2xl border border-white/5 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <Icons.Award className="w-5 h-5 text-gold-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gold-100">ステータス</h3>
             </div>
             <div className="space-y-4">
               <div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block mb-1">現在のプラン</span>
                  <span className="text-sm font-bold text-white">{getPlanName(user.subscription)}</span>
               </div>
               {user.subscriptionUntil && (
                 <div>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block mb-1">有効期限</span>
                    <span className="text-sm font-medium text-gray-400">{new Date(user.subscriptionUntil).toLocaleDateString()}</span>
                 </div>
               )}
               <button 
                onClick={() => navigate('/subscription')}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gold-400 hover:bg-gold-500 hover:text-black transition-all"
               >
                 プランを変更する
               </button>
             </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="bg-luxe-panel p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Icons.Diamond className="w-20 h-20 text-white" />
            </div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-2xl font-bold font-serif">{user.name}, {user.age}歳</h2>
              <button 
                onClick={() => navigate('/profile/edit')}
                className="text-[9px] text-gold-400 uppercase font-black border border-gold-500/30 px-5 py-2 rounded-full hover:bg-gold-500/10 transition-all tracking-widest shadow-lg"
              >
                編集する
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-y-6 text-sm text-gray-300 relative z-10">
              <div>
                <span className="block text-gray-500 text-[9px] uppercase mb-1.5 tracking-[0.2em] font-black">職業</span>
                <span className="font-medium">{user.occupation}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-[9px] uppercase mb-1.5 tracking-[0.2em] font-black">年収</span>
                <span className="text-gold-200 font-bold">{user.income}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-[9px] uppercase mb-1.5 tracking-[0.2em] font-black">居住地</span>
                <span className="font-medium">{user.location}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-[9px] uppercase mb-1.5 tracking-[0.2em] font-black">学歴</span>
                <span className="font-medium">{user.education}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-[9px] uppercase mb-1.5 tracking-[0.2em] font-black">身長</span>
                <span className="font-medium">{user.height}cm</span>
              </div>
              <div>
                <span className="block text-gray-500 text-[9px] uppercase mb-1.5 tracking-[0.2em] font-black">体型</span>
                <span className="font-medium">{user.bodyType}</span>
              </div>
            </div>
          </div>

          <div className="bg-luxe-black p-6 rounded-2xl border border-gold-500/10 shadow-lg">
            <h3 className="text-[9px] text-gold-500 uppercase font-black mb-3 tracking-[0.2em]">自己紹介</h3>
            <p className="text-gray-400 text-sm leading-relaxed italic font-light">
              "{user.bio}"
            </p>
          </div>

          <div className="bg-luxe-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-[9px] text-gold-500 uppercase font-black mb-4 tracking-[0.2em]">ライフスタイル</h3>
            <div className="flex flex-wrap gap-2">
              {user.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gold-100 font-bold tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
