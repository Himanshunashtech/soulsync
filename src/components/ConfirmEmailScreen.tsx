
import React from 'react';
import { MailCheck } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmEmailScreenProps {
  onContinue: () => void;
}

const ConfirmEmailScreen: React.FC<ConfirmEmailScreenProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6">
      <div className="text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-purple-500/10 rounded-full">
            <MailCheck className="w-16 h-16 text-purple-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Confirm Your Email</h1>
        <p className="text-slate-300 mb-8">
          We've sent a confirmation link to your email address. Please click the link to verify your account.
        </p>
        <Button
          onClick={onContinue}
          className="w-full py-6 text-base font-semibold transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-600/40 hover:scale-105"
        >
          I've Confirmed, Go to Login
        </Button>
        <p className="text-slate-400 text-sm mt-6">
          Didn't receive an email? Check your spam folder.
        </p>
      </div>
    </div>
  );
};

export default ConfirmEmailScreen;
