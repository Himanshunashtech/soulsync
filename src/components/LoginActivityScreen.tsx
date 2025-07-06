import React from 'react';
import { ArrowLeft, Smartphone, ShieldAlert, Loader2, Monitor, Tablet } from 'lucide-react';
import { useLoginActivity } from '@/hooks/useLoginActivity';
import { useLoginSessions, EnrichedSession } from '@/hooks/useLoginSessions';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface LoginActivityScreenProps {
  onNavigate: (screen: string) => void;
}

const DeviceIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case 'mobile':
      return <Smartphone className="text-slate-400 mt-1" size={24} />;
    case 'tablet':
      return <Tablet className="text-slate-400 mt-1" size={24} />;
    default:
      return <Monitor className="text-slate-400 mt-1" size={24} />;
  }
};

const SessionItem: React.FC<{ session: EnrichedSession }> = ({ session }) => {
  const { device } = session;

  return (
    <li className="flex items-start space-x-4 p-4">
      <DeviceIcon type={device.device.type} />
      <div className="flex-1">
        <p className="font-semibold text-white">
          {device.browser.name || 'Unknown Browser'}
          {device.os.name && ` on ${device.os.name}`}
          {device.os.version && ` ${device.os.version}`}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Last active {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
        </p>
      </div>
    </li>
  );
};

const LoginActivityScreen: React.FC<LoginActivityScreenProps> = ({ onNavigate }) => {
  const { signOutFromAllDevices, isLoggingOut } = useLoginActivity();
  const { data: sessions, isLoading, error } = useLoginSessions();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Header */}
      <div className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center space-x-4 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('privacy-settings')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Login Activity</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Where you're logged in</h2>
            <p className="text-slate-400 mb-6">
                This is a list of devices that have logged into your account.
                You can revoke any sessions that you do not recognize by signing out of all devices.
            </p>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-6">
                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 size={32} className="animate-spin text-slate-400" />
                    </div>
                )}
                {error && (
                     <div className="p-4 text-center text-red-400">
                        Could not load session activity. Please try again later.
                     </div>
                )}
                {sessions && (
                    <ul className="divide-y divide-white/10">
                        {sessions.map((session) => (
                           <SessionItem key={session.id} session={session} />
                        ))}
                    </ul>
                )}
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Don't recognize a session?</h3>
                <p className="text-slate-400 mb-4">
                    For your security, you can sign out of all sessions across all of your devices. You will be logged out on this device as well.
                </p>
                <Button
                    onClick={() => signOutFromAllDevices()}
                    disabled={isLoggingOut}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                    {isLoggingOut ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <ShieldAlert size={20} />
                    )}
                    <span>{isLoggingOut ? 'Logging Out...' : 'Sign Out of All Devices'}</span>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginActivityScreen;
