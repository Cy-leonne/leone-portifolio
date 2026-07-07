import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useInView } from "framer-motion";
import {
  Menu, X, Sun, Moon, ArrowRight, Download,
  Mail, Phone, MapPin, ArrowUp, ExternalLink,
  Code2, Server, Database, ShieldCheck, Layers,
  GitBranch, Wrench, Network, CheckCircle2, Sparkles,
  BookOpen, GraduationCap, Award, Users, Lock, Zap,
  Brain, Target, Rocket, Send, FileText, Calendar,
  Building2, TerminalSquare, Link as LinkIcon, Fingerprint, Cpu,
  AlertCircle, Loader2
} from "lucide-react";

const roles = ["Backend Developer","Spring Boot Developer","Node.js Developer","Software Engineer","Problem Solver"];
const nav = [
  ["home","Home"],["about","About"],["skills","Skills"],["experience","Experience"],
  ["projects","Projects"],["education","Education"],["certifications","Certifications"],["contact","Contact"]
];

function cx(...s:(string|false|undefined)[]){return s.filter(Boolean).join(" ")}

export default function App(){
  const [theme,setTheme]=useState<"dark"|"light">("dark");
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState("home");
  const [ti,setTi]=useState(0);
  const [tt,setTt]=useState("");
  const [del,setDel]=useState(false);
  const [topBtn,setTopBtn]=useState(false);
  const [form,setForm]=useState({name:"",email:"",subject:"",message:""});
  const [errs,setErrs]=useState<Record<string,string>>({});
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  const [sendError,setSendError]=useState("");
  const [loading,setLoading]=useState(true);
  const [mouse,setMouse]=useState({x:0,y:0});
  const {scrollYProgress}=useScroll();

  useEffect(()=>{
    const t=localStorage.getItem("lw-theme");
    if(t==="light"||t==="dark") setTheme(t);
    setTimeout(()=>setLoading(false),850);
  },[]);
  useEffect(()=>{ document.documentElement.classList.toggle("light",theme==="light"); localStorage.setItem("lw-theme",theme)},[theme]);
  useEffect(()=>{
    const h=(e:MouseEvent)=>setMouse({x:e.clientX,y:e.clientY});
    window.addEventListener("mousemove",h); return()=>window.removeEventListener("mousemove",h);
  },[]);
  // typing
  useEffect(()=>{
    const full=roles[ti];
    const speed=del?32:70;
    const tm=setTimeout(()=>{
      if(!del && tt===full){ setTimeout(()=>setDel(true),1500); return }
      if(del && tt===""){ setDel(false); setTi((ti+1)%roles.length); return }
      setTt(del?full.slice(0,tt.length-1):full.slice(0,tt.length+1));
    },speed);
    return ()=>clearTimeout(tm);
  },[tt,del,ti]);
  // spy
  useEffect(()=>{
    const obs=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting) setActive(en.target.id)}),
      {rootMargin:"-45% 0px -50% 0px"});
    nav.forEach(([id])=>{const el=document.getElementById(id); if(el) obs.observe(el)});
    return ()=>obs.disconnect();
  },[]);
  useEffect(()=>{
    const s=()=>setTopBtn(window.scrollY>700);
    window.addEventListener("scroll",s); return()=>window.removeEventListener("scroll",s);
  },[]);

  const go=(id:string)=>{ setOpen(false); document.getElementById(id)?.scrollIntoView({behavior:"smooth"}) };
  const isDark=theme==="dark";
  const muted=isDark?"text-[#9aa9c2]":"text-[#58657c]";
  const card = isDark
    ? "bg-[#121d36]/70 border-white/[0.085] backdrop-blur-xl"
    : "bg-white border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]";

  const getApiBase = () => {
    const envUrl = (import.meta as any).env?.VITE_API_URL?.trim();
    return envUrl ? envUrl.replace(/\/$/, "") : "";
  };

  // Downloads Leone's real resume file.
  // The actual PDF must live in the /public folder as "resume.pdf" — that file
  // gets served at the root URL (yoursite.com/resume.pdf) automatically.
  // Uses fetch+blob (instead of a plain <a href>) so that if the file is missing
  // or the server returns an error page, we show a clear alert instead of a
  // silent blank tab.
  const downloadCV=async()=>{
    const base=(import.meta as any).env?.BASE_URL || "/";
    const url=`${base.replace(/\/$/,"")}/resume.pdf`;
    try{
      const res=await fetch(url,{cache:"no-store"});
      const type=res.headers.get("content-type")||"";
      if(!res.ok || !type.includes("pdf")){
        throw new Error(
          `resume.pdf not found or invalid (status ${res.status}, type "${type}"). ` +
          `Make sure the file exists at /public/resume.pdf and is a real PDF.`
        );
      }
      const blob=await res.blob();
      const blobUrl=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=blobUrl;
      a.download="Leone-Wekesa-Resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }catch(err:any){
      console.error("Resume download failed:",err);
      alert(err?.message || "Could not download the resume. Check that public/resume.pdf exists.");
    }
  };

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setSendError("");
    const ne:Record<string,string>={};
    if(form.name.length<2) ne.name="Enter your name";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) ne.email="Valid email required";
    if(form.subject.length<3) ne.subject="Subject required";
    if(form.message.length<10) ne.message="At least 10 characters";
    setErrs(ne);
    if(Object.keys(ne).length>0) return;

    setSending(true);
    try{
      const envApi = import.meta.env.PROD ? getApiBase() : "";
      const url = envApi ? `${envApi}/api/contact` : "/api/contact";
      const res=await fetch(url,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
      });
      const data=await res.json().catch(()=>({ok:false}));
      if(!res.ok || !data.ok){
        if(data?.errors) setErrs(data.errors);
        throw new Error(data?.error || "Could not send your message. Please try again.");
      }
      setSent(true);
      setForm({name:"",email:"",subject:"",message:""});
      setTimeout(()=>setSent(false),4000);
    }catch(err:any){
      setSendError(err?.message || "Network error — please check your connection and try again.");
    }finally{
      setSending(false);
    }
  };

  return (
    <div className={cx("min-h-screen font-[Inter] antialiased relative overflow-x-clip transition-colors duration-300",
      isDark ? "bg-[#0a1020] text-[#eaf1ff]" : "bg-[#f7f9fd] text-[#0f172a]")}>
      {/* bg */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className={cx("absolute inset-0",
          isDark
          ? "bg-[radial-gradient(70%_55%_at_50%_-12%,rgba(48,86,215,0.18),transparent_60%),radial-gradient(50%_40%_at_88%_18%,rgba(124,58,237,0.11),transparent_60%),#0a1020]"
          : "bg-[radial-gradient(70%_45%_at_50%_-8%,rgba(37,99,235,0.075),transparent_60%),#f7f9fd]"
        )}/>
        <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:`linear-gradient(${isDark?"rgba(255,255,255,.12)":"rgba(0,0,0,.07)"} 1px,transparent 1px),linear-gradient(90deg,${isDark?"rgba(255,255,255,.12)":"rgba(0,0,0,.07)"} 1px,transparent 1px)`,backgroundSize:"64px 64px"}}/>
      </div>

      {/* cursor glow */}
      <div className="pointer-events-none fixed hidden lg:block z-[1]" style={{left:mouse.x-220, top:mouse.y-220, width:440, height:440, background:"radial-gradient(circle, rgba(69,105,255,0.085), transparent 70%)", filter:"blur(56px)", transition:"transform .05s linear"}}/>

      {/* progress */}
      <motion.div style={{scaleX:scrollYProgress}} className="fixed top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#06B6D4] z-[70]"/>

      {/* loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{opacity:1}} exit={{opacity:0}} className={cx("fixed inset-0 z-[120] flex items-center justify-center", isDark?"bg-[#070d1b]":"bg-white")}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-[Poppins] font-extrabold text-xl mx-auto shadow-xl">LW</div>
              <div className="mt-4 text-[12px] text-slate-500">booting portfolio …</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <header className="fixed top-0 w-full z-50">
        <div className={cx("border-b backdrop-blur-2xl", isDark ? "bg-[#0b142a]/78 border-white/[0.07]" : "bg-white/80 border-slate-200")}>
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8 h-[70px] flex items-center justify-between">
            <button onClick={()=>go("home")} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white font-[Poppins] font-extrabold flex items-center justify-center text-[15px] shadow-lg shadow-indigo-500/20">LW</div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="font-[Poppins] font-bold text-[15px] tracking-tight">Leone Wekesa</div>
                <div className={cx("text-[11px]",muted)}>Software Engineer</div>
              </div>
            </button>
            <div className="hidden lg:flex gap-7 text-[13.7px] font-medium">
              {nav.map(([id,label])=>(
                <button key={id} onClick={()=>go(id)} className={cx("transition", active===id ? (isDark?"text-white":"text-slate-900") : muted+" hover:text-[#3b6fff]")}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setTheme(isDark?"light":"dark")} className={cx("w-10 h-10 rounded-xl border flex items-center justify-center", isDark?"border-white/[0.12] bg-white/[0.04]":"border-slate-200 bg-slate-50")}>
                {isDark ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
              <button onClick={downloadCV} className="hidden sm:flex items-center gap-2 px-4 h-10 rounded-xl bg-[#2563EB] text-white text-[13.5px] font-semibold shadow-[0_8px_24px_rgba(37,99,235,.30)] hover:bg-[#1e55c9]"><Download size={15}/> Resume</button>
              <button onClick={()=>setOpen(o=>!o)} className="lg:hidden w-10 h-10 rounded-xl border flex items-center justify-center">{open?<X size={18}/>:<Menu size={18}/>}</button>
            </div>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className={cx("lg:hidden border-t", isDark?"border-white/[0.07]":"border-slate-200")}>
                <div className="px-5 py-4 grid grid-cols-2 gap-2 text-[13.5px]">
                  {nav.map(([id,label])=> <button key={id} onClick={()=>go(id)} className={cx("text-left px-3 py-[10px] rounded-xl", active===id ? (isDark?"bg-white/[0.06]":"bg-slate-100") : "")}>{label}</button>)}
                  <button onClick={downloadCV} className="col-span-2 mt-1 py-[11px] rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white font-semibold flex items-center justify-center gap-2"><Download size={15}/> Download CV</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section id="home" className="min-h-[100vh] flex items-center pt-28 pb-16">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8 w-full grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
            <div>
              <div className={cx("inline-flex items-center gap-2 text-[11.6px] font-medium px-3 py-[7px] rounded-full border mb-5",
                isDark?"bg-[#15213b] border-white/[0.08] text-[#aab9d6]":"bg-white border-slate-200 text-slate-600")}>
                <span className="w-[7px] h-[7px] bg-emerald-500 rounded-full animate-pulse"/> Available — graduating 2026
              </div>
              <h1 className="font-[Poppins] text-[46px] sm:text-[60px] lg:text-[66px] font-[800] tracking-[-0.03em] leading-[0.93]">
                Leone<br/>
                <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">Wekesa</span>
              </h1>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Software Engineer","Backend Developer","API Developer","ICT Support Specialist"].map((t,i)=>
                  <span key={t} className={cx("px-3 py-[6px] rounded-full text-[12px] font-[550] border",
                    i===0?"bg-blue-600/10 text-[#3b7dff] border-blue-500/20":
                    isDark ? "bg-white/[0.035] border-white/[0.08] text-[#b9c6da]" : "bg-white border-slate-200 text-slate-700"
                  )}>{t}</span>
                )}
              </div>
              <div className="h-[40px] mt-6 flex items-center">
                <span className="text-[22px] sm:text-[26px] font-[Poppins] font-[700] tracking-tight">{tt}</span>
                <span className="ml-1 text-[#6d74ff] text-2xl animate-pulse">|</span>
              </div>
              <p className={cx("mt-3 max-w-[600px] leading-relaxed text-[15.6px]",muted)}>
                Final-year Software Engineering student at the University of Eastern Africa, Baraton, graduating in December 2026. Passionate about building secure, scalable, and user-centered software solutions, with experience in backend development, web and mobile applications, APIs, databases, and modern software engineering practices.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <button onClick={()=>go("projects")} className="px-5 h-[48px] rounded-[14px] bg-[#2563EB] hover:bg-[#1e54c7] text-white font-[600] text-[14.5px] flex items-center gap-2 shadow-[0_10px_28px_rgba(37,99,235,.33)]">
                  View Projects <ArrowRight size={16}/>
                </button>
                <button onClick={downloadCV} className={cx("px-5 h-[48px] rounded-[14px] border font-[600] text-[14.5px]", isDark?"border-white/[0.15] bg-white/[0.04] hover:bg-white/[0.08]":"border-slate-300 bg-white hover:bg-slate-50")}>
                  Download CV
                </button>
                <button onClick={()=>go("contact")} className={cx("px-4 h-[48px] text-[14.5px] font-[550]", muted)}>Contact Me</button>
              </div>
              <div className="grid grid-cols-3 gap-5 max-w-[500px] mt-10 pt-8 border-t border-white/[0.07]">
                {[
                  ["15+","APIs shipped"],
                  ["3","Production apps"],
                  ["99.8%","Uptime"]
                ].map(([a,b])=>(
                  <div key={b}>
                    <div className="text-[26px] font-[Poppins] font-[800] tracking-tight">{a}</div>
                    <div className={cx("text-[12.4px]",muted)}>{b}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* visual */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 blur-[90px] opacity-70">
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#2563EB]/28 to-[#7C3AED]/25 rounded-full"/>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#06B6D4]/20 rounded-full"/>
              </div>
              <div className={cx("rounded-[28px] p-6 border", card)}>
                <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0b1324] text-[#d5e2f7]">
                  <div className="h-11 flex items-center px-4 gap-2 border-b border-white/[0.07] bg-[#0e1830] text-[11.5px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/>
                    <span className="ml-3 font-mono">AuthService.java</span>
                  </div>
                  <pre className="p-5 text-[12.5px] leading-[1.8] font-mono overflow-x-auto">{`@Service
public class AuthService {
  public JwtToken login(LoginReq r){
    var user = repo.findByEmail(r.email());
    verifyBiometric(r.fingerprint());
    return jwt.issue(user, Scope.API);
  }

  @Secure(roles="ADMIN")
  public boolean verifyBiometric(Bio b){
    return engine.match(b) > 0.97;
  }
}`}</pre>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center text-[11.4px]">
                  {["Spring Boot","PostgreSQL","JWT","Node.js"].map(t=>
                    <span key={t} className={cx("px-3 py-[6px] rounded-full border", isDark?"bg-white/[0.04] border-white/[0.09] text-[#c8d4e8]":"bg-slate-50 border-slate-200 text-slate-700")}>{t}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className={cx("py-24 border-y", isDark?"border-white/[0.06] bg-[#0d152b]/50":"border-slate-200 bg-slate-50/80")}>
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="text-[12px] font-semibold tracking-wider text-[#5c74ff] uppercase flex items-center gap-2"><Sparkles size={14}/> About Me</div>
            <h2 className="font-[Poppins] text-[34px] sm:text-[42px] font-[800] tracking-[-0.022em] mt-2">Building reliable, secure<br/>backend systems.</h2>
            <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-7 mt-8">
              <div className={cx("rounded-[24px] p-8 border", card)}>
                <h3 className="font-[Poppins] font-[720] text-[22px] mb-3">Hello — I’m Leone.</h3>
                <div className={cx("space-y-4 text-[15.2px] leading-[1.75]",muted)}>
                  <p>Software Engineering student at the University of Eastern Africa, Baraton, focused on building modern, scalable, and user-focused web and mobile applications using full-stack technologies while applying software engineering best practices.</p>
                  <p>Passionate about developing responsive frontends, designing secure and efficient backend systems, building RESTful APIs, and working with relational databases to deliver reliable end-to-end solutions.</p>
                  <p>I have practical experience in IT support, including system installation and configuration, troubleshooting hardware and software issues, user support, basic networking, and maintaining reliable IT environments.</p>
                  <p>I thrive in collaborative teams, communicate effectively, adapt quickly to new technologies, and am committed to continuous learning and delivering high-quality solutions that solve real-world problems.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mt-6 text-[13.8px]">
                  {[
                    {t:"Secure-by-default", I:ShieldCheck},
                    {t:"Clean API architecture", I:Layers},
                    {t:"Performance focus", I:Zap},
                    {t:"Team collaborator", I:Users}
                  ].map(({t,I})=>(
                    <div key={t} className={cx("flex items-center gap-2",muted)}><I size={16} className="text-[#6b7bff]"/>{t}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className={cx("rounded-[24px] p-7 border",card)}>
                  <div className="text-[11.5px] uppercase tracking-wider font-bold text-[#6076ff] mb-3">Quick facts</div>
                  <div className="space-y-3 text-[14.6px]">
                    <div className="flex justify-between"><span className={muted}>Location</span><b>Nairobi, Kenya</b></div>
                    <div className="flex justify-between"><span className={muted}>University</span><b className="text-right">UEA, Baraton</b></div>
                    <div className="flex justify-between"><span className={muted}>Degree</span><b>B.Sc Software Eng.</b></div>
                    <div className="flex justify-between"><span className={muted}>Graduation</span><b>2026</b></div>
                  </div>
                </div>
                <div className={cx("rounded-[24px] p-7 border",card)}>
                  <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center"><Target size={16}/></div><div className="font-[Poppins] font-[700]">Career objective</div></div>
                  <p className={cx("text-[14.4px] leading-[1.68]",muted)}>Passionate Software Engineer seeking opportunities to leverage full-stack development and IT support expertise to drive innovation and business success.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section id="skills" className="py-24">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="text-[12px] uppercase tracking-wider text-[#5c74ff] font-[650] flex items-center gap-2"><Cpu size={14}/> Technical Excellence</div>
            <h2 className="font-[Poppins] text-[34px] sm:text-[42px] font-[800] tracking-[-0.022em] mt-2">Full backend stack<br/>plus supporting expertise</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-9">
              {[
                {t:"Backend", ic:Server, col:"from-[#2563EB] to-[#3b82f6]", list:[["Java",92],["Spring Boot",90],["Node.js",88],["Express.js",86],["REST APIs",93],["JWT",89],["OAuth",82]]},
                {t:"Frontend", ic:Code2, col:"from-[#7C3AED] to-[#a855f7]", list:[["React",84],["Tailwind CSS",90],["JavaScript",88],["TypeScript",82]]},
                {t:"Databases", ic:Database, col:"from-[#06B6D4] to-[#22d3ee]", list:[["PostgreSQL",89],["MySQL",85],["MongoDB",80]]},
                {t:"DevOps", ic:GitBranch, col:"from-[#10B981] to-[#34d399]", list:[["Git",92],["GitHub",91],["Docker",78],["CI/CD",81]]},
                {t:"Networking", ic:Network, col:"from-[#f59e0b] to-[#fbbf24]", list:[["LAN/WAN",86],["Switch Config",82],["Router Support",80],["Infrastructure",84]]},
                {t:"IT Support", ic:Wrench, col:"from-[#ec4899] to-[#f472b6]", list:[["Hardware Config",88],["Software Deployment",87],["Technical Support",91],["Email Config",85]]},
              ].map(g=>(
                <Reveal key={g.t}>
                  <div className={cx("rounded-[22px] p-6 border h-full",card)}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className={cx("w-11 h-11 rounded-[13px] bg-gradient-to-br text-white flex items-center justify-center", g.col)}><g.ic size={19}/></div>
                      <div className="font-[Poppins] font-[700]">{g.t}</div>
                    </div>
                    <div className="space-y-4">
                      {g.list.map(([name,lv])=>(
                        <div key={name as string}>
                          <div className="flex justify-between text-[13.5px] mb-[7px]"><span>{name}</span><span className={cx("text-[12px]",muted)}>{lv}%</span></div>
                          <div className={cx("h-[6px] rounded-full", isDark?"bg-white/[0.07]":"bg-slate-200")}>
                            <div className={cx("h-full rounded-full bg-gradient-to-r", g.col)} style={{width:`${lv}%`}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section id="experience" className={cx("py-24 border-y", isDark?"border-white/[0.06] bg-[#0d152b]/45":"border-slate-200 bg-slate-50")}>
          <div className="max-w-[1000px] mx-auto px-5 sm:px-8">
            <div className="text-[12px] uppercase tracking-wider text-[#5c74ff] font-[650] flex items-center gap-2"><Building2 size={14}/> Experience</div>
            <h2 className="font-[Poppins] text-[34px] sm:text-[42px] font-[800] tracking-[-0.022em] mt-2">Hands-on engineering<br/>in real infrastructure</h2>
            <div className="mt-10 relative">
              <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#3a6dff] via-[#7a5cff]/60 to-transparent -translate-x-1/2"/>
              <div className="pl-12 md:pl-0 md:grid md:grid-cols-2 gap-10 relative">
                <div className="absolute left-5 md:left-1/2 top-4 w-3 h-3 rounded-full bg-[#3b6fff] shadow-[0_0_0_5px_rgba(59,111,255,.17)] -translate-x-1/2"/>
                <div className="md:text-right md:pr-10 mb-6 md:mb-0">
                  <div className={cx("inline-block text-[11.5px] px-3 py-[5px] rounded-full font-semibold mb-2", isDark?"bg-[#1a2544] text-[#a8b9de]":"bg-slate-100 text-slate-700")}>Industrial Attachment</div>
                  <div className="text-[13.5px] font-semibold text-[#5978ff]">2026 — Present</div>
                </div>
                <div className={cx("rounded-[22px] p-7 border",card)}>
                  <div className="font-[Poppins] font-[720] text-[18px]">ICT Industrial Attachment</div>
                  <div className="text-[#5a74ff] text-[14px] font-[600] mt-1 mb-3">National Industrial Training Authority (NITA)</div>
                  <ul className={cx("space-y-[10px] text-[14.2px] leading-[1.6]",muted)}>
                    {[
                      "Provided first-line ICT support maintaining high system uptime",
                      "Assisted user account creation and authorization",
                      "Configured secure email systems",
                      "Supported LAN infrastructure",
                      "Assisted switch and router troubleshooting",
                      "Participated in software deployment",
                      "Supported server maintenance"
                    ].map(li=> <li key={li} className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 mt-[3px] shrink-0"/>{li}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="py-24">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="text-[12px] uppercase tracking-wider text-[#5c74ff] font-[650] flex items-center gap-2"><TerminalSquare size={14}/> Featured Work</div>
            <h2 className="font-[Poppins] text-[34px] sm:text-[42px] font-[800] tracking-[-0.022em] mt-2">Engineering secure systems<br/>that perform</h2>
            <div className="grid lg:grid-cols-3 gap-5 mt-9">
              {[
                {

                  title:"Secure Biometric Delivery System",
                  blurb:"Enterprise-grade delivery verification using biometric authentication to eliminate fraud.",
                  tags:["Spring Boot","Java","PostgreSQL","JWT","REST API"],
                  grad:"from-[#2563EB] via-[#6b56f3] to-[#06B6D4]",
                  Icon:Fingerprint
                },
                {
                  title:"Smart Season Project",
                  blurb:"Seasonal management platform with responsive frontend and scalable backend services.",
                  tags:["React","Node.js","PostgreSQL"],
                  grad:"from-[#7C3AED] to-[#ec4899]",
                  Icon:Calendar
                },
                {
                  title:"Shelfie Reading Application",
                  blurb:"Book tracking with recommendation algorithms and progress analytics.",
                  tags:["Java","APIs","Database"],
                  grad:"from-[#06B6D4] to-[#10B981]",
                  Icon:BookOpen
                },
              ].map(p=>(
                <Reveal key={p.title}>
                  <div className={cx("rounded-[22px] border p-[22px] h-full flex flex-col",card, p.featured ? "lg:col-span-3 lg:grid lg:grid-cols-[320px_1fr] lg:gap-7":"")}>
                    <div className={cx("rounded-[18px] h-[170px] lg:h-full min-h-[170px] flex items-center justify-center bg-gradient-to-br text-white relative overflow-hidden", p.grad)}>
                      <p.Icon size={p.featured?52:36}/>
                      {p.featured && <div className="absolute top-3 right-3 text-[10.5px] font-[700] tracking-wider uppercase bg-amber-100 text-amber-800 px-2 py-[4px] rounded-full">Featured</div>}
                    </div>
                    <div className="pt-5 flex flex-col flex-1">
                      <div className="font-[Poppins] font-[720] text-[18.5px]">{p.title}</div>
                      <p className={cx("mt-2 text-[14.2px] leading-[1.65] flex-1",muted)}>{p.blurb}</p>
                      <div className="flex flex-wrap gap-[7px] mt-4">
                        {p.tags.map(t=> <span key={t} className="text-[11.5px] px-[9px] py-[5px] rounded-full bg-[#2563EB]/10 text-[#3b6cff] font-[580]">{t}</span>)}
                      </div>
                      <div className="flex gap-2 mt-5">
                        <button className="px-3 h-[38px] rounded-[11px] bg-[#1a223a] text-white text-[13px] font-[600] flex items-center gap-[7px] border border-white/[0.1]"><GitBranch size={14}/> Code</button>
                        <button disabled className={cx("px-3 h-[38px] rounded-[11px] text-[13px] border", isDark?"border-white/[0.09] text-slate-400 bg-white/[0.02]":"border-slate-200 text-slate-500")}><ExternalLink size={14} className="inline mr-1 -mt-[2px]"/> Demo</button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section id="education" className={cx("py-24 border-y", isDark?"border-white/[0.06] bg-[#0d152b]/45":"border-slate-200 bg-slate-50")}>
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="text-[12px] uppercase tracking-wider text-[#5c74ff] font-[650] flex items-center gap-2"><GraduationCap size={14}/> Education</div>
            <h2 className="font-[Poppins] text-[34px] sm:text-[42px] font-[800] tracking-[-0.022em] mt-2">Academic foundation in<br/>software engineering</h2>
            <div className="grid md:grid-cols-2 gap-5 mt-8">
              <div className={cx("rounded-[22px] p-7 border",card)}>
                <div className="text-[12px] font-[650] text-[#4f68ff] mb-2">2022 — 2026</div>
                <div className="font-[Poppins] font-[720] text-[18px]">B.Sc. Software Engineering</div>
                <div className="text-[14px] text-[#5a6fff] font-[560] mt-1">University of Eastern Africa, Baraton</div>
                <p className={cx("mt-3 text-[14.3px] leading-[1.7]",muted)}>Backend systems, algorithms, secure software design, databases, distributed systems.</p>
              </div>
              <div className={cx("rounded-[22px] p-7 border",card)}>
                <div className="text-[12px] font-[650] text-[#4f68ff] mb-2">2018 — 2022</div>
                <div className="font-[Poppins] font-[720] text-[18px]">KCSE</div>
                <div className={cx("text-[14px] font-[560] mt-1",muted)}>Friends School Kamusinga</div>
                <p className={cx("mt-3 text-[14.3px] leading-[1.7]",muted)}>Strong foundation in mathematics, sciences and analytical problem solving.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS + WHY */}
        <section id="certifications" className="py-24">
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
            <div className="text-[12px] uppercase tracking-wider text-[#5c74ff] font-[650] flex items-center gap-2"><Award size={14}/> Certifications</div>
            <h2 className="font-[Poppins] text-[34px] sm:text-[40px] font-[800] tracking-[-0.022em] mt-2">Continuous learning<br/>verified</h2>
            <div className="grid md:grid-cols-3 gap-5 mt-7">
              {[
                {name:"Cisco Training Program",org:"Cisco Networking Academy",status:"In Progress",year:"2025",Ic:Network},
                {name:"Coursera IT Certifications",org:"Coursera / Google",status:"Completed",year:"2024",Ic:Award},
                {name:"Microsoft Office Suite",org:"Microsoft",status:"Certified",year:"2023",Ic:FileText},
              ].map(c=>(
                <div key={c.name} className={cx("rounded-[22px] p-6 border",card)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#eef2ff] text-[#4b63f7] flex items-center justify-center"><c.Ic size={20}/></div>
                    <span className={cx("text-[11px] px-[9px] py-[4px] rounded-full font-[650]",
                      c.status==="In Progress" ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"
                    )}>{c.status}</span>
                  </div>
                  <div className="font-[Poppins] font-[700]">{c.name}</div>
                  <div className={cx("text-[13.4px] mt-1",muted)}>{c.org}</div>
                  <div className="text-[12.5px] font-[600] text-[#5b6dff] mt-3">{c.year}</div>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <div className="text-[12px] uppercase tracking-wider text-[#5c74ff] font-[650] flex items-center gap-2"><Sparkles size={14}/> Why Work With Me</div>
              <h3 className="font-[Poppins] text-[28px] sm:text-[34px] font-[800] tracking-[-0.02em] mt-2 mb-6">Engineering values I build with</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  [Brain,"Problem Solver","Breaking complex systems into clean backend flows."],
                  [Server,"Backend Development","Spring Boot & Node.js APIs built to scale."],
                  [Layers,"REST API Design","Clear contracts, versioning, thoughtful DX."],
                  [Database,"Database Design","Normalized schemas & query optimization."],
                  [Users,"Team Collaboration","Clear communication & code reviews."],
                  [Rocket,"Continuous Learning","Exploring distributed & cloud-native patterns."],
                  [Target,"Attention to Detail","Edge cases handled, security first."],
                  [Lock,"Secure Software Dev","JWT, OAuth, RBAC, audit logging."],
                ].map(([Icon,title,text])=>(
                  <div key={title as string} className={cx("rounded-[18px] p-5 border",card)}>
                    <Icon size={18} className="text-[#5f71ff] mb-3"/>
                    <div className="font-[600] text-[15px] mb-1">{title as string}</div>
                    <div className={cx("text-[13.4px] leading-[1.55]",muted)}>{text as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className={cx("py-24 border-t", isDark?"border-white/[0.07]":"border-slate-200")}>
          <div className="max-w-[1160px] mx-auto px-5 sm:px-8 grid lg:grid-cols-[.95fr_1.05fr] gap-10">
            <div>
              <div className="text-[12px] uppercase tracking-wider text-[#5c74ff] font-[650]">Get in touch</div>
              <h2 className="font-[Poppins] text-[32px] sm:text-[38px] font-[800] tracking-[-0.022em] mt-2 leading-tight">Let’s build something<br/>reliable together</h2>
              <p className={cx("mt-4 text-[15.3px] leading-[1.7]",muted)}>Open to backend engineering roles, API collaborations, and high-impact internships. Response &lt; 24h.</p>
              <div className="space-y-3 mt-7">
                {[
                  [Phone,"Phone","0723384120","tel:+254723384120"],
                  [Mail,"Email","wekesaleone27@gmail.com","mailto:wekesaleone27@gmail.com"],
                  [MapPin,"Location","Nairobi, Kenya","#"],
                  [LinkIcon,"LinkedIn","leone-wekesa-04468829b","https://www.linkedin.com/in/leone-wekesa-04468829b"],
                  [GitBranch,"GitHub","Cy-leonne","https://github.com/Cy-leonne"],
                ].map(([Icon,label,val,href])=>(
                  <a key={label as string} href={href as string} target={(href as string).startsWith("http")?"_blank":undefined} rel="noreferrer"
                    className={cx("flex items-center gap-4 p-4 rounded-[16px] border transition",card,"hover:-translate-y-[2px]")}>
                    <div className="w-11 h-11 rounded-[12px] bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center"><Icon size={17}/></div>
                    <div>
                      <div className={cx("text-[11px] uppercase tracking-wider font-[650]",muted)}>{label as string}</div>
                      <div className="text-[14.4px] font-[550]">{val as string}</div>
                    </div>
                  </a>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                {[
                  [GitBranch,"https://github.com/Cy-leonne"],
                  [LinkIcon,"https://www.linkedin.com/in/leone-wekesa-04468829b"],
                  [Mail,"mailto:wekesaleone27@gmail.com"]
                ].map(([Icon,href],i)=>(
                  <a key={i} href={href as string} target="_blank" rel="noreferrer"
                     className={cx("w-11 h-11 rounded-[12px] border flex items-center justify-center transition", isDark?"border-white/[0.13] hover:bg-white/[0.07]":"border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900")}>
                    <Icon size={17}/>
                  </a>
                ))}
              </div>
            </div>

            {/* form */}
            <div className={cx("rounded-[24px] p-7 border",card)}>
              <form onSubmit={submit} noValidate className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12.7px] font-[600] mb-1.5 block">Name</label>
                    <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                      className={cx("w-full h-[46px] px-3 rounded-[12px] border text-[14.5px] outline-none",
                        errs.name?"border-red-400":"", isDark?"bg-[#0e1830] border-white/[0.11] text-white":"bg-slate-50 border-slate-300")}
                      placeholder="Leone Wekesa"/>
                    {errs.name && <div className="text-red-500 text-[12px] mt-1">{errs.name}</div>}
                  </div>
                  <div>
                    <label className="text-[12.7px] font-[600] mb-1.5 block">Email</label>
                    <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                      className={cx("w-full h-[46px] px-3 rounded-[12px] border text-[14.5px] outline-none",
                        errs.email?"border-red-400":"", isDark?"bg-[#0e1830] border-white/[0.11] text-white":"bg-slate-50 border-slate-300")}
                      placeholder="you@company.com"/>
                    {errs.email && <div className="text-red-500 text-[12px] mt-1">{errs.email}</div>}
                  </div>
                </div>
                <div>
                  <label className="text-[12.7px] font-[600] mb-1.5 block">Subject</label>
                  <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                    className={cx("w-full h-[46px] px-3 rounded-[12px] border text-[14.5px] outline-none",
                      errs.subject?"border-red-400":"", isDark?"bg-[#0e1830] border-white/[0.11] text-white":"bg-slate-50 border-slate-300")}
                    placeholder="Backend Engineering Opportunity"/>
                  {errs.subject && <div className="text-red-500 text-[12px] mt-1">{errs.subject}</div>}
                </div>
                <div>
                  <label className="text-[12.7px] font-[600] mb-1.5 block">Message</label>
                  <textarea rows={5} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                    className={cx("w-full px-3 py-3 rounded-[12px] border text-[14.5px] outline-none resize-none",
                      errs.message?"border-red-400":"", isDark?"bg-[#0e1830] border-white/[0.11] text-white":"bg-slate-50 border-slate-300")}
                    placeholder="Tell me about the role, stack, and timeline…"/>
                  {errs.message && <div className="text-red-500 text-[12px] mt-1">{errs.message}</div>}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <div className={cx("text-[12.5px]",muted)}>Avg response &lt; 12h • GMT+3</div>
                  <button type="submit" disabled={sending}
                    className="px-5 h-[46px] rounded-[12px] bg-[#2563EB] hover:bg-[#1d54c9] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14.3px] font-[620] flex items-center gap-2 shadow-[0_10px_26px_rgba(37,99,235,.30)]">
                    {sending ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
                    {sending ? "Sending…" : sent ? "Message sent!" : "Send message"}
                  </button>
                </div>
                {sent && <div className="text-emerald-500 text-[13.5px] flex items-center gap-2"><CheckCircle2 size={15}/> Thanks — I’ll reply shortly.</div>}
                {sendError && <div className="text-red-500 text-[13.5px] flex items-center gap-2"><AlertCircle size={15}/> {sendError}</div>}
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className={cx("border-t py-14", isDark?"border-white/[0.08] bg-[#091225]/70":"border-slate-200 bg-white")}>
        <div className="max-w-[1160px] mx-auto px-5 sm:px-8 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white flex items-center justify-center font-[Poppins] font-extrabold">LW</div>
              <div>
                <div className="font-[Poppins] font-[700]">Leone Wekesa</div>
                <div className={cx("text-[12.5px]",muted)}>Software Engineer</div>
              </div>
            </div>
            <p className={cx("text-[14px] leading-[1.65] max-w-[380px]",muted)}>Transforming ideas into reliable digital solutions with expertise in full-stack development, backend engineering, and modern software technologies.</p>
          </div>
          <div>
            <div className="font-[600] text-[13.5px] mb-3">Navigate</div>
            <div className="grid grid-cols-2 gap-y-2 text-[13.8px]">
              {nav.slice(0,6).map(([id,label])=> <button key={id} onClick={()=>go(id)} className={cx("text-left hover:text-[#4a6aff]",muted)}>{label}</button>)}
            </div>
          </div>
          <div>
            <div className="font-[600] text-[13.5px] mb-3">Connect</div>
            <div className={cx("space-y-2 text-[13.8px]",muted)}>
              <a href="mailto:wekesaleone27@gmail.com" className="block hover:text-[#4a6aff]">wekesaleone27@gmail.com</a>
              <a href="tel:+254723384120" className="block hover:text-[#4a6aff]">0723384120</a>
              <a href="https://www.linkedin.com/in/leone-wekesa-04468829b" target="_blank" rel="noreferrer" className="block hover:text-[#4a6aff]">LinkedIn</a>
              <a href="https://github.com/Cy-leonne" target="_blank" rel="noreferrer" className="block hover:text-[#4a6aff]">GitHub</a>
            </div>
          </div>
        </div>
        <div className={cx("max-w-[1160px] mx-auto px-5 sm:px-8 flex flex-wrap justify-between gap-3 mt-10 pt-7 border-t text-[12.8px]", isDark?"border-white/[0.07] text-[#8290a8]":"border-slate-200 text-slate-600")}>
          <span>© {new Date().getFullYear()} Leone Wekesa. All rights reserved.</span>
    
        </div>
      </footer>

      {/* top */}
      <AnimatePresence>
        {topBtn && (
          <motion.button initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}
            onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
            className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-[14px] bg-[#2563EB] text-white shadow-xl flex items-center justify-center">
            <ArrowUp size={18}/>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function Reveal({children}:{children:React.ReactNode}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true, margin:"-70px"});
  return (
    <motion.div ref={ref} initial={{opacity:0,y:24}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.55}}>
      {children}
    </motion.div>
  )
}
