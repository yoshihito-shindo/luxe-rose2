
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';

interface VerificationProps {
  onComplete: () => void;
}

type Step = 'INSTRUCTIONS' | 'CAPTURE' | 'UPLOADING' | 'PREVIEW' | 'ANALYZING' | 'PENDING' | 'APPROVED';

const Verification: React.FC<VerificationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('INSTRUCTIONS');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Simulated Upload Progress
  useEffect(() => {
    if (step === 'UPLOADING') {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('PREVIEW'), 500);
            return 100;
          }
          return p + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Handle Simulated AI Analysis Progress
  useEffect(() => {
    if (step === 'ANALYZING') {
      setAnalyzeProgress(0);
      const interval = setInterval(() => {
        setAnalyzeProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('PENDING'), 800);
            return 100;
          }
          return p + 2;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setStep('UPLOADING'); // Start "Upload" immediately after selection
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'INSTRUCTIONS':
        return (
          <div className="space-y-8 animate-fade-in text-center max-w-md mx-auto">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gold-600/10 flex items-center justify-center border border-gold-500/30">
                <Icons.Verify className="w-10 h-10 text-gold-400" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-serif text-white">本人確認認証</h2>
              <p className="text-gray-400 font-light leading-relaxed">
                コミュニティの安全性と信頼性を維持するため、<br/>
                公的な身分証明書による本人確認をお願いしております。
              </p>
            </div>
            <ul className="text-left space-y-4 bg-white/5 p-6 rounded-xl border border-white/5">
              <li className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-gold-500 flex-shrink-0 flex items-center justify-center text-[10px] text-black font-bold">1</div>
                <span className="text-gray-300">運転免許証またはパスポートをご用意ください。</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-gold-500 flex-shrink-0 flex items-center justify-center text-[10px] text-black font-bold">2</div>
                <span className="text-gray-300">書類全体が枠内に収まるように撮影してください。</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-gold-500 flex-shrink-0 flex items-center justify-center text-[10px] text-black font-bold">3</div>
                <span className="text-gray-300">暗号化された安全な通信で送信されます。</span>
              </li>
            </ul>
            <button 
              onClick={() => setStep('CAPTURE')}
              className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-gold-500/20"
            >
              撮影を開始する
            </button>
          </div>
        );

      case 'CAPTURE':
        return (
          <div className="space-y-8 animate-fade-in max-w-md mx-auto">
            <h2 className="text-2xl font-serif text-center text-white">書類を撮影</h2>
            <div 
              onClick={handleCaptureClick}
              className="relative aspect-[3/2] w-full bg-gray-900 rounded-2xl overflow-hidden border-2 border-dashed border-gold-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-gold-500/60 transition-all group"
            >
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-gold-400 opacity-60"></div>
              <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-gold-400 opacity-60"></div>
              <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-gold-400 opacity-60"></div>
              <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-gold-400 opacity-60"></div>
              
              <div className="text-center z-10 space-y-4">
                <div className="bg-gold-500/10 p-5 rounded-full inline-block group-hover:scale-110 transition-transform">
                  <Icons.Plus className="w-10 h-10 text-gold-400" />
                </div>
                <div className="text-xs text-gold-200 uppercase tracking-[0.3em] font-bold">
                  タップしてカメラを起動
                </div>
              </div>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                capture="environment"
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()} // Prevent double trigger
                className="hidden" 
              />
            </div>
            
            <p className="text-center text-gray-500 text-[10px] uppercase tracking-widest">
              表面が鮮明に写るように配置してください
            </p>
          </div>
        );

      case 'UPLOADING':
        return (
          <div className="space-y-8 animate-fade-in text-center max-w-md mx-auto">
            <div className="flex justify-center">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full bg-gold-500/20 transition-all duration-300" style={{ height: `${uploadProgress}%` }}></div>
                  <Icons.Send className="w-10 h-10 text-gold-400 animate-bounce" />
               </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-white">書類を送信中...</h2>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-gold-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                セキュア・ゲートウェイを確立中 ({uploadProgress}%)
              </p>
            </div>
          </div>
        );

      case 'PREVIEW':
        return (
          <div className="space-y-8 animate-fade-in max-w-md mx-auto">
            <h2 className="text-2xl font-serif text-center text-white">送信内容の確認</h2>
            <div className="relative aspect-[3/2] w-full bg-black rounded-2xl overflow-hidden border border-gold-500/50 shadow-2xl">
              {capturedImage && (
                <img src={capturedImage} alt="Document Preview" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span className="text-[10px] text-white font-bold uppercase tracking-widest">Ready to Verify</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { setCapturedImage(null); setStep('CAPTURE'); }}
                className="flex-1 py-4 border border-white/10 rounded-xl text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-white hover:border-white/30 transition-all"
              >
                再撮影する
              </button>
              <button 
                onClick={() => setStep('ANALYZING')}
                className="flex-1 py-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-gold-500/20"
              >
                認証リクエスト
              </button>
            </div>
          </div>
        );

      case 'ANALYZING':
        return (
          <div className="space-y-8 animate-fade-in text-center max-w-md mx-auto">
            <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="76" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                    <circle cx="80" cy="80" r="76" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={477} strokeDashoffset={477 - (477 * analyzeProgress) / 100} className="text-gold-500 transition-all duration-300 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif text-white">{analyzeProgress}%</span>
                    <span className="text-[8px] text-gold-500 uppercase tracking-widest">Scanning</span>
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-serif text-white tracking-wide">AI 照合分析中...</h2>
                <p className="text-gray-400 text-xs italic font-light">「画像からテキストデータと生体特徴を抽出中」</p>
            </div>
          </div>
        );

      case 'PENDING':
        return (
          <div className="space-y-8 animate-fade-in text-center max-w-md mx-auto">
            <div className="flex justify-center">
               <div className="relative">
                 <Icons.Diamond className="w-16 h-16 text-gold-500 animate-pulse" />
                 <div className="absolute inset-0 bg-gold-500 blur-2xl opacity-20"></div>
               </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-3xl font-serif text-white">申請完了</h2>
                <p className="text-gray-400 font-light leading-relaxed">
                  現在、コンシェルジュが提出された書類を最終確認しております。<br/>
                  通常、審査には12〜24時間ほどお時間をいただいております。
                </p>
            </div>
            <div className="p-6 border border-white/5 bg-white/5 rounded-xl">
                 <div className="flex items-center gap-2 text-gold-300 text-sm justify-center mb-1">
                    <Icons.Award className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-widest">優先審査ステータス</span>
                 </div>
                 <p className="text-[10px] text-gray-500">承認され次第、通知にてお知らせいたします。</p>
            </div>
            <button 
              onClick={() => setStep('APPROVED')}
              className="w-full py-4 text-[10px] text-gold-400 uppercase tracking-[0.4em] font-bold hover:text-white transition-colors border border-gold-500/10 rounded-lg hover:bg-gold-500/5"
            >
              [ 審査結果の確認 ]
            </button>
          </div>
        );

      case 'APPROVED':
        return (
          <div className="space-y-8 animate-fade-in text-center max-w-md mx-auto">
             <div className="flex justify-center scale-125 mb-4">
                <div className="relative">
                   <Icons.Verify className="w-20 h-20 text-green-500 fill-green-500/10 animate-bounce" />
                   <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20"></div>
                </div>
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-serif text-white">承認完了</h2>
                <p className="text-xl text-gold-200 font-light italic">Luxe & Rose メンバーシップが有効になりました。</p>
             </div>
             <button 
                onClick={onComplete}
                className="w-full py-5 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full text-black font-bold uppercase tracking-widest shadow-2xl shadow-gold-500/30 hover:scale-[1.02] active:scale-95 transition-all"
             >
                ラウンジへ入る
             </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-luxe-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-600/5 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="z-10 w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default Verification;
