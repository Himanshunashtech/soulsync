
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { DatingPreferences, DatingPreferencesFormData, GenderPreference, RelationshipType } from '@/types/preferences';

interface DatingPreferencesScreenProps {
  onNavigate: (screen: string) => void;
}

const GENDER_OPTIONS: { value: GenderPreference, label: string }[] = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'non-binary', label: 'Non-binary people' },
  { value: 'everyone', label: 'Everyone' },
];

const RELATIONSHIP_TYPE_OPTIONS: { value: RelationshipType, label: string }[] = [
  { value: 'long_term_relationship', label: 'Long-term relationship' },
  { value: 'short_term_relationship', label: 'Short-term relationship' },
  { value: 'new_friends', label: 'New friends' },
  { value: 'casual_dating', label: 'Casual dating' },
  { value: 'dont_know_yet', label: "Don't know yet" },
];

const preferencesSchema = z.object({
  interested_in_gender: z.enum(['male', 'female', 'non-binary', 'everyone']),
  min_age_preference: z.number().min(18).max(98),
  max_age_preference: z.number().min(18).max(99),
  max_distance_preference: z.number().min(1).max(500), // e.g. km
  looking_for: z.array(z.enum(['long_term_relationship', 'short_term_relationship', 'new_friends', 'casual_dating', 'dont_know_yet'])).min(1, "Select at least one option"),
}).refine(data => data.max_age_preference >= data.min_age_preference, {
  message: "Max age must be greater than or equal to min age",
  path: ["max_age_preference"],
});


const fetchDatingPreferences = async (userId: string): Promise<DatingPreferences> => {
  const { data, error } = await supabase
    .rpc('get_or_create_dating_preferences', { p_user_id: userId })
    .single(); // Assuming the RPC returns a single row or null

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Failed to fetch or create dating preferences.');
  return data as DatingPreferences;
};

const updateDatingPreferences = async ({ userId, preferences }: { userId: string, preferences: DatingPreferencesFormData }): Promise<DatingPreferences> => {
  const { data, error } = await supabase
    .from('dating_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DatingPreferences;
};

const DatingPreferencesScreen: React.FC<DatingPreferencesScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error: queryError } = useQuery<DatingPreferences, Error>({
    queryKey: ['datingPreferences', user?.id],
    queryFn: () => fetchDatingPreferences(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation<DatingPreferences, Error, { userId: string, preferences: DatingPreferencesFormData }>({
    mutationFn: updateDatingPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(['datingPreferences', user?.id], data);
      toast({ title: "Preferences Updated", description: "Your dating preferences have been saved." });
    },
    onError: (error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });

  const { control, handleSubmit, reset, watch, setValue } = useForm<DatingPreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      interested_in_gender: 'everyone',
      min_age_preference: 18,
      max_age_preference: 35,
      max_distance_preference: 50,
      looking_for: ['dont_know_yet'],
    }
  });

  useEffect(() => {
    if (preferences) {
      reset({
        interested_in_gender: preferences.interested_in_gender,
        min_age_preference: preferences.min_age_preference,
        max_age_preference: preferences.max_age_preference,
        max_distance_preference: preferences.max_distance_preference,
        looking_for: preferences.looking_for || ['dont_know_yet'],
      });
    }
  }, [preferences, reset]);

  const onSubmit = (data: DatingPreferencesFormData) => {
    if (!user) return;
    mutation.mutate({ userId: user.id, preferences: data });
  };
  
  const minAge = watch("min_age_preference");
  const maxAge = watch("max_age_preference");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6">
         <button onClick={() => onNavigate('settings')} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <p className="text-red-400">Error loading preferences: {queryError.message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['datingPreferences', user?.id] })} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white pb-24">
      <div className="p-6 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center space-x-4 sticky top-0 z-10">
        <button
          onClick={() => onNavigate('settings')}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Dating Preferences</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        <div>
          <Label htmlFor="interested_in_gender" className="text-lg font-semibold text-slate-200 mb-3 block">I'm interested in</Label>
          <Controller
            name="interested_in_gender"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-4"
              >
                {GENDER_OPTIONS.map(option => (
                  <Label
                    key={option.value}
                    htmlFor={`gender-${option.value}`}
                    className={`flex items-center space-x-2 p-4 rounded-lg border transition-colors cursor-pointer ${field.value === option.value ? 'bg-purple-500/30 border-purple-500' : 'border-white/20 hover:bg-white/10'}`}
                  >
                    <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                    <span>{option.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}
          />
        </div>

        <div>
          <Label className="text-lg font-semibold text-slate-200 mb-3 block">Age Range</Label>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="min_age_preference" className="text-slate-300">Minimum Age</Label>
                <span className="text-pink-400 font-semibold">{minAge}</span>
              </div>
              <Controller
                name="min_age_preference"
                control={control}
                render={({ field }) => (
                  <Slider
                    id="min_age_preference"
                    min={18} max={98} step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-pink-500"
                  />
                )}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="max_age_preference" className="text-slate-300">Maximum Age</Label>
                <span className="text-pink-400 font-semibold">{maxAge}</span>
              </div>
              <Controller
                name="max_age_preference"
                control={control}
                render={({ field }) => (
                  <Slider
                    id="max_age_preference"
                    min={minAge > 18 ? minAge : 18} max={99} step={1} // Ensure max is always >= min
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-pink-500"
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-lg font-semibold text-slate-200 mb-3 block">Maximum Distance</Label>
          <Controller
            name="max_distance_preference"
            control={control}
            render={({ field: {value, onChange} }) => (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="max_distance_preference" className="text-slate-300">Distance (km)</Label>
                   <span className="text-pink-400 font-semibold">{value} km</span>
                </div>
                <Slider
                  id="max_distance_preference"
                  min={1} max={500} step={1}
                  value={[value]}
                  onValueChange={(val) => onChange(val[0])}
                  className="[&>span:first-child]:h-1 [&>span:first-child]:bg-pink-500"
                />
              </div>
            )}
          />
        </div>

        <div>
          <Label className="text-lg font-semibold text-slate-200 mb-3 block">Looking for</Label>
          <Controller
            name="looking_for"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                {RELATIONSHIP_TYPE_OPTIONS.map(option => (
                  <Label
                    key={option.value}
                    htmlFor={`looking_for-${option.value}`}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      id={`looking_for-${option.value}`}
                      checked={field.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), option.value]
                          : (field.value || []).filter(v => v !== option.value);
                        // Ensure at least one is selected or default to 'dont_know_yet' if empty
                        if (newValue.length === 0) {
                            field.onChange(['dont_know_yet']);
                        } else {
                            field.onChange(newValue);
                        }
                      }}
                    />
                    <span>{option.label}</span>
                  </Label>
                ))}
              </div>
            )}
          />
        </div>
        
        <Button type="submit" disabled={mutation.isPending} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg text-base">
          {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default DatingPreferencesScreen;

