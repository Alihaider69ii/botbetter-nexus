import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ScreenKey } from "../TopNav";
import {
  ArrowRight,
  Bell,
  Bot,
  Calendar,
  ChevronRight,
  Code2,
  Languages,
  Mail,
  MessageSquare,
  Network,
  Send,
  ShieldCheck,
  Slack,
  Sparkles,
  Zap,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Video,
  DollarSign,
  Activity,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Smartphone,
  AppWindow,
  FileText,
  HeartPulse,
  Plane,
  Users,
  Receipt,
  X
} from "lucide-react";

// --------------------------------------------------------
// Gen Z Glowing Orb Core (Three.js)
// --------------------------------------------------------

const OrbCore = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const particleCount = 400;
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.5 + Math.random() * 2;
      temp[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      temp[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      temp[i * 3 + 2] = r * Math.cos(phi);
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 1.5) * 0.1;
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.position.x = THREE.MathUtils.lerp(coreRef.current.position.x, pointer.x * 0.5, 0.05);
      coreRef.current.position.y = THREE.MathUtils.lerp(coreRef.current.position.y, pointer.y * 0.5 + Math.sin(t * 1.5) * 0.1, 0.05);
    }
    
    if (shellRef.current) {
      shellRef.current.position.copy(coreRef.current!.position);
      shellRef.current.rotation.y -= delta * 0.1;
      shellRef.current.rotation.x += delta * 0.15;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.05;
      particlesRef.current.rotation.x = THREE.MathUtils.lerp(particlesRef.current.rotation.x, pointer.y * 0.2, 0.05);
      particlesRef.current.rotation.z = THREE.MathUtils.lerp(particlesRef.current.rotation.z, -pointer.x * 0.2, 0.05);
    }
  });

  return (
    <group>
      {/* Inner Glowing Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#6366f1"
          emissiveIntensity={2}
          roughness={0.2}
        />
      </mesh>

      {/* Glassy Outer Shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[1.7, 64, 64]} />
        <meshPhysicalMaterial
          color="#a855f7"
          metalness={0.1}
          roughness={0.1}
          transmission={1}
          thickness={1.5}
          ior={1.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Floating Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#c084fc" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
};

const BackgroundCanvas = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute left-[30%] top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="absolute left-[70%] top-[60%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/15 blur-[100px]" />
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={3} color="#c084fc" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#22d3ee" />
        <OrbCore />
      </Canvas>
    </div>
  );
};

// --------------------------------------------------------
// UI Components
// --------------------------------------------------------

const BentoCard = ({ children, className = "", delay = "0s" }: { children: React.ReactNode, className?: string, delay?: string }) => (
  <div 
    className={`bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl p-6 sm:p-8 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 animate-fade-in-up ${className}`}
    style={{ animationDelay: delay, animationFillMode: 'both' }}
  >
    {children}
  </div>
);

const AppBubble = ({ Icon, color, delay, className }: { Icon: any, color: string, delay: string, className: string }) => (
  <div className={`absolute animate-float bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-4 shadow-xl ${className}`} style={{ animationDelay: delay }}>
    <Icon className="w-8 h-8" style={{ color }} />
  </div>
);

// --------------------------------------------------------
// Main Landing Component
// --------------------------------------------------------

export const Landing = ({
  onNavigate,
  onShowAuth,
}: {
  onNavigate: (s: ScreenKey) => void;
  onShowAuth: (tab: "login" | "signup") => void;
}) => {
  const useCases = [
    { title: "Cracky", icon: GraduationCap, desc: "Prepare for NEET, JEE, UPSC with personalized study plans via Cracky" },
    { title: "Sellio", icon: TrendingUp, desc: "Writes listings, suggests prices, handles customer replies on Meesho/Amazon via Sellio" },
    { title: "Prepify", icon: Briefcase, desc: "Conducts mock interviews and gives real feedback in Hindi/English via Prepify" },
    { title: "Creato", icon: Video, desc: "Generates reel ideas, scripts, captions and content calendars via Creato" },
    { title: "Finio", icon: DollarSign, desc: "Creates budgets, explains SIP, saves tax — in simple Hinglish via Finio" },
    { title: "FlexAI", icon: Activity, desc: "Builds workout and diet plans based on Indian lifestyle via FlexAI" },
    { title: "Buddy", icon: Bell, desc: "Manages your schedule, sends reminders, drafts emails for you via Buddy" },
    { title: "Custom", icon: PlusCircle, desc: "Create a custom agent for any niche and earn 30% when others use it via Custom" },
  ];

  const integrations = [
    { name: "WhatsApp", icon: MessageSquare, desc: "Send & receive messages", color: "#25D366" },
    { name: "Gmail", icon: Mail, desc: "Read, draft & send emails", color: "#EA4335" },
    { name: "Google Calendar", icon: Calendar, desc: "Schedule & set reminders", color: "#4285F4" },
    { name: "Telegram", icon: Send, desc: "Automate bot messages", color: "#2AABEE" },
    { name: "Slack", icon: Slack, desc: "Team updates & notifications", color: "#E01E5A" },
    { name: "Instagram DM", icon: MessageSquare, desc: "Manage DMs & comments", color: "#E1306C" },
    { name: "Browser Extension", icon: AppWindow, desc: "Works right in your browser", color: "#8B5CF6" },
    { name: "Mobile App", icon: Smartphone, desc: "Full access on iOS & Android", color: "#10B981" },
    { name: "API Access", icon: Code2, desc: "Integrate into your own apps", color: "#F59E0B" },
  ];

  const roadmap = [
    { name: "LegalAI", icon: FileText, desc: "Legal advice in simple Hindi" },
    { name: "HealthAI", icon: HeartPulse, desc: "Symptom checker and health advice" },
    { name: "TravelAI", icon: Plane, desc: "Trip planning and booking assistant" },
    { name: "HRBot", icon: Users, desc: "Resume builder and job helper" },
    { name: "TaxBot", icon: Receipt, desc: "Indian tax filing made simple" },
  ];

  return (
    <div className="genz-theme min-h-screen bg-[#05050A] text-slate-200 overflow-hidden font-inter selection:bg-violet-500/30 selection:text-white pb-32">
      <style>{`
        .genz-theme {
          font-family: 'Inter', sans-serif;
        }
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #c084fc, #38bdf8, #f472b6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @keyframes gradient-shift { 
          0%, 100% { background-position: 0% 50%; } 
          50% { background-position: 100% 50%; } 
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* Global Background Grid */}
      <div className="fixed inset-0 z-0 bg-grid-pattern pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at center, transparent 20%, black 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 20%, black 100%)' }}></div>

      <main className="relative z-20 max-w-[1200px] mx-auto px-6">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16">
          <BackgroundCanvas />
          
          {/* Floating App Bubbles */}
          <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
            <AppBubble Icon={MessageSquare} color="#25D366" delay="0s" className="top-[20%] left-[10%]" />
            <AppBubble Icon={Mail} color="#EA4335" delay="1s" className="bottom-[30%] left-[15%]" />
            <AppBubble Icon={Slack} color="#E01E5A" delay="2s" className="top-[25%] right-[12%]" />
            <AppBubble Icon={Calendar} color="#4285F4" delay="0.5s" className="bottom-[25%] right-[18%]" />
          </div>

          <div className="relative z-20 w-full flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_10px_#a78bfa]"></span>
              <span className="text-xs font-semibold tracking-wider text-violet-200 uppercase">
                INDIA'S FIRST REGIONAL LANGUAGE AGENTIC AI PLATFORM
              </span>
            </div>

            <h1 className="font-outfit text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6 drop-shadow-2xl max-w-4xl">
              Meet Nexus. <br />
              <span className="text-slate-300">Your AI that</span> <br />
              <span className="text-gradient">does everything.</span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-10 font-medium">
              Connect Nexus to your apps — or pick a specialist agent. One platform, infinite intelligence.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button onClick={() => onShowAuth("signup")} className="group relative inline-flex items-center gap-2 rounded-full px-8 py-4 bg-white text-slate-900 font-semibold overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-200 to-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">Connect Full Platform</span>
                <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={() => onNavigate("agent")} className="inline-flex items-center gap-2 rounded-full px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors backdrop-blur-md">
                <Bot className="w-5 h-5" />
                Browse Agents
              </button>
            </div>
          </div>
        </section>

        {/* NEXUS INTELLIGENCE NETWORK */}
        <section className="py-12 mt-12">
          <BentoCard delay="0.3s" className="text-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-cyan-500/10 to-pink-500/10 blur-xl"></div>
            <div className="relative z-10">
              <h2 className="font-outfit text-xl sm:text-2xl font-semibold text-white mb-8 tracking-tight">
                NEXUS INTELLIGENCE NETWORK
                <span className="block text-sm text-slate-400 mt-2 font-normal">Every agent, every task — orchestrated in real time.</span>
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">NEXUS</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">CORE ENGINE</div>
                  </div>
                </div>
                
                <div className="hidden md:flex h-1 flex-1 max-w-[100px] bg-gradient-to-r from-violet-500/50 to-cyan-500/50 relative rounded-full">
                  <div className="absolute top-1/2 left-0 w-3 h-3 bg-white rounded-full -translate-y-1/2 shadow-[0_0_10px_white] animate-[ping_1.5s_ease-in-out_infinite]"></div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Buddy</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">PERSONAL ASSISTANT</div>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        </section>

        {/* WHY BOTBETTER */}
        <section className="py-12">
          <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="font-outfit text-4xl sm:text-5xl font-bold text-white mb-6">WHY BOTBETTER</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Built because AI should work <span className="text-white font-semibold">FOR</span> you — not the other way around.
            </p>
          </div>
          
          <BentoCard delay="0.5s" className="max-w-4xl mx-auto">
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              We were tired of switching between 10 different AI tools, copy-pasting prompts, and still doing everything manually. So we built Nexus — one agentic platform that actually executes.
            </p>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-16 h-16 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <h3 className="font-outfit text-xl font-semibold text-white mb-2">The Core Difference</h3>
                <p className="text-slate-300">
                  It can automate anything. You just have to prompt it. It does not need to be on the context window. <strong className="text-white">You can close it, and you get a notification when the work is done.</strong>
                </p>
              </div>
            </div>
          </BentoCard>
        </section>

        {/* THE OLD WAY VS BOTBETTER WAY */}
        <section className="py-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <BentoCard delay="0.6s" className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent hover:border-red-500/40">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white">THE OLD WAY</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {["ChatGPT", "Gemini", "Canva AI", "Notion AI", "Copy.ai", "Jasper"].map(app => (
                  <span key={app} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-400">{app}</span>
                ))}
              </div>
              
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Switch between 10+ different tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Copy-paste your prompts every time</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>No memory, no context, no execution</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>Pay subscriptions to 5 different apps</span>
                </li>
              </ul>
            </BentoCard>

            <BentoCard delay="0.7s" className="border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-transparent hover:border-violet-500/50 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-violet-500/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white">THE BOTBETTER WAY</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {["Buddy", "Prepify", "Sellio", "Cracky", "Creato", "Finio"].map(app => (
                  <span key={app} className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-lg text-sm text-violet-200 font-medium">{app}</span>
                ))}
              </div>
              
              <div className="mb-6 font-outfit text-xl font-semibold text-white">
                ⚡ NEXUS. One platform. All agents. Every task.
              </div>
              
              <ul className="space-y-4 text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <span>One platform for all your AI needs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <span>Agents that remember you and execute</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <span>Connected to your apps — WhatsApp, Gmail</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                  <span>Start free, scale when you're ready</span>
                </li>
              </ul>
            </BentoCard>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-12">
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <h2 className="font-outfit text-4xl sm:text-5xl font-bold text-white mb-4">USE CASES</h2>
            <p className="text-lg text-slate-400 max-w-2xl">
              What you can do with BotBetter. Built for real problems that real Indians face every day.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc, i) => (
              <BentoCard key={i} delay={`${0.8 + i * 0.1}s`} className="p-6 flex flex-col hover:-translate-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <uc.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-outfit text-xl font-bold text-white mb-3">{uc.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{uc.desc}</p>
              </BentoCard>
            ))}
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="py-12">
          <BentoCard delay="1.0s" className="overflow-hidden relative">
            <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="mb-12 relative z-10">
              <h2 className="font-outfit text-4xl sm:text-5xl font-bold text-white mb-4">INTEGRATIONS</h2>
              <p className="text-lg text-slate-400 max-w-2xl">
                Works with your favorite apps. Connect Nexus to the tools you already use — no switching required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {integrations.map((app, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${app.color}20` }}>
                    <app.icon className="w-6 h-6" style={{ color: app.color }} />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-white">{app.name}</h3>
                    <p className="text-xs text-slate-400">{app.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </section>

        {/* ROADMAP & ACCESS MODES */}
        <section className="py-12 grid lg:grid-cols-[1fr_1.2fr] gap-8">
          <BentoCard delay="1.1s">
            <h2 className="font-outfit text-3xl font-bold text-white mb-2">ROADMAP</h2>
            <p className="text-sm text-slate-400 mb-8">
              We're just getting started. New specialist agents launching every month — each one trained for a specific Indian use case.
            </p>
            
            <div className="space-y-4 mb-8">
              {roadmap.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-violet-300" />
                  </div>
                  <div>
                    <div className="font-outfit font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
              Request an agent
            </button>
          </BentoCard>

          <BentoCard delay="1.2s" className="bg-gradient-to-br from-violet-900/20 to-transparent">
            <h2 className="font-outfit text-3xl font-bold text-white mb-2">ACCESS MODES</h2>
            <p className="text-sm text-slate-400 mb-8">
              Three ways to use BotBetter
            </p>
            
            <div className="space-y-4">
              <div className="p-6 bg-violet-500/20 border border-violet-500/30 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                <div className="text-4xl font-outfit font-black text-violet-500/20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform">01</div>
                <h3 className="font-outfit text-2xl font-bold text-white mb-2">Full platform</h3>
                <p className="text-sm text-violet-200">Nexus + all 5 specialist agents working together.</p>
              </div>
              
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-white/20">
                <div className="text-4xl font-outfit font-black text-white/5 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform">02</div>
                <h3 className="font-outfit text-xl font-bold text-white mb-2">Single agent</h3>
                <p className="text-sm text-slate-400">Pick one specialist for a focused workflow.</p>
              </div>
              
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-white/20">
                <div className="text-4xl font-outfit font-black text-white/5 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform">03</div>
                <h3 className="font-outfit text-xl font-bold text-white mb-2">Upgrade anytime</h3>
                <p className="text-sm text-slate-400">Start with one, add more as you grow.</p>
              </div>
            </div>
          </BentoCard>
        </section>

        {/* FINAL CTA */}
        <section className="py-24">
          <BentoCard delay="1.3s" className="text-center p-12 sm:p-20 relative overflow-hidden border-violet-500/30 shadow-[0_0_80px_rgba(139,92,246,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-t from-violet-600/20 to-transparent pointer-events-none"></div>
            
            <h2 className="relative z-10 font-outfit text-5xl sm:text-6xl font-bold text-white mb-6">
              Ready to let AI do the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">work?</span>
            </h2>
            
            <p className="relative z-10 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
              Join thousands of Indians using BotBetter to study, sell, create, and grow — on autopilot.
              No credit card required. You can connect and automate your tasks on WhatsApp, Slack, Mail, and many more. Even create your own AI to use and earn from it. Connect your apps and get your multiple tasks done automatically while you chill, relax, or do something more important.
            </p>
            
            <button onClick={() => onShowAuth("signup")} className="relative z-10 inline-flex items-center gap-3 rounded-full bg-white text-slate-900 font-bold px-10 py-5 text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Start for free
              <ArrowRight className="w-5 h-5" />
            </button>
          </BentoCard>
        </section>

      </main>
    </div>
  );
};
