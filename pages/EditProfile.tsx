
import React, { useState } from 'react';
import { UserProfile } from '../types.ts';
import { Icons } from '../components/Icons.tsx';
import { useNavigate } from 'react-router-dom';
import { MASTER_DATA } from '../services/geminiService.ts';

interface EditProfileProps {
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onSave }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserProfile>(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-luxe-black p-6 md:pl-32 max-w-2xl mx-auto pb-24">
      <header className="flex items-center gap-4 mb-10 pt-10">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-white transition-colors">
          <Icons.Back className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-serif text-gold-100">プロフィール編集</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
        {/* Bio Section */}
        <div className="space-y-4">
          <label className="block text-[10px] uppercase tracking-widest font-black text-gold-500">自己紹介</label>
          <textarea 
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            className="w-full bg-luxe-panel/50 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-gold-500/50 transition-all h-32 resize-none"
            placeholder="あなたの魅力を伝えてください"
          />
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-black text-gold-500">名前</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-luxe-panel/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-black text-gold-500">年齢</label>
            <input 
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
              className="w-full bg-luxe-panel/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500/50 transition-all"
            />
          </div>
        </div>

        {/* Career & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-black text-gold-500">職業</label>
            <select 
              value={formData.occupation}
              onChange={(e) => setFormData({...formData, occupation: e.target.value})}
              className="w-full bg-luxe-panel/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500/50 transition-all appearance-none"
            >
              {MASTER_DATA.occupations.map(occ => <option key={occ} value={occ} className="bg-luxe-charcoal text-white">{occ}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-black text-gold-500">居住地</label>
            <select 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-luxe-panel/50 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500/50 transition-all appearance-none"
            >
              {MASTER_DATA.locations.map(loc => <option key={loc} value={loc} className="bg-luxe-charcoal text-white">{loc}</option>)}
            </select>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-black font-black uppercase tracking-widest rounded-full shadow-lg shadow-gold-500/20 active:scale-95 transition-all mt-10"
        >
          保存する
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
