import { Lock, Shield, FileCheck, Bell } from 'lucide-react';
import { useState } from 'react';

export default function SmartContracts() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Data Integrity',
      description: 'Immutable records of eDNA analysis results on blockchain',
    },
    {
      icon: FileCheck,
      title: 'Verified Discoveries',
      description: 'Timestamped proof of novel taxa with cryptographic verification',
    },
    {
      icon: Lock,
      title: 'Secure Sharing',
      description: 'Smart contract-based permissions for controlled data access',
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-teal-100 rounded-lg mb-3">
          <Lock className="w-6 h-6 text-teal-600" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-1">Smart Contracts</h2>
        <p className="text-xs text-gray-400">Blockchain-powered data integrity for marine research</p>
        <span className="inline-block mt-3 px-3 py-1 bg-teal-900/50 text-teal-300 rounded text-[10px] font-medium border border-teal-700">
          Coming Soon
        </span>
      </div>

      {/* Features */}
      <div className="bg-white rounded p-4 mb-4">
        <p className="text-xs font-medium text-gray-700 mb-3">Features</p>
        <div className="space-y-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-3 p-2.5 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-teal-50 rounded flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">{feature.title}</p>
                  <p className="text-[10px] text-gray-500">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscribe */}
      <div className="bg-teal-600 rounded p-4 text-white">
        <div className="flex items-start gap-2.5 mb-3">
          <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium">Be the First to Know</p>
            <p className="text-[10px] text-teal-100 mt-0.5">
              Get notified when smart contract features launch.
            </p>
          </div>
        </div>

        {!subscribed ? (
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-3 py-1.5 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-teal-300"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-white text-teal-600 rounded text-xs font-medium hover:bg-teal-50 transition-colors"
            >
              Notify Me
            </button>
          </form>
        ) : (
          <div className="bg-teal-500 rounded p-2 text-center">
            <p className="text-xs">Subscribed! We'll keep you updated.</p>
          </div>
        )}
      </div>
    </div>
  );
}
