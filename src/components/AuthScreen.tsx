import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthScreenProps {
  onAuthComplete: () => void;
  onBack: () => void;
  onForgotPassword: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthComplete,
  onBack,
  onForgotPassword,
  initialMode = 'signup',
}) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const formSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUp(values.email, values.password);
        toast({
          title: "Sign up successful!",
          description: "Please check your email to verify your account.",
        });
        // We call onAuthComplete to allow the app to potentially show a "please verify" message or similar
        // The actual user state change will be handled by the auth listener
        onAuthComplete();
      } else {
        await signIn(values.email, values.password);
        // onAuthComplete will be triggered by the auth state change listener in DatingApp
      }
    } catch (err: any) {
      setError(err.message || `An error occurred during ${mode}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    form.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-4">
      <Card className="w-full max-w-md bg-white/5 border-white/10 text-white">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 hover:bg-white/10">
              <ArrowLeft />
            </Button>
            <CardTitle className="text-3xl font-bold">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} className="bg-transparent border-white/20 focus:ring-pink-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-transparent border-white/20 focus:ring-pink-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === 'login' && (
                <div className="text-right -mt-4">
                  <Button variant="link" type="button" onClick={onForgotPassword} className="text-sm text-slate-400 hover:text-slate-200 px-0 h-auto">
                    Forgot Password?
                  </Button>
                </div>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
                {isLoading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <Button variant="link" onClick={toggleMode} className="text-pink-400 hover:text-pink-300">
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
