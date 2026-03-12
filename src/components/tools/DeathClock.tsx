import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Activity, Heart, Shield, Zap, RefreshCw, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { geminiService } from '../../services/geminiService';
import { ToolLayout } from '../shared/ToolLayout';

export const DeathClock: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { recordCalculation } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  
  const [age, setAge] = useState<number>(30);
  const [stress, setStress] = useState<number>(5);
  const [sleep, setSleep] = useState<number>(7);
  const [nutrition, setNutrition] = useState<number>(5);
  const [genetics, setGenetics] = useState<number>(5);
  const [environment, setEnvironment] = useState<number>(3);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    bioAge: number;
    deathDate: string;
    suggestions: string[];
    yearsRemaining: number;
  } | null>(null);

  const calculateLongevity = async () => {
    triggerClick();
    setLoading(true);
    
    // Gompertz-Makeham Formula: mu(x) = alpha * e^(beta * x) + lambda
    // Standard parameters for humans
    const alpha_std = 0.0001;
    const beta_std = 0.08;
    const lambda_std = 0.001;

    // Adjust parameters based on user input
    // Stress (1-10) increases lambda (extrinsic mortality)
    const lambda_user = lambda_std * (0.5 + stress / 5);
    
    // Sleep (hours) and Nutrition (1-10) affect beta (rate of intrinsic aging)
    // Less sleep/nutrition increases beta
    const sleepFactor = Math.max(0.8, 1.2 - (sleep - 7) * 0.05);
    const nutritionFactor = 1.2 - (nutrition / 10) * 0.4;
    const beta_user = beta_std * sleepFactor * nutritionFactor;

    // Genetics (1-10) affects alpha (initial mortality vulnerability)
    const alpha_user = alpha_std * (0.5 + genetics / 10);

    // Environment (1-10) affects lambda
    const lambda_final = lambda_user * (0.8 + environment / 10);

    // Find median lifespan X where S(X) = 0.5
    // S(x) = exp(-[ (alpha/beta)*(e^(beta*x) - 1) + lambda*x ])
    // We solve for x: (alpha/beta)*(e^(beta*x) - 1) + lambda*x = ln(2)
    
    let x = 0;
    let step = 0.1;
    let target = Math.log(2);
    let current = 0;
    
    while (current < target && x < 150) {
      x += step;
      current = (alpha_user / beta_user) * (Math.exp(beta_user * x) - 1) + lambda_final * x;
    }

    const projectedLifespan = x;
    const yearsRemaining = Math.max(0, projectedLifespan - age);
    
    // Calculate Biological Age
    // Find x_bio such that mu_std(x_bio) = mu_user(age)
    const mu_user_age = alpha_user * Math.exp(beta_user * age) + lambda_final;
    
    // mu_std(x_bio) = alpha_std * e^(beta_std * x_bio) + lambda_std
    // x_bio = ln((mu_user_age - lambda_std) / alpha_std) / beta_std
    let bioAge = Math.log(Math.max(0.00001, (mu_user_age - lambda_std) / alpha_std)) / beta_std;
    bioAge = Math.round(bioAge * 10) / 10;

    const deathDate = new Date();
    deathDate.setFullYear(deathDate.getFullYear() + yearsRemaining);
    const deathDateStr = deathDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    try {
      const suggestions = await geminiService.getDeathClockSuggestions({
        age,
        bioAge,
        deathDate: deathDateStr,
        stress,
        sleep,
        nutrition,
        genetics,
        environment
      });

      setResults({
        bioAge,
        deathDate: deathDateStr,
        suggestions,
        yearsRemaining: Math.round(yearsRemaining)
      });
      
      recordCalculation();
      triggerSuccess();
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setResults({
        bioAge,
        deathDate: deathDateStr,
        suggestions: [
          "Prioritize 7-9 hours of quality sleep to reduce the rate of biological aging.",
          "Implement a structured stress-management routine, such as daily meditation or focused breathing.",
          "Focus on a nutrient-dense diet rich in antioxidants to support cellular repair.",
          "Regular physical activity can help mitigate some environmental and genetic stressors.",
          "Minimize exposure to environmental toxins and maintain a clean living space."
        ],
        yearsRemaining: Math.round(yearsRemaining)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Death Clock"
      subtitle="Longevity analysis via the Gompertz-Makeham formula"
      onBack={onBack}
      tooltipTitle="The Math of Mortality"
      tooltipContent="The Gompertz-Makeham law states that the human death rate is the sum of an age-independent component (Makeham term) and an age-dependent component (Gompertz function), which increases exponentially with age."
    >
      <div className="max-w-4xl mx-auto w-full space-y-12">
        {!results && !loading ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="archive-card p-8 space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <label className="block">
                  <span className="col-header mb-2 block">Chronological Age</span>
                  <input 
                    type="range" min="1" max="100" value={age} 
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full accent-archive-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>1</span>
                    <span className="text-archive-accent font-bold">{age} years</span>
                    <span>100</span>
                  </div>
                </label>

                <label className="block">
                  <span className="col-header mb-2 block">Systemic Stress (1-10)</span>
                  <input 
                    type="range" min="1" max="100" value={stress * 10} 
                    onChange={(e) => setStress(parseInt(e.target.value) / 10)}
                    className="w-full accent-archive-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>Low</span>
                    <span className="text-archive-accent font-bold">{stress.toFixed(1)}</span>
                    <span>High</span>
                  </div>
                </label>

                <label className="block">
                  <span className="col-header mb-2 block">Average Sleep (Hours)</span>
                  <input 
                    type="range" min="3" max="12" step="0.5" value={sleep} 
                    onChange={(e) => setSleep(parseFloat(e.target.value))}
                    className="w-full accent-archive-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>3h</span>
                    <span className="text-archive-accent font-bold">{sleep}h</span>
                    <span>12h</span>
                  </div>
                </label>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="col-header mb-2 block">Nutrition Quality (1-10)</span>
                  <input 
                    type="range" min="1" max="100" value={nutrition * 10} 
                    onChange={(e) => setNutrition(parseInt(e.target.value) / 10)}
                    className="w-full accent-archive-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>Poor</span>
                    <span className="text-archive-accent font-bold">{nutrition.toFixed(1)}</span>
                    <span>Optimal</span>
                  </div>
                </label>

                <label className="block">
                  <span className="col-header mb-2 block">Genetic Predisposition (1-10)</span>
                  <input 
                    type="range" min="1" max="100" value={genetics * 10} 
                    onChange={(e) => setGenetics(parseInt(e.target.value) / 10)}
                    className="w-full accent-archive-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>Strong</span>
                    <span className="text-archive-accent font-bold">{genetics.toFixed(1)}</span>
                    <span>Weak</span>
                  </div>
                </label>

                <label className="block">
                  <span className="col-header mb-2 block">Environmental Hazards (1-10)</span>
                  <input 
                    type="range" min="1" max="100" value={environment * 10} 
                    onChange={(e) => setEnvironment(parseInt(e.target.value) / 10)}
                    className="w-full accent-archive-accent"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>Safe</span>
                    <span className="text-archive-accent font-bold">{environment.toFixed(1)}</span>
                    <span>Hazardous</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-8 border-t border-archive-line flex justify-center">
              <button 
                onClick={calculateLongevity}
                className="brutalist-button px-12 py-4 flex items-center gap-3 group"
              >
                <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                CALCULATE LONGEVITY
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 gap-8"
          >
            <div className="relative">
              <div className="w-16 h-16 border-2 border-archive-accent border-t-transparent animate-spin rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-xl opacity-20 italic">⌛</div>
            </div>
            <span className="handwritten text-lg text-archive-accent animate-pulse uppercase tracking-[0.3em]">Processing mortality data...</span>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="archive-card p-10 md:p-16 relative overflow-hidden border-2 border-archive-accent">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] select-none pointer-events-none text-9xl italic">MORTALITY</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-10">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.4em] font-bold">Biological Age</span>
                    <div className="flex items-baseline gap-4">
                      <h3 className="text-6xl font-serif italic">{results?.bioAge}</h3>
                      <span className="text-sm opacity-40 italic">vs {age} chronological</span>
                    </div>
                    <div className="w-full h-1 bg-archive-line mt-4">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (results?.bioAge || 0) / age * 50)}%` }}
                        className={`h-full ${results!.bioAge > age ? 'bg-red-500' : 'bg-green-500'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.4em] font-bold">Projected Death Date</span>
                    <h3 className="text-3xl font-serif italic text-archive-ink">{results?.deathDate}</h3>
                    <p className="text-sm opacity-60 italic">Approximately {results?.yearsRemaining} years remaining.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Zap className="text-archive-accent w-5 h-5" />
                    <span className="text-[10px] font-mono text-archive-accent uppercase tracking-[0.3em] font-bold">Longevity Suggestions</span>
                  </div>
                  <ul className="space-y-4">
                    {results?.suggestions.map((s, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 text-sm italic font-serif leading-relaxed"
                      >
                        <span className="text-archive-accent font-mono text-[10px] mt-1">0{i+1}</span>
                        <span>{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-16 pt-10 border-t border-archive-line flex justify-center">
                <button 
                  onClick={() => setResults(null)}
                  className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  RECALCULATE
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="archive-card p-6 flex items-start gap-4">
                <div className="p-2 bg-archive-accent/10 rounded-full text-archive-accent">
                  <Activity size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Intrinsic Aging</h4>
                  <p className="text-[10px] opacity-60 leading-relaxed">The Gompertz component representing cellular decay and metabolic exhaustion.</p>
                </div>
              </div>
              <div className="archive-card p-6 flex items-start gap-4">
                <div className="p-2 bg-archive-accent/10 rounded-full text-archive-accent">
                  <Shield size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Extrinsic Risk</h4>
                  <p className="text-[10px] opacity-60 leading-relaxed">The Makeham component representing environmental hazards and systemic stress.</p>
                </div>
              </div>
              <div className="archive-card p-6 flex items-start gap-4">
                <div className="p-2 bg-archive-accent/10 rounded-full text-archive-accent">
                  <Heart size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest">Resilience</h4>
                  <p className="text-[10px] opacity-60 leading-relaxed">Your recovery metrics (sleep/nutrition) directly modify the rate of intrinsic decay.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
};
