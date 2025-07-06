import React, { useState } from 'react';
import { Camera, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useNavigate } from 'react-router-dom';




interface OnboardingData {
  name: string;
  dateOfBirth: string;
  gender: string;
  interestedIn: string;
  hobbies: string[];
  favoriteFood: string;
  sports: string[];
  education: string;
  location: string;
  bio: string;
  images: File[];
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({  onComplete }) => {
  const { user } = useAuth();
  
  const { uploadImage, uploading } = useImageUpload();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    dateOfBirth: '',
    gender: '',
    interestedIn: '',
    hobbies: [],
    favoriteFood: '',
    sports: [],
    education: '',
    location: '',
    bio: '',
    images: []
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      
      // Upload images to storage
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const url = await uploadImage(image, user.id);
        if (url) {
          imageUrls.push(url);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          age,
          gender: formData.gender,
          interested_in: formData.interestedIn,
          bio: formData.bio,
          location: formData.location,
          interests: [...formData.hobbies, ...formData.sports, formData.favoriteFood, formData.education],
          images: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      onComplete();
      
       
       
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: 'hobbies' | 'sports', value: string) => {
    if (value && !formData[field].includes(value)) {
      updateFormData(field, [...formData[field], value]);
    }
  };

  const removeFromArray = (field: 'hobbies' | 'sports', value: string) => {
    updateFormData(field, formData[field].filter(item => item !== value));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).slice(0, 6 - formData.images.length);
      updateFormData('images', [...formData.images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  const steps = [
    // Step 1: Basic Info
    {
      title: "Let's start with the basics",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-2">What's your name?</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-white text-lg mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      )
    },
    // Step 2: Gender & Preferences
    {
      title: "Tell us about yourself",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-4">I am a</label>
            <div className="grid grid-cols-2 gap-4">
              {['Male', 'Female', 'Non-binary', 'Other'].map(option => (
                <button
                  key={option}
                  onClick={() => updateFormData('gender', option)}
                  className={`py-4 px-6 rounded-2xl font-semibold transition-all ${
                    formData.gender === option
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white border border-white/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-white text-lg mb-4">Interested in</label>
            <div className="grid grid-cols-2 gap-4">
              {['Male', 'Female', 'Everyone'].map(option => (
                <button
                  key={option}
                  onClick={() => updateFormData('interestedIn', option)}
                  className={`py-4 px-6 rounded-2xl font-semibold transition-all ${
                    formData.interestedIn === option
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white border border-white/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    // Step 3: Hobbies
    {
      title: "What are your hobbies?",
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {['Reading', 'Gaming', 'Traveling', 'Cooking', 'Music', 'Art', 'Dancing', 'Photography', 'Hiking', 'Yoga', 'Movies', 'Fitness'].map(hobby => (
              <button
                key={hobby}
                onClick={() => 
                  formData.hobbies.includes(hobby) 
                    ? removeFromArray('hobbies', hobby)
                    : addToArray('hobbies', hobby)
                }
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  formData.hobbies.includes(hobby)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-white/5 text-white border border-white/20'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
          <p className="text-slate-300 text-center">Select all that apply</p>
        </div>
      )
    },
    {
      title: "Food & Sports",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-4">Favorite Food</label>
            <div className="grid grid-cols-2 gap-3">
              {['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Mediterranean', 'Thai'].map(food => (
                <button
                  key={food}
                  onClick={() => updateFormData('favoriteFood', food)}
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.favoriteFood === food
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white border border-white/20'
                  }`}
                >
                  {food}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-white text-lg mb-4">Sports you enjoy</label>
            <div className="grid grid-cols-2 gap-3">
              {['Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling', 'Volleyball', 'Baseball'].map(sport => (
                <button
                  key={sport}
                  onClick={() => 
                    formData.sports.includes(sport) 
                      ? removeFromArray('sports', sport)
                      : addToArray('sports', sport)
                  }
                  className={`py-3 px-4 rounded-xl font-medium transition-all ${
                    formData.sports.includes(sport)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white border border-white/20'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Almost there!",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-2">Education Level</label>
            <select
              value={formData.education}
              onChange={(e) => updateFormData('education', e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select education level</option>
              <option value="High School">High School</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-white text-lg mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => updateFormData('location', e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              placeholder="Enter your city"
            />
          </div>
        </div>
      )
    },
    {
      title: "Tell us about yourself",
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-white text-lg mb-2">Write a short bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => updateFormData('bio', e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
              rows={6}
              placeholder="Tell potential matches about yourself..."
              maxLength={500}
            />
            <p className="text-slate-300 text-sm mt-2">{formData.bio.length}/500 characters</p>
          </div>
        </div>
      )
    },
    // Step 7: Photos
    {
      title: "Add your photos",
      component: (
        <div className="space-y-6">
          <div>
            <p className="text-white text-lg mb-4">Add at least 6 photos to get started</p>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="aspect-square relative">
                  {formData.images[index] ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(formData.images[index])}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-full bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Camera className="mx-auto text-slate-300 mb-2" size={24} />
                        <p className="text-slate-300 text-sm">Add Photo</p>
                      </div>
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-slate-300 text-sm text-center mt-4">
              {formData.images.length}/6 photos added
            </p>
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name && formData.dateOfBirth;
      case 1: return formData.gender && formData.interestedIn;
      case 2: return formData.hobbies.length > 0;
      case 3: return formData.favoriteFood;
      case 4: return formData.education && formData.location;
      case 5: return formData.bio.length > 20;
      case 6: return formData.images.length >= 6;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">Setup Profile</h1>
          <span className="text-slate-300 text-sm">{currentStep + 1}/{steps.length}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          {steps[currentStep].title}
        </h2>
        
        <div className="flex-1">
          {steps[currentStep].component}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
            currentStep === 0
              ? 'bg-white/10 text-slate-400 cursor-not-allowed'
              : 'bg-white/5 text-white hover:bg-white/10 border border-white/20'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <button
          onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={!canProceed() || loading || uploading}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
            canProceed() && !loading && !uploading
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-pink-600/40 hover:scale-105'
              : 'bg-white/10 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>
            {loading || uploading ? 'Saving...' : currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;