import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  ShieldAlert,
  PieChart,
  Lightbulb,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Compass,
} from 'lucide-react';
import { AiIdea, EventData } from '../types/event';

interface AiAssistantHubProps {
  event: EventData;
  onAddAiIdea: (idea: AiIdea) => void;
  onApplyIdeaToPlan: (ideaId: string) => void;
}

export const AiAssistantHub: React.FC<AiAssistantHubProps> = ({
  event,
  onAddAiIdea,
  onApplyIdeaToPlan,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ideas' | 'speech' | 'contingency' | 'budget'>('ideas');

  // Ideas generator state
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasCustomVibe, setIdeasCustomVibe] = useState(event.vibe);

  // Speech generator state
  const [speechRole, setSpeechRole] = useState('Best Man / Close Friend');
  const [speakerName, setSpeakerName] = useState('Alex');
  const [honoreeName, setHonoreeName] = useState(
    event.type === 'wedding' ? 'Elena & Marcus' : event.title.split('’')[0]
  );
  const [speechTone, setSpeechTone] = useState('Warm and lightly humorous');
  const [speechAnecdotes, setSpeechAnecdotes] = useState(
    'Meeting during university, their shared love for road trips, and their mutual kindness.'
  );
  const [generatedSpeech, setGeneratedSpeech] = useState('');
  const [speechLoading, setSpeechLoading] = useState(false);
  const [copiedSpeech, setCopiedSpeech] = useState(false);

  // Contingency state
  const [contingencyLoading, setContingencyLoading] = useState(false);
  const [contingencyPlans, setContingencyPlans] = useState<any[]>([]);

  // Budget optimizer state
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetAllocations, setBudgetAllocations] = useState<any[]>([]);

  // Generate personalized ideas via backend
  const handleGenerateIdeas = async () => {
    setIdeasLoading(true);
    try {
      const res = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          title: event.title,
          vibe: ideasCustomVibe,
          guestCount: event.guests.length,
          budget: event.totalBudget,
          currency: event.currency,
        }),
      });
      const data = await res.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        data.ideas.forEach((idea: any) => {
          onAddAiIdea({
            id: idea.id || `ai-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            category: idea.category || 'theme',
            title: idea.title,
            description: idea.description,
            tags: idea.tags || [],
            applied: false,
          });
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIdeasLoading(false);
    }
  };

  // Generate customized speech
  const handleGenerateSpeech = async () => {
    setSpeechLoading(true);
    try {
      const res = await fetch('/api/ai/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          role: speechRole,
          speakerName,
          honoreeName,
          tone: speechTone,
          anecdotes: speechAnecdotes,
        }),
      });
      const data = await res.json();
      if (data.speech) {
        setGeneratedSpeech(data.speech);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSpeechLoading(false);
    }
  };

  // Generate contingency plans
  const handleGenerateContingency = async () => {
    setContingencyLoading(true);
    try {
      const res = await fetch('/api/ai/contingency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          location: event.location,
          weatherRisk: 'Rain, high wind, or vendor power supply overload',
        }),
      });
      const data = await res.json();
      if (data.plans) {
        setContingencyPlans(data.plans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContingencyLoading(false);
    }
  };

  // Generate budget allocations
  const handleOptimizeBudget = async () => {
    setBudgetLoading(true);
    try {
      const res = await fetch('/api/ai/budget-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          totalBudget: event.totalBudget,
          guestCount: event.guests.length,
        }),
      });
      const data = await res.json();
      if (data.allocations) {
        setBudgetAllocations(data.allocations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBudgetLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSpeech(true);
    setTimeout(() => setCopiedSpeech(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              GenAI Planning Assistant & Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Harness tailored Gemini AI models for theme styling, speechwriting, weather contingencies, and budget strategy.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('ideas')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'ideas'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Theme & Concept Ideas
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('speech')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'speech'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Speech & Toast Writer
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('contingency')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'contingency'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Risk & Weather Contingencies
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('budget')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === 'budget'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Smart Budget Allocator
          </button>
        </div>
      </div>

      {/* Subtab 1: Theme & Concept Ideas */}
      {activeSubTab === 'ideas' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5">
            <h2 className="text-sm font-bold text-indigo-950 mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              Tune Creative Direction
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={ideasCustomVibe}
                onChange={(e) => setIdeasCustomVibe(e.target.value)}
                placeholder="e.g. Modern Minimalist, Tuscan Olive Orchard, 80s Neon Arcade..."
                className="flex-1 bg-white rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleGenerateIdeas}
                disabled={ideasLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {ideasLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {ideasLoading ? 'Generating Personalized Ideas...' : 'Generate Fresh Ideas'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.aiIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {idea.category.replace('_', ' ')}
                    </span>
                    {idea.applied && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        In Plan
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{idea.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{idea.description}</p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {idea.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {!idea.applied && (
                    <button
                      type="button"
                      onClick={() => onApplyIdeaToPlan(idea.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Master Plan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: AI Speech & Toast Writer */}
      {activeSubTab === 'speech' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Configure Speech & Toast Parameters</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Speaker Role</label>
                <select
                  value={speechRole}
                  onChange={(e) => setSpeechRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Best Man">Best Man</option>
                  <option value="Maid of Honor">Maid of Honor</option>
                  <option value="Father of the Bride">Father / Mother</option>
                  <option value="Host / Birthday Celebrant">Host / Celebrant</option>
                  <option value="Close Friend">Close Friend</option>
                  <option value="Community Leader / Mayor">Community Leader / Mayor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Desired Tone</label>
                <select
                  value={speechTone}
                  onChange={(e) => setSpeechTone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Warm and lightly humorous">Warm & Lightly Humorous</option>
                  <option value="Tear-jerker emotional & heartfelt">Emotional & Heartfelt</option>
                  <option value="High-energy celebratory toast">High-Energy Toast</option>
                  <option value="Poetic & classic">Poetic & Classic</option>
                  <option value="Inspiring civic keynote">Inspiring Civic Keynote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Speaker Name</label>
                <input
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Honoree / Audience</label>
                <input
                  type="text"
                  value={honoreeName}
                  onChange={(e) => setHonoreeName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Cherished Memories & Anecdotes to Include
              </label>
              <textarea
                rows={3}
                value={speechAnecdotes}
                onChange={(e) => setSpeechAnecdotes(e.target.value)}
                placeholder="Share key jokes, adventures, qualities, or shared history..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateSpeech}
              disabled={speechLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {speechLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {speechLoading ? 'Drafting Custom Speech...' : 'Generate Authentic Speech Draft'}
            </button>
          </div>

          {/* Result view */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Custom Generated Speech Draft</h3>
                {generatedSpeech && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedSpeech)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedSpeech ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSpeech ? 'Copied!' : 'Copy Speech'}
                  </button>
                )}
              </div>

              {generatedSpeech ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {generatedSpeech}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Configure speaker details on the left and click "Generate Authentic Speech Draft" to create a bespoke 3-minute toast.
                </div>
              )}
            </div>

            {generatedSpeech && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Estimated reading time: ~2.5 - 3 minutes</span>
                <span>Includes pauses for audience applause</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 3: Contingency Protocols */}
      {activeSubTab === 'contingency' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Risk Assessment & Action Protocols</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated contingency matrices covering severe weather, electrical failures, and late vendor logistics.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateContingency}
                disabled={contingencyLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {contingencyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                {contingencyLoading ? 'Evaluating Contingencies...' : 'Run Risk Analysis'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(contingencyPlans.length > 0
              ? contingencyPlans
              : [
                  {
                    scenario: 'Sudden Heavy Rain or Wind Gusts',
                    trigger: 'Weather radar reports >40% chance of showers 24 hours prior',
                    protocol: [
                      'Move ceremony florals into the covered veranda by 11:00 AM',
                      'Deploy 60 matching clear-canopy umbrellas at the valet drop-off',
                      'Direct acoustic string trio to pavilion stage under awning',
                    ],
                    equipmentOrContact: 'Venue General Manager & Tent Dispatch',
                  },
                  {
                    scenario: 'Audio PA / Power Generator Failure',
                    trigger: 'Primary breaker trip or battery dip below 15%',
                    protocol: [
                      'Switch main console to secondary uninterrupted battery backup (UPS)',
                      'Use secondary battery-powered megaphone for guest announcements',
                      'Contact venue maintenance lead via two-way radio channel 4',
                    ],
                    equipmentOrContact: 'Chief Audio Engineer & Venue Facilities',
                  },
                ]
            ).map((plan, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  {plan.scenario}
                </div>
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700 block">Trigger Threshold:</span>
                  <span className="text-slate-600">{plan.trigger}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block mb-1">Execution Steps:</span>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {plan.protocol.map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Point of Contact / Gear: </span>
                  {plan.equipmentOrContact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 4: Smart Budget Allocator */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Industry-Standard Budget Allocation Model</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI calculates recommended distribution across categories for your ${event.totalBudget.toLocaleString()} budget.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOptimizeBudget}
                disabled={budgetLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {budgetLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PieChart className="w-4 h-4" />}
                {budgetLoading ? 'Optimizing Split...' : 'Optimize Budget Split'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(budgetAllocations.length > 0
              ? budgetAllocations
              : [
                  { category: 'Venue & Grounds', percentage: 32, recommendedAmount: Math.round(event.totalBudget * 0.32), strategicTip: 'Lock in seasonal off-peak bundle to reduce deposit by 15%.' },
                  { category: 'Catering & Beverages', percentage: 28, recommendedAmount: Math.round(event.totalBudget * 0.28), strategicTip: 'Confirm dietary breakdown early to avoid rush ingredient surcharges.' },
                  { category: 'Photography & Film', percentage: 12, recommendedAmount: Math.round(event.totalBudget * 0.12), strategicTip: 'Negotiate digital gallery rights and raw drone footage package.' },
                  { category: 'Entertainment & Audio', percentage: 10, recommendedAmount: Math.round(event.totalBudget * 0.10), strategicTip: 'Combine acoustic ceremony trio with DJ reception set.' },
                  { category: 'Decor & Florals', percentage: 10, recommendedAmount: Math.round(event.totalBudget * 0.10), strategicTip: 'Repurpose aisle greenery for guest dinner table centerpieces.' },
                  { category: 'Logistics & Buffer', percentage: 8, recommendedAmount: Math.round(event.totalBudget * 0.08), strategicTip: 'Essential buffer for gratuities, municipal permits and shuttle overtime.' },
                ]
            ).map((alloc, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 capitalize">{alloc.category}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {alloc.percentage}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ${alloc.recommendedAmount.toLocaleString()}
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800">Pro-Tip: </span>
                  {alloc.strategicTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
