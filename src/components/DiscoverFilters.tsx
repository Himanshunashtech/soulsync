
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Filter } from 'lucide-react';

interface DiscoverFiltersProps {
  genderFilter: string;
  setGenderFilter: (value: string) => void;
  ageRange: [number, number];
  setAgeRange: (value: [number, number]) => void;
  distance: number;
  setDistance: (value: number) => void;
  interestsFilter: string;
  setInterestsFilter: (value: string) => void;
  mbtiFilter: string;
  setMbtiFilter: (value: string) => void;
  zodiacFilter: string;
  setZodiacFilter: (value: string) => void;
}

const mbtiTypes = ["Any", "ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP", "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ"];
const zodiacSigns = ["Any", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({
  genderFilter, setGenderFilter,
  ageRange, setAgeRange,
  distance, setDistance,
  interestsFilter, setInterestsFilter,
  mbtiFilter, setMbtiFilter,
  zodiacFilter, setZodiacFilter
}) => {
  return (
    // Removed outer div with px-6 mb-6
    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
      <h3 className="font-semibold mb-4 text-lg text-white flex items-center">
        <Filter size={20} className="mr-2 text-primary" />
        Filter Options
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gender Filter */}
        <div>
          <Label htmlFor="gender-filter" className="text-sm font-medium text-slate-300 mb-1 block">Show me</Label>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger id="gender-filter" className="w-full bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700">
              <SelectItem value="Everyone" className="hover:bg-slate-700">Everyone</SelectItem>
              <SelectItem value="Man" className="hover:bg-slate-700">Men</SelectItem>
              <SelectItem value="Woman" className="hover:bg-slate-700">Women</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Age Range Filter */}
        <div>
          <Label htmlFor="age-range-filter" className="text-sm font-medium text-slate-300 mb-1 block">
            Age Range: <span className="text-primary">{ageRange[0]} - {ageRange[1]}</span>
          </Label>
          <Slider
            id="age-range-filter"
            min={18}
            max={99}
            step={1}
            value={ageRange}
            onValueChange={(value) => setAgeRange(value as [number, number])}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child>span]:bg-primary [&>a]:bg-white [&>a]:border-primary"
          />
        </div>

        {/* Distance Filter */}
        <div>
          <Label htmlFor="distance-filter" className="text-sm font-medium text-slate-300 mb-1 block">
            Distance: <span className="text-primary">up to {distance} km</span>
          </Label>
          <Slider
            id="distance-filter"
            min={5}
            max={500}
            step={5}
            value={[distance]}
            onValueChange={(value) => setDistance(value[0])}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child>span]:bg-primary [&>a]:bg-white [&>a]:border-primary"
          />
        </div>

        {/* Interests Filter */}
        <div>
          <Label htmlFor="interests-filter" className="text-sm font-medium text-slate-300 mb-1 block">Interests (comma-separated)</Label>
          <Input
            id="interests-filter"
            type="text"
            value={interestsFilter}
            onChange={(e) => setInterestsFilter(e.target.value)}
            placeholder="e.g., music, gaming, travel"
            className="w-full bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary"
          />
        </div>

        {/* MBTI Filter */}
        <div>
          <Label htmlFor="mbti-filter" className="text-sm font-medium text-slate-300 mb-1 block">MBTI Personality</Label>
          <Select value={mbtiFilter} onValueChange={setMbtiFilter}>
            <SelectTrigger id="mbti-filter" className="w-full bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary">
              <SelectValue placeholder="Select MBTI" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700 max-h-60">
              {mbtiTypes.map(type => (
                <SelectItem key={type} value={type} className="hover:bg-slate-700">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zodiac Filter */}
        <div>
          <Label htmlFor="zodiac-filter" className="text-sm font-medium text-slate-300 mb-1 block">Zodiac Sign</Label>
          <Select value={zodiacFilter} onValueChange={setZodiacFilter}>
            <SelectTrigger id="zodiac-filter" className="w-full bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary">
              <SelectValue placeholder="Select Zodiac" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 text-white border-slate-700 max-h-60">
              {zodiacSigns.map(sign => (
                <SelectItem key={sign} value={sign} className="hover:bg-slate-700">{sign}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DiscoverFilters;
