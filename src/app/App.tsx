import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as authApi from "../api/auth";
import * as jobsApi from "../api/jobs";
import * as userApi from "../api/user";
import { setTokens, clearTokens, setUser, clearUser, getUser, AUTH_LOGOUT } from "../api/client";
import type { JobBrief, JobDetail, UserBrief, ApplicationResponse, FilterOptionsResponse, UserProfileResponse, UserStatsResponse, ResumeResponse } from "../api/types";
import {
  Search, Bell, Heart, ChevronRight, MapPin, Briefcase, Clock,
  Filter, X, User, FileText, ChevronLeft, Plus, Edit2, Home, Send,
  GraduationCap, Eye, Mail, Lock, Trash2, Settings, Award,
  CheckCircle, Share2, EyeOff, Phone, Download, TrendingUp,
  Star, ChevronDown,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Screen = "login" | "home" | "search" | "job-detail" | "profile" | "resume" | "favorites" | "applications";
type Tab = "home" | "search" | "applications" | "profile";

// Unified job type — covers both list (JobBrief) and detail (JobDetail) views
interface Job {
  id: number;
  title: string;
  company: string;
  initials: string;
  logoColor: string;
  location: string;
  salary: string;
  experience: string;
  education: string;
  headcount: number;
  tags: string[];
  isNew: boolean;
  isHot: boolean;
  postedAt: string;
  isFavorited: boolean;
  isApplied?: boolean;
  desc?: string;
  requirements?: string[];
  welfare?: string[];
  companySize?: string;
  companyType?: string;
  companyStage?: string;
  industry?: string;
}

const STATUS_MAP: Record<string, { color: string; bg: string; dot: string }> = {
  PENDING: { color: "text-slate-500", bg: "bg-slate-100", dot: "bg-slate-400" },
  VIEWED: { color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  INTERVIEW: { color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-500" },
  OFFER: { color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  REJECTED: { color: "text-red-500", bg: "bg-red-50", dot: "bg-red-400" },
};

function mapJobBrief(b: JobBrief): Job { return { ...b, isFavorited: b.isFavorited }; }
function mapJobDetail(d: JobDetail): Job { return { ...d, isFavorited: d.isFavorited }; }

// ─── Shared Components ───────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-2 pb-1 h-11 flex-shrink-0 bg-transparent">
      <span className="text-xs font-bold text-[#0B1F3A]">9:41</span>
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-[2px] h-3">
          {[4, 6, 8, 10].map((h, i) => (
            <div key={i} style={{ height: h }} className={`w-[3px] rounded-[1px] ${i < 3 ? "bg-[#0B1F3A]" : "bg-[#0B1F3A]/25"}`} />
          ))}
        </div>
        <svg viewBox="0 0 18 13" className="w-[18px] h-3 fill-[#0B1F3A]">
          <path d="M9 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM2.9 5.6a8.6 8.6 0 0112.2 0l1.4-1.4A10.7 10.7 0 001.5 4.2l1.4 1.4zM5.7 8.4a4.8 4.8 0 016.6 0l1.4-1.4A6.9 6.9 0 004.3 7l1.4 1.4z" />
        </svg>
        <div className="flex items-center gap-[1px]">
          <div className="w-[22px] h-[11px] rounded-[3px] border border-[#0B1F3A] relative">
            <div className="absolute inset-[1.5px] rounded-[1.5px] bg-[#0B1F3A]" style={{ width: "75%" }} />
          </div>
          <div className="w-[2px] h-[5px] rounded-r-sm bg-[#0B1F3A]/40" />
        </div>
      </div>
    </div>
  );
}

function CompanyLogo({ initials, logoColor, size = "md" }: { initials: string; logoColor: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-10 h-10 text-sm rounded-2xl", md: "w-12 h-12 text-base rounded-2xl", lg: "w-16 h-16 text-xl rounded-3xl" };
  return (
    <div className={`${s[size]} flex items-center justify-center text-white font-bold flex-shrink-0`} style={{ backgroundColor: logoColor }}>
      {initials}
    </div>
  );
}

function Chip({ label, active = false, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${active ? "bg-[#1D4ED8] text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200"}`}
    >
      {label}
    </button>
  );
}

function Tag({ label, variant = "default" }: { label: string; variant?: "default" | "blue" | "green" }) {
  const v = { default: "bg-slate-100 text-slate-600", blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${v[variant]}`}>{label}</span>;
}

function PrimaryButton({ label, onClick, disabled = false }: { label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl text-white font-bold text-[15px] transition-transform active:scale-[0.98] disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 100%)" }}
    >
      {label}
    </button>
  );
}

function InputField({ icon: Icon, placeholder, type = "text", value, onChange, right, error, autoComplete, inputKey, name, id, readOnly, onFocus }: {
  icon: React.ElementType; placeholder: string; type?: string;
  value?: string; onChange?: (v: string) => void; right?: React.ReactNode;
  error?: string; autoComplete?: string; inputKey?: string;
  name?: string; id?: string; readOnly?: boolean; onFocus?: () => void;
}) {
  return (
    <div>
      <div className={`flex items-center bg-slate-50 rounded-2xl px-4 py-3.5 gap-3 border transition-colors focus-within:border-blue-400 ${error ? "border-red-400" : "border-slate-200"}`}>
        <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          key={inputKey}
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onFocus={onFocus}
          onChange={e => onChange?.(e.target.value)}
          autoComplete={autoComplete ?? "off"}
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          className="flex-1 bg-transparent text-[#0B1F3A] text-sm placeholder:text-slate-400 outline-none min-w-0"
        />
        {right}
      </div>
      {error ? <p className="text-red-500 text-xs font-medium mt-1.5">{error}</p> : null}
    </div>
  );
}

function JobCard({ job, onSelect, isFavorite, onToggleFavorite }: {
  job: Job; onSelect: (j: Job) => void; isFavorite: boolean; onToggleFavorite: (id: number) => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:bg-slate-50 transition-colors cursor-pointer"
      onClick={() => onSelect(job)}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo initials={job.initials} logoColor={job.logoColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-[#0B1F3A] text-[15px] leading-tight">{job.title}</h3>
                {job.isNew && <span className="px-1.5 py-0.5 bg-[#1D4ED8] text-white text-[10px] font-bold rounded-full leading-none">NEW</span>}
                {job.isHot && <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full leading-none">热</span>}
              </div>
              <p className="text-slate-500 text-sm mt-0.5">{job.company}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onToggleFavorite(job.id); }}
              className="p-1 -mt-0.5 flex-shrink-0 transition-transform active:scale-90"
            >
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-300"}`} />
            </button>
          </div>
          <div className="text-[#1D4ED8] font-bold text-base mt-2">{job.salary}</div>
          <div className="flex items-center gap-3 mt-1.5 text-slate-500 text-xs">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
            <span>{job.experience}</span>
            <span>{job.education}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {job.tags.map(t => <Tag key={t} label={t} />)}
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-slate-400 text-xs">{job.postedAt} · 招 {job.headcount} 人</span>
        <span className="text-[#1D4ED8] text-xs font-bold">立即投递 →</span>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: "home", label: "首页", Icon: Home },
    { key: "search", label: "找工作", Icon: Search },
    { key: "applications", label: "投递", Icon: Send },
    { key: "profile", label: "我的", Icon: User },
  ];
  return (
    <div className="flex-shrink-0 bg-white border-t border-slate-200 pb-5 pt-2 px-2">
      <div className="flex items-center justify-around">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${activeTab === key ? "text-[#1D4ED8]" : "text-slate-400"}`}
          >
            <Icon className={`w-6 h-6 ${activeTab === key ? "stroke-[2.5px]" : ""}`} />
            <span className={`text-[10px] ${activeTab === key ? "font-bold" : "font-medium"}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-bold text-[#0B1F3A] text-base">{title}</h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-0.5 text-[#1D4ED8] text-sm font-semibold">
          {action}<ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 flex-shrink-0">
      <button onClick={onBack} className="p-1 -ml-1 w-8">
        {onBack ? <ChevronLeft className="w-6 h-6 text-[#0B1F3A]" /> : null}
      </button>
      <span className="font-bold text-[#0B1F3A]">{title}</span>
      <div className="w-8 flex justify-end">{right}</div>
    </div>
  );
}

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, initialMode = "login", initialStep = 1 }: {
  onLogin: (res: { accessToken: string; refreshToken: string; user: import("../api/types").UserBrief }) => void;
  initialMode?: "login" | "register";
  initialStep?: number;
}) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [step, setStep] = useState(initialStep);
  const [showPwd, setShowPwd] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [blockAutofill, setBlockAutofill] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSmsCode, setRegSmsCode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPwd, setRegConfirmPwd] = useState("");
  const [regSending, setRegSending] = useState(false);

  const handleSendSms = async () => {
    if (!regPhone) { toast.error("请先输入手机号"); return; }
    setRegSending(true);
    try {
      await authApi.sendSms(regPhone);
      toast.success("验证码已发送");
    } catch (err: any) {
      toast.error(err?.message || "发送失败");
    } finally {
      setRegSending(false);
    }
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedPhone = phone.replace(/\s/g, "");
    setPhoneError("");
    setPasswordError("");
    if (!trimmedPhone) { setPhoneError("请输入手机号"); return; }
    if (!password) { setPasswordError("请输入密码"); return; }
    if (password.length < 6) { setPasswordError("密码至少 6 位"); return; }
    setIsSubmitting(true);
    try {
      const res = await authApi.login(trimmedPhone, password);
      onLogin(res);
    } catch (err: any) {
      toast.error(err?.message || "登录失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!regName.trim()) { toast.error("请输入姓名"); return; }
    if (!regPhone.trim()) { toast.error("请输入手机号"); return; }
    if (!regSmsCode.trim()) { toast.error("请输入验证码"); return; }
    if (!regPassword || regPassword.length < 6) { toast.error("密码至少6位"); return; }
    if (regPassword !== regConfirmPwd) { toast.error("两次密码不一致"); return; }
    setIsSubmitting(true);
    try {
      const res = await authApi.register({ name: regName.trim(), phone: regPhone.trim(), smsCode: regSmsCode.trim(), password: regPassword, confirmPassword: regConfirmPwd });
      onLogin(res);
    } catch (err: any) {
      toast.error(err?.message || "注册失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex flex-col items-center justify-center flex-shrink-0"
        style={{ height: 240, background: "linear-gradient(160deg, #0F2B5B 0%, #1D4ED8 100%)" }}
      >
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.18)" }}>
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white text-2xl font-bold tracking-wide">猎职 LieZhi</h1>
        <p className="text-white/60 text-sm mt-1 font-medium">发现你的理想职位</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl -mt-5 px-6 pt-6 overflow-y-auto">
        <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setStep(1); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m ? "bg-white text-[#0F2B5B] shadow-sm" : "text-slate-500"}`}
            >
              {m === "login" ? "账号登录" : "注册账号"}
            </button>
          ))}
        </div>

        {mode === "login" ? (
          <form
            className="space-y-4"
            onSubmit={handleLoginSubmit}
            autoComplete="off"
            data-form-type="other"
          >
            {/* 避免 Chrome / Google 密码管理工具识别为注册/登录表单 */}
            <input type="text" name="fake-user" className="sr-only" tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <input type="password" name="fake-pass" className="sr-only" tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block" htmlFor="liezhi-phone">手机号</label>
              <InputField
                id="liezhi-phone"
                name="liezhi-phone"
                icon={Phone}
                placeholder="请输入手机号"
                type="tel"
                value={phone}
                readOnly={blockAutofill}
                onFocus={() => setBlockAutofill(false)}
                autoComplete="off"
                error={phoneError}
                onChange={v => { setPhone(v); setPhoneError(""); }}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block" htmlFor="liezhi-secret">密码</label>
              <InputField
                id="liezhi-secret"
                name="liezhi-secret"
                icon={Lock}
                placeholder="请输入密码（至少 6 位）"
                type={showPwd ? "text" : "password"}
                inputKey={showPwd ? "login-pwd-text" : "login-pwd-mask"}
                value={password}
                readOnly={blockAutofill}
                onFocus={() => setBlockAutofill(false)}
                autoComplete="off"
                error={passwordError}
                onChange={v => { setPassword(v); setPasswordError(""); }}
                right={
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setShowPwd(v => !v)}
                    className="flex-shrink-0 p-1 touch-manipulation"
                    aria-label={showPwd ? "隐藏密码" : "显示密码"}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                }
              />
            </div>
            <div className="flex justify-end -mt-1">
              <button type="button" className="text-[#1D4ED8] text-sm font-semibold">忘记密码？</button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl text-white font-bold text-[15px] transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 100%)" }}
            >
              {isSubmitting ? "登录中..." : "登录"}
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 text-xs font-medium">其他登录方式</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="flex justify-center gap-6 pb-6">
              <button type="button" className="w-12 h-12 rounded-full bg-[#07C160] flex items-center justify-center shadow-sm text-white font-bold text-lg">微</button>
              <button type="button" className="w-12 h-12 rounded-full bg-[#12B7F5] flex items-center justify-center shadow-sm text-white font-bold text-lg">Q</button>
              <button type="button" className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-sm text-white font-bold text-lg"></button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${step >= s ? "bg-[#1D4ED8] text-white" : "bg-slate-200 text-slate-400"}`}>
                    {step > s ? "✓" : s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${step > s ? "bg-[#1D4ED8]" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <p className="font-bold text-[#0B1F3A] mb-1">填写基本信息</p>
                <div><label className="text-sm font-bold text-slate-700 mb-2 block">真实姓名</label><InputField icon={User} placeholder="请输入您的姓名" value={regName} onChange={setRegName} /></div>
                <div><label className="text-sm font-bold text-slate-700 mb-2 block">手机号</label><InputField icon={Phone} placeholder="请输入手机号" type="tel" value={regPhone} onChange={setRegPhone} /></div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">验证码</label>
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-4 py-3.5 gap-3 border border-slate-200 focus-within:border-blue-400">
                      <input type="text" placeholder="请输入验证码" value={regSmsCode} onChange={e => setRegSmsCode(e.target.value)} className="flex-1 bg-transparent text-sm text-[#0B1F3A] placeholder:text-slate-400 outline-none" />
                    </div>
                    <button onClick={handleSendSms} disabled={regSending} className="px-4 bg-[#E4EDFF] text-[#1D4ED8] rounded-2xl text-sm font-bold whitespace-nowrap disabled:opacity-60">{regSending ? "发送中..." : "获取验证码"}</button>
                  </div>
                </div>
                <PrimaryButton label="下一步" onClick={() => setStep(2)} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="font-bold text-[#0B1F3A] mb-1">设置登录密码</p>
                <div><label className="text-sm font-bold text-slate-700 mb-2 block">密码</label><InputField icon={Lock} placeholder="8位以上字母数字组合" type={showPwd ? "text" : "password"} value={regPassword} onChange={setRegPassword} right={<button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowPwd(v => !v)} className="flex-shrink-0 p-1"><Eye className="w-4 h-4 text-slate-400" /></button>} /></div>
                <div><label className="text-sm font-bold text-slate-700 mb-2 block">确认密码</label><InputField icon={Lock} placeholder="再次输入密码" type="password" value={regConfirmPwd} onChange={setRegConfirmPwd} /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">上一步</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 rounded-2xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 100%)" }}>下一步</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="font-bold text-[#0B1F3A]">求职意向</p>
                <p className="text-slate-500 text-sm -mt-2 mb-2">帮助我们精准为你推荐职位</p>
                {[
                  { label: "期望职位", placeholder: "选择期望职位" },
                  { label: "期望城市", placeholder: "选择期望城市" },
                  { label: "期望薪资", placeholder: "选择薪资范围" },
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">{label}</label>
                    <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-200">
                      <span className="text-slate-400 text-sm flex-1">{placeholder}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2 pb-6">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm">上一步</button>
                  <button onClick={handleRegisterSubmit} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl text-white font-bold text-sm disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 100%)" }}>{isSubmitting ? "注册中..." : "完成注册"}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

function HomeScreen({ user, onJobSelect, onTabChange }: {
  user: UserBrief | null;
  onJobSelect: (j: Job) => void;
  onTabChange: (t: Tab) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<{ applied: number; interview: number; favorite: number }>({ applied: 0, interview: 0, favorite: 0 });
  const categories = ["全部", "技术", "产品", "设计", "运营", "数据", "市场", "销售"];

  useEffect(() => {
    jobsApi.getJobs().then(res => setJobs(res.list.map(mapJobBrief))).catch(() => {});
    userApi.getStats().then(s => setStats({ applied: s.appliedCount ?? 0, interview: s.interviewCount ?? 0, favorite: s.favoriteCount ?? 0 })).catch(() => {});
  }, []);

  const handleToggleFavorite = async (id: number) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    const wasFav = job.isFavorited;
    setJobs(prev => prev.map(j => j.id === id ? { ...j, isFavorited: !wasFav } : j));
    try {
      await jobsApi.toggleFavorite(id);
    } catch {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isFavorited: wasFav } : j));
    }
  };

  const displayName = user?.name || "用户";
  const initial = displayName.charAt(0);

  const filtered = activeCategory === "全部"
    ? jobs
    : jobs.filter(j => j.tags.some(t => t.includes(activeCategory)) || j.title.includes(activeCategory));

  const greeting = () => { const h = new Date().getHours(); if (h < 12) return "早上好"; if (h < 18) return "下午好"; return "晚上好"; };

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-3 pb-4 bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-500 text-sm font-medium">{greeting()} 👋</p>
            <h1 className="text-[#0B1F3A] text-xl font-bold">{displayName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full bg-slate-100">
              <Bell className="w-5 h-5 text-[#0B1F3A]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="w-9 h-9 rounded-full bg-[#1D4ED8] flex items-center justify-center">
              <span className="text-white text-sm font-bold">{initial}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onTabChange("search")}
          className="w-full flex items-center bg-[#EEF3FB] rounded-2xl px-4 py-3 gap-3"
        >
          <Search className="w-5 h-5 text-slate-400" />
          <span className="text-slate-400 text-sm flex-1 text-left">搜索职位、公司、技能...</span>
          <Filter className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="flex-shrink-0 bg-white border-b border-slate-100 px-5 py-3">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <Chip key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#EEF3FB]" style={{ scrollbarWidth: "none" }}>
        <div className="px-5 pt-4">
          <div className="rounded-3xl overflow-hidden relative h-36 mb-4" style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 60%, #3B82F6 100%)" }}>
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
            <div className="relative z-10 px-5 py-5 h-full flex flex-col justify-between">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">🔥 热门专区</p>
                <h3 className="text-white font-bold text-lg mt-1">2025春招直通车</h3>
                <p className="text-white/70 text-sm">1,200+ 家企业联合招聘，高薪职位等你</p>
              </div>
              <button className="self-start px-4 py-1.5 rounded-full text-white text-xs font-bold" style={{ background: "rgba(255,255,255,0.22)" }}>
                立即查看 →
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            {[
              { label: "已投递", value: stats.applied, color: "text-[#1D4ED8]", Icon: Send },
              { label: "面试邀请", value: stats.interview, color: "text-orange-500", Icon: Clock },
              { label: "已收藏", value: stats.favorite, color: "text-red-500", Icon: Heart },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} className="flex-1 bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                <div className={`font-bold text-xl ${color}`}>{value}</div>
                <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <SectionTitle title="为你推荐" action="查看全部" />
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">加载中...</div>
          ) : (
            <div className="space-y-3 pb-6">
              {filtered.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={onJobSelect}
                  isFavorite={job.isFavorited}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Search Screen ────────────────────────────────────────────────────────────

function SearchScreen({ onJobSelect, initialQuery = "", initialShowFilters = false, initialSearched = false }: {
  onJobSelect: (j: Job) => void;
  initialQuery?: string;
  initialShowFilters?: boolean;
  initialSearched?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(initialShowFilters);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searched, setSearched] = useState(initialSearched);
  const [results, setResults] = useState<Job[]>([]);
  const [hotSearches, setHotSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    jobsApi.getHotSearches().then(setHotSearches).catch(() => {});
    jobsApi.getRecentSearches().then(setRecentSearches).catch(() => {});
    jobsApi.getFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const filterGroups = [
    { key: "city", label: "城市", options: filterOptions?.cities || [] },
    { key: "exp", label: "经验", options: filterOptions?.experiences || [] },
    { key: "edu", label: "学历", options: filterOptions?.educations || [] },
    { key: "type", label: "类型", options: filterOptions?.types || [] },
  ];

  const handleSearch = async (q: string) => {
    setQuery(q);
    setSearched(true);
    setSearching(true);
    try {
      const res = await jobsApi.searchJobs({ keyword: q, city: activeFilters.city, type: activeFilters.type, edu: activeFilters.edu, exp: activeFilters.exp });
      setResults(res.list.map(mapJobBrief));
    } catch { toast.error("搜索失败"); }
    finally { setSearching(false); }
  };

  const handleToggleFavorite = async (id: number) => {
    const job = results.find(j => j.id === id);
    if (!job) return;
    const wasFav = job.isFavorited;
    setResults(prev => prev.map(j => j.id === id ? { ...j, isFavorited: !wasFav } : j));
    try { await jobsApi.toggleFavorite(id); }
    catch { setResults(prev => prev.map(j => j.id === id ? { ...j, isFavorited: wasFav } : j)); }
  };

  const doSearch = (q: string) => {
    setQuery(q);
    setSearched(true);
  };

  return (
    <div className="h-full flex flex-col bg-[#EEF3FB]">
      <div className="bg-white px-5 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 bg-[#EEF3FB] rounded-2xl px-4 py-3 mb-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索职位、公司、技能..."
            value={query}
            onChange={e => { setQuery(e.target.value); if (e.target.value) setSearched(true); }}
            onKeyDown={e => e.key === "Enter" && handleSearch(query)}
            className="flex-1 bg-transparent text-sm text-[#0B1F3A] placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(""); setSearched(false); }}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all ${showFilters ? "bg-[#1D4ED8] text-white" : "bg-slate-100 text-slate-600"}`}
          >
            <Filter className="w-3.5 h-3.5" />筛选
          </button>
          {filterGroups.map(({ key, label }) => (
            <button
              key={key}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap transition-all ${activeFilters[key] ? "bg-[#E4EDFF] text-[#1D4ED8] border border-blue-200" : "bg-slate-100 text-slate-600"}`}
            >
              {activeFilters[key] || label}<ChevronDown className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-slate-100 px-5 py-4 flex-shrink-0">
          {filterGroups.map(({ key, label, options }) => (
            <div key={key} className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setActiveFilters(prev => ({ ...prev, [key]: prev[key] === opt ? "" : opt }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeFilters[key] === opt ? "bg-[#1D4ED8] text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setActiveFilters({})} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">重置</button>
            <button onClick={() => setShowFilters(false)} className="flex-1 py-2.5 rounded-xl bg-[#1D4ED8] text-white text-sm font-bold">确定</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {!searched ? (
          <div className="px-5 py-4">
            <SectionTitle title="热门搜索" />
            <div className="flex flex-wrap gap-2 mb-5">
              {hotSearches.map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="px-4 py-2 bg-white rounded-xl text-sm text-slate-700 border border-slate-200 font-semibold hover:border-blue-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <SectionTitle title="最近搜索" />
            {recentSearches.map(s => (
              <div key={s} className="flex items-center justify-between py-3 border-b border-slate-100">
                <button onClick={() => handleSearch(s)} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />{s}
                </button>
                <X className="w-4 h-4 text-slate-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-500 text-sm">共 <span className="text-[#0B1F3A] font-bold">{results.length}</span> 个职位</p>
              <button className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />综合排序
              </button>
            </div>
            {searching ? (
              <div className="text-center py-8 text-slate-400 text-sm">搜索中...</div>
            ) : (
              <div className="space-y-3 pb-6">
                {results.map(job => (
                  <JobCard key={job.id} job={job} onSelect={onJobSelect} isFavorite={job.isFavorited} onToggleFavorite={handleToggleFavorite} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Job Detail Screen ────────────────────────────────────────────────────────

function JobDetailScreen({ job, onBack, initialSection = "desc" }: {
  job: Job; onBack: () => void;
  initialSection?: string;
}) {
  const [detail, setDetail] = useState(job.requirements ? job : null);
  const [applied, setApplied] = useState(job.isApplied ?? false);
  const [section, setSection] = useState(initialSection);
  const [isFav, setIsFav] = useState(job.isFavorited);

  useEffect(() => {
    jobsApi.getJobDetail(job.id).then(setDetail).catch(() => {});
  }, [job.id]);

  if (!detail) return <div className="h-full flex items-center justify-center text-slate-400">加载中...</div>;

  const handleToggleFav = async () => {
    const wasFav = isFav;
    setIsFav(!wasFav);
    try { await jobsApi.toggleFavorite(job.id); }
    catch { setIsFav(wasFav); }
  };

  const handleApply = async () => {
    setApplied(true);
    try { await jobsApi.applyJob(detail.id); toast.success("投递成功"); }
    catch (err: any) { setApplied(false); toast.error(err?.message || "投递失败"); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="w-6 h-6 text-[#0B1F3A]" />
        </button>
        <span className="font-bold text-[#0B1F3A]">职位详情</span>
        <div className="flex items-center gap-3">
          <button onClick={handleToggleFav}>
            <Heart className={`w-6 h-6 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
          </button>
          <Share2 className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#EEF3FB]" style={{ scrollbarWidth: "none", paddingBottom: 100 }}>
        <div className="bg-white px-5 py-5 mb-3">
          <div className="flex items-start gap-4">
            <CompanyLogo initials={detail.initials} logoColor={detail.logoColor} size="lg" />
            <div className="flex-1">
              <h1 className="text-[#0B1F3A] font-bold text-xl leading-tight">{detail.title}</h1>
              <p className="text-slate-500 mt-0.5 font-medium">{detail.company}</p>
              <div className="text-[#1D4ED8] font-bold text-2xl mt-2">{detail.salary}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { Icon: MapPin, text: detail.location },
              { Icon: Briefcase, text: detail.experience },
              { Icon: GraduationCap, text: detail.education },
              { Icon: User, text: `招 ${detail.headcount} 人` },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-[#E4EDFF] px-3 py-1.5 rounded-full">
                <Icon className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span className="text-[#1D4ED8] text-xs font-bold">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {detail.tags.map(t => <Tag key={t} label={t} />)}
          </div>

          <p className="text-slate-400 text-xs mt-3 font-medium">发布于 {detail.postedAt}</p>
        </div>

        <div className="bg-white mb-3">
          <div className="flex border-b border-slate-100">
            {[
              { key: "desc", label: "职位描述" },
              { key: "welfare", label: "薪资福利" },
              { key: "company", label: "公司信息" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${section === key ? "border-[#1D4ED8] text-[#1D4ED8]" : "border-transparent text-slate-400"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="px-5 py-5">
            {section === "desc" && (
              <div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">{detail.desc}</p>
                <h3 className="font-bold text-[#0B1F3A] mb-3">任职要求</h3>
                <div className="space-y-2.5">
                  {detail.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] mt-2 flex-shrink-0" />
                      <p className="text-slate-700 text-sm leading-relaxed">{req}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {section === "welfare" && (
              <div className="flex flex-wrap gap-2">
                {detail.welfare.map(w => (
                  <div key={w} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 text-sm font-bold">{w}</span>
                  </div>
                ))}
              </div>
            )}
            {section === "company" && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <CompanyLogo initials={detail.initials} logoColor={detail.logoColor} size="md" />
                  <div>
                    <h3 className="font-bold text-[#0B1F3A]">{detail.company}</h3>
                    <p className="text-slate-500 text-sm">{detail.companyType} · {detail.companyStage}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "规模", value: detail.companySize },
                    { label: "类型", value: detail.companyType },
                    { label: "融资", value: detail.companyStage },
                    { label: "行业", value: "互联网" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#EEF3FB] rounded-2xl p-3">
                      <p className="text-slate-400 text-xs font-semibold">{label}</p>
                      <p className="text-[#0B1F3A] font-bold text-sm mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4 pb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-2xl border-2 border-slate-200 flex items-center justify-center">
            <Mail className="w-5 h-5 text-slate-500" />
          </button>
          <button
            onClick={handleApply}
            disabled={applied}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-base transition-all active:scale-[0.98] ${applied ? "bg-emerald-500 text-white" : "text-white"}`}
            style={applied ? {} : { background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 100%)" }}
          >
            {applied ? "✓ 已投递简历" : "立即投递"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

function ProfileScreen({ user, onNavigate, onLogout }: { user: UserBrief | null; onNavigate: (s: "resume" | "favorites" | "applications") => void; onLogout?: () => void }) {
  const [stats, setStats] = useState<{ applied: number; interview: number; offer: number; favorite: number }>({ applied: 0, interview: 0, offer: 0, favorite: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<{ name: string; title: string; location: string; email: string; resumeCompletion: number }>({ name: user?.name || "", title: user?.title || "", location: "", email: "", resumeCompletion: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi.getStats().then(s => setStats({
      applied: s.appliedCount ?? 0,
      interview: s.interviewCount ?? 0,
      offer: s.offerCount ?? 0,
      favorite: s.favoriteCount ?? 0,
    })).catch(() => {});
    userApi.getProfile().then(p => setProfile({
      name: p.name || user?.name || "",
      title: p.title || user?.title || "",
      location: p.location || "",
      email: p.email || "",
      resumeCompletion: p.resumeCompletion ?? 0,
    })).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({ name: profile.name, title: profile.title, location: profile.location, email: profile.email });
      toast.success("保存成功");
      setIsEditing(false);
    } catch (err: any) { toast.error(err?.message || "保存失败"); }
    finally { setSaving(false); }
  };

  const displayName = profile.name || user?.name || "用户";
  const initial = displayName.charAt(0);
  const displayTitle = profile.title || user?.title || "";

  return (
    <div className="h-full flex flex-col bg-[#EEF3FB]">
      <div className="bg-white px-5 pt-4 pb-5 flex-shrink-0">
        <h1 className="font-bold text-[#0B1F3A] text-lg mb-4">我的</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#1D4ED8] flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{initial}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input className="font-bold text-[#0B1F3A] text-lg w-full border-b-2 border-[#1D4ED8] outline-none bg-transparent" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="姓名" />
            ) : (
              <h2 className="font-bold text-[#0B1F3A] text-lg">{displayName}</h2>
            )}
            <p className="text-slate-500 text-sm font-medium">{user?.phone || ""}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {isEditing ? (
                <input className="text-slate-600 text-xs font-medium w-20 border-b border-slate-300 outline-none bg-transparent" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="城市" />
              ) : (
                <span className="text-slate-400 text-xs font-medium">{profile.location || displayTitle || "求职中"}</span>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="flex flex-col gap-1.5">
              <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 bg-[#1D4ED8] text-white text-xs font-bold rounded-xl">{saving ? "保存中..." : "保存"}</button>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl">取消</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="p-2.5 bg-[#EEF3FB] rounded-2xl">
              <Edit2 className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>

        {isEditing && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 w-12">职位</span>
              <input className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#1D4ED8]" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} placeholder="职位名称" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 w-12">邮箱</span>
              <input className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#1D4ED8]" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="email" />
            </div>
          </div>
        )}

        <div className="mt-4 bg-[#E4EDFF] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#0F2B5B] text-sm font-bold">简历完整度</span>
            <span className="text-[#1D4ED8] font-bold">{profile.resumeCompletion}%</span>
          </div>
          <div className="h-2 bg-[#1D4ED8]/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#1D4ED8] rounded-full transition-all" style={{ width: `${profile.resumeCompletion}%` }} />
          </div>
          <p className="text-[#1D4ED8] text-xs mt-2 font-medium">完善简历可提升完整度</p>
        </div>
      </div>

      <div className="px-5 py-4 flex-shrink-0">
        <div className="flex gap-3">
          {[
            { label: "已投递", value: stats.applied, color: "text-[#1D4ED8]" },
            { label: "面试邀请", value: stats.interview, color: "text-orange-500" },
            { label: "收到Offer", value: stats.offer, color: "text-emerald-600" },
            { label: "已收藏", value: stats.favorite, color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 bg-white rounded-2xl p-3 text-center border border-slate-100 shadow-sm">
              <div className={`font-bold text-xl ${color}`}>{value}</div>
              <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5" style={{ scrollbarWidth: "none" }}>
        <div className="space-y-2.5">
          {[
            { Icon: FileText, label: "我的简历", sub: `已完善 ${profile.resumeCompletion}%`, key: "resume" as const, bg: "bg-blue-50", fg: "text-[#1D4ED8]" },
            { Icon: Send, label: "投递记录", sub: `${stats.applied} 份投递`, key: "applications" as const, bg: "bg-purple-50", fg: "text-purple-600" },
            { Icon: Heart, label: "我的收藏", sub: `${stats.favorite} 个职位`, key: "favorites" as const, bg: "bg-red-50", fg: "text-red-500" },
            { Icon: Briefcase, label: "求职意向", sub: `${profile.title || "未设置"} · ${profile.location || "未设置"}`, key: "resume" as const, bg: "bg-orange-50", fg: "text-orange-500" },
          ].map(({ Icon, label, sub, key, bg, fg }) => (
            <button
              key={label}
              onClick={() => onNavigate(key)}
              className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${fg}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-[#0B1F3A] text-sm">{label}</p>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">{sub}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          ))}

          {[
            { Icon: Settings, label: "设置" },
            { Icon: Award, label: "帮助与反馈" },
          ].map(({ Icon, label }) => (
            <button key={label} className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-slate-500" />
              </div>
              <span className="flex-1 text-left font-bold text-[#0B1F3A] text-sm">{label}</span>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          ))}

          <button onClick={onLogout} className="w-full py-4 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-sm mb-6">
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resume Screen ────────────────────────────────────────────────────────────

function ResumeScreen({ onBack, initialEditMode = false }: { onBack: () => void; initialEditMode?: boolean }) {
  const [editMode, setEditMode] = useState(initialEditMode);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    userApi.getResume().then(setResume).catch(() => {});
  }, []);

  const fullName = resume?.name || "用户";
  const initial = fullName.charAt(0);

  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      await userApi.updateResume({
        title: resume.title || undefined,
        skills: resume.skills,
        workExperiences: resume.workExperiences?.map(we => ({ company: we.company, title: we.title, period: we.period, description: we.description })),
        educations: resume.educations?.map(ed => ({ school: ed.school, degree: ed.degree, major: ed.major, period: ed.period })),
      });
      // Refresh to get updated completeness
      const updated = await userApi.getResume();
      setResume(updated);
      toast.success("简历已保存");
      setEditMode(false);
    } catch (err: any) { toast.error(err?.message || "保存失败"); }
    finally { setSaving(false); }
  };

  const removeSkill = (skill: string) => {
    if (!resume) return;
    setResume({ ...resume, skills: resume.skills?.filter(s => s !== skill) || [] });
  };

  const addSkill = () => {
    if (!newSkill.trim() || !resume) return;
    if (resume.skills?.includes(newSkill.trim())) { toast.error("技能已存在"); return; }
    setResume({ ...resume, skills: [...(resume.skills || []), newSkill.trim()] });
    setNewSkill("");
  };

  const removeWorkExp = (i: number) => {
    if (!resume) return;
    const we = [...(resume.workExperiences || [])];
    we.splice(i, 1);
    setResume({ ...resume, workExperiences: we });
  };

  const removeEducation = (i: number) => {
    if (!resume) return;
    const ed = [...(resume.educations || [])];
    ed.splice(i, 1);
    setResume({ ...resume, educations: ed });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <button onClick={onBack}><ChevronLeft className="w-6 h-6 text-[#0B1F3A]" /></button>
        <span className="font-bold text-[#0B1F3A]">我的简历</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            disabled={saving}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${editMode ? "bg-[#1D4ED8] text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {editMode ? (saving ? "保存中..." : "保存") : "编辑"}
          </button>
          {editMode && <button onClick={() => { setEditMode(false); userApi.getResume().then(setResume); }} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">取消</button>}
          <Download className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#EEF3FB]" style={{ scrollbarWidth: "none" }}>
        <div className="bg-white mb-3 px-5 py-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 rounded-3xl bg-[#1D4ED8] flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{initial}</span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-[#0B1F3A] text-xl">{fullName}</h2>
              <p className="text-slate-500 text-sm font-medium">{resume?.title || ""}</p>
              <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs font-medium">
                <span>{resume?.location || ""}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { Icon: Phone, v: resume?.phone || "" },
              { Icon: Mail, v: resume?.email || "" },
              { Icon: MapPin, v: resume?.location || "" },
            ].filter(x => x.v).map(({ Icon, v }) => (
              <div key={v} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                <Icon className="w-4 h-4 text-slate-400" /><span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white mb-3 px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B1F3A]">工作经历</h3>
          </div>
          <div className="space-y-5">
            {(resume?.workExperiences || []).map(({ company, title, period, description }, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-blue-200">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-[#0B1F3A]">{title}</h4>
                    <p className="text-[#1D4ED8] text-sm font-bold">{company}</p>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">{period}</p>
                  </div>
                  {editMode && (
                    <button onClick={() => removeWorkExp(i)} className="p-1.5 bg-red-50 rounded-lg flex-shrink-0"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  )}
                </div>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">{description}</p>
              </div>
            ))}
            {(!resume?.workExperiences || resume.workExperiences.length === 0) && (
              <p className="text-slate-400 text-sm text-center py-4">{resume ? "暂无工作经历" : "加载中..."}</p>
            )}
          </div>
        </div>

        <div className="bg-white mb-3 px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B1F3A]">教育经历</h3>
          </div>
          {(resume?.educations || []).map(({ school, major, degree, period }, i) => (
            <div key={i} className="flex items-start justify-between mb-4 last:mb-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF3FB] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B1F3A]">{school}</h4>
                  <p className="text-slate-500 text-sm font-medium">{major}{degree ? ` · ${degree}` : ""}</p>
                  <p className="text-slate-400 text-xs mt-0.5 font-medium">{period}</p>
                </div>
              </div>
              {editMode && <button onClick={() => removeEducation(i)} className="p-1.5 bg-red-50 rounded-lg flex-shrink-0"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>}
            </div>
          ))}
          {(!resume?.educations || resume.educations.length === 0) && (
            <p className="text-slate-400 text-sm text-center py-4">{resume ? "暂无教育经历" : ""}</p>
          )}
        </div>

        <div className="bg-white mb-3 px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B1F3A]">技能特长</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(resume?.skills || []).map(skill => (
              <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E4EDFF] rounded-full">
                <span className="text-[#1D4ED8] text-sm font-bold">{skill}</span>
                {editMode && <button onClick={() => removeSkill(skill)}><X className="w-3.5 h-3.5 text-[#1D4ED8]/60 hover:text-red-500" /></button>}
              </div>
            ))}
            {editMode && (
              <div className="flex items-center gap-1">
                <input
                  className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-full outline-none focus:border-[#1D4ED8]"
                  placeholder="新技能"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                />
                <button onClick={addSkill} className="flex items-center gap-0.5 px-2 py-1 border-2 border-dashed border-slate-200 rounded-full text-slate-400 text-sm hover:border-[#1D4ED8]">
                  <Plus className="w-3.5 h-3.5" />添加
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}

// ─── Favorites Screen ─────────────────────────────────────────────────────────

function FavoritesScreen({ onJobSelect, onBack }: {
  onJobSelect: (j: Job) => void;
  onBack: () => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getFavorites(0, 100).then(res => { setJobs(res.list.map(mapJobBrief)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleToggleFavorite = async (id: number) => {
    try { await jobsApi.toggleFavorite(id); setJobs(prev => prev.filter(j => j.id !== id)); }
    catch { toast.error("取消收藏失败"); }
  };

  return (
    <div className="h-full flex flex-col">
      <TopBar title="我的收藏" onBack={onBack} right={<span className="text-slate-400 text-sm font-medium">{jobs.length}个</span>} />
      <div className="flex-1 overflow-y-auto bg-[#EEF3FB] px-5 py-4" style={{ scrollbarWidth: "none" }}>
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">加载中...</div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
              <Heart className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-500 font-bold">暂无收藏的职位</p>
            <p className="text-slate-400 text-sm mt-1">浏览职位时点击 ❤️ 即可收藏</p>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onSelect={onJobSelect} isFavorite={true} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Applications Screen ──────────────────────────────────────────────────────

function ApplicationsScreen({ onBack }: {
  onBack?: () => void;
}) {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getApplications(undefined, 0, 100).then(data => { setApplications(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusTabs = [
    { key: "all", label: "全部" },
    { key: "PENDING", label: "待查看" },
    { key: "INTERVIEW", label: "面试" },
    { key: "OFFER", label: "Offer" },
    { key: "REJECTED", label: "未通过" },
  ];

  const filtered = activeStatus === "all" ? applications : applications.filter(a => a.status === activeStatus);

  const getStatus = (s: string) => STATUS_MAP[s.toUpperCase()] || STATUS_MAP.PENDING;

  const handleCancelApply = async (app: ApplicationResponse) => {
    try {
      await jobsApi.cancelApplication(app.jobId);
      setApplications(prev => prev.filter(a => a.id !== app.id));
      toast.success("已取消投递");
    } catch (err: any) { toast.error(err?.message || "取消失败"); }
  };

  return (
    <div className="h-full flex flex-col">
      {onBack ? (
        <TopBar title="投递记录" onBack={onBack} right={<span className="text-slate-400 text-sm font-medium">{applications.length}份</span>} />
      ) : (
        <div className="px-5 pt-4 pb-2 bg-white flex-shrink-0 border-b border-slate-100">
          <h1 className="font-bold text-[#0B1F3A] text-lg">投递记录</h1>
        </div>
      )}

      <div className="bg-white border-b border-slate-100 px-5 py-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {statusTabs.map(({ key, label }) => (
            <Chip key={key} label={label} active={activeStatus === key} onClick={() => setActiveStatus(key)} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#EEF3FB] px-5 py-4" style={{ scrollbarWidth: "none" }}>
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">加载中...</div>
        ) : (
        <div className="space-y-3 pb-6">
          {filtered.map(app => {
            const conf = getStatus(app.status);
            return (
              <div key={app.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <CompanyLogo initials={app.initials} logoColor={app.logoColor} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[#0B1F3A] text-[15px]">{app.title}</h3>
                        <p className="text-slate-500 text-sm font-medium">{app.company}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${conf.bg} ${conf.color} flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                        {app.statusText}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#1D4ED8] font-bold text-sm">{app.salary}</span>
                      <span className="text-slate-400 text-xs font-medium">投递于 {app.appliedAt}</span>
                    </div>
                    {app.interviewAt && (
                      <div className="mt-2.5 px-3 py-2 bg-orange-50 rounded-xl flex items-center gap-2 border border-orange-100">
                        <Star className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-700 text-xs font-bold">面试时间：{app.interviewAt}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleCancelApply(app)}
                  className="absolute top-3 right-3 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="取消投递"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

// ─── Design Spec Panel ────────────────────────────────────────────────────────

function DesignSpec({ onClose }: { onClose: () => void }) {
  const colors = [
    { name: "深海蓝 (Primary)", hex: "#0F2B5B", cls: "bg-[#0F2B5B]" },
    { name: "交互蓝 (Accent)", hex: "#1D4ED8", cls: "bg-[#1D4ED8]" },
    { name: "天蓝 (Blue-500)", hex: "#3B82F6", cls: "bg-[#3B82F6]" },
    { name: "背景色 (Background)", hex: "#EEF3FB", cls: "bg-[#EEF3FB] border border-slate-200" },
    { name: "卡片白 (Card)", hex: "#FFFFFF", cls: "bg-white border border-slate-200" },
    { name: "辅助蓝 (Secondary)", hex: "#E4EDFF", cls: "bg-[#E4EDFF]" },
    { name: "正文深 (Foreground)", hex: "#0B1F3A", cls: "bg-[#0B1F3A]" },
    { name: "次文字 (Muted fg)", hex: "#5A7094", cls: "bg-[#5A7094]" },
    { name: "成功绿 (Success)", hex: "#10B981", cls: "bg-emerald-500" },
    { name: "警告橙 (Warning)", hex: "#F59E0B", cls: "bg-amber-500" },
    { name: "危险红 (Danger)", hex: "#DC2626", cls: "bg-red-600" },
    { name: "热门橙 (Hot)", hex: "#F97316", cls: "bg-orange-500" },
  ];

  const spacing = ["4px (xs)", "8px (sm)", "12px", "16px (base)", "20px", "24px (lg)", "32px (xl)", "40px (2xl)", "48px (3xl)"];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-start justify-center p-6 pt-16">
        <div
          className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 100%)" }}>
            <div>
              <h2 className="text-white font-bold text-xl">设计规范</h2>
              <p className="text-white/70 text-sm font-medium">Design Specification — Flutter 开发参考</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-xl">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-8">
            {/* Colors */}
            <div>
              <h3 className="font-bold text-[#0B1F3A] text-base mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#1D4ED8] rounded-full" />色彩系统
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {colors.map(({ name, hex, cls }) => (
                  <div key={hex} className="flex flex-col gap-1.5">
                    <div className={`h-12 rounded-xl ${cls}`} />
                    <p className="text-[#0B1F3A] text-xs font-bold leading-tight">{name}</p>
                    <p className="text-slate-400 text-xs font-mono">{hex}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="font-bold text-[#0B1F3A] text-base mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#1D4ED8] rounded-full" />字体规范
              </h3>
              <div className="bg-[#EEF3FB] rounded-2xl p-4 space-y-3">
                <p className="text-slate-500 text-xs font-mono mb-3">Font Family: Plus Jakarta Sans</p>
                {[
                  { size: "24px / Bold 700", label: "页面标题 H1", cls: "text-2xl font-bold" },
                  { size: "20px / Bold 700", label: "卡片标题 H2", cls: "text-xl font-bold" },
                  { size: "17px / SemiBold 600", label: "列表项标题 H3", cls: "text-[17px] font-semibold" },
                  { size: "15px / SemiBold 600", label: "正文强调 Body M", cls: "text-[15px] font-semibold" },
                  { size: "14px / Regular 400", label: "正文内容 Body", cls: "text-sm font-normal" },
                  { size: "12px / Medium 500", label: "辅助信息 Caption", cls: "text-xs font-medium" },
                  { size: "10px / Bold 700", label: "标签 Badge", cls: "text-[10px] font-bold" },
                ].map(({ size, label, cls }) => (
                  <div key={size} className="flex items-center justify-between gap-4">
                    <span className={`${cls} text-[#0B1F3A]`}>{label}</span>
                    <span className="text-slate-400 text-xs font-mono flex-shrink-0">{size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <h3 className="font-bold text-[#0B1F3A] text-base mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#1D4ED8] rounded-full" />间距规范
              </h3>
              <div className="flex flex-wrap gap-2">
                {spacing.map(s => (
                  <div key={s} className="px-3 py-2 bg-[#EEF3FB] rounded-xl">
                    <span className="text-[#0B1F3A] text-xs font-mono font-bold">{s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-[#EEF3FB] rounded-2xl p-4 space-y-1.5 text-xs font-mono text-slate-500">
                <p>• 圆角 / Border Radius</p>
                <p className="ml-3">卡片 Card: 16px  |  按钮 Button: 16px  |  标签 Tag: 999px</p>
                <p className="ml-3">图标容器: 12px  |  手机安全区: ≥16px 边距</p>
                <p className="mt-2">• 安全边距 / Safe Area</p>
                <p className="ml-3">顶部状态栏: 44px  |  底部导航: 80px + Home indicator</p>
              </div>
            </div>

            {/* Components */}
            <div>
              <h3 className="font-bold text-[#0B1F3A] text-base mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#1D4ED8] rounded-full" />组件库
              </h3>

              <div className="space-y-5">
                {/* Buttons */}
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">按钮 Buttons</p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-6 py-3 rounded-2xl text-white text-sm font-bold" style={{ background: "linear-gradient(135deg, #0F2B5B 0%, #1D4ED8 100%)" }}>主要按钮</button>
                    <button className="px-6 py-3 rounded-2xl text-[#1D4ED8] text-sm font-bold bg-[#E4EDFF]">次要按钮</button>
                    <button className="px-6 py-3 rounded-2xl text-slate-600 text-sm font-bold border-2 border-slate-200">线框按钮</button>
                    <button className="px-6 py-3 rounded-2xl text-white text-sm font-bold bg-emerald-500">成功状态</button>
                    <button className="px-6 py-3 rounded-2xl text-white text-sm font-bold bg-red-500">危险操作</button>
                  </div>
                </div>

                {/* Inputs */}
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">输入框 Inputs</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-3.5 gap-3 border-2 border-[#1D4ED8]">
                      <Search className="w-4 h-4 text-[#1D4ED8]" />
                      <span className="text-sm text-[#0B1F3A]">已聚焦状态</span>
                    </div>
                    <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-3.5 gap-3 border border-slate-200">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">默认 / 占位符状态</span>
                    </div>
                  </div>
                </div>

                {/* Tags / Chips */}
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">标签 Tags & Chips</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">默认标签</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4EDFF] text-[#1D4ED8]">蓝色标签</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">绿色标签</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1D4ED8] text-white">NEW</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white">热</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />面试邀请</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />收到Offer</span>
                  </div>
                </div>

                {/* Cards */}
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">卡片 Cards</p>
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] flex items-center justify-center text-white font-bold">字</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-[#0B1F3A] text-[15px]">高级前端工程师</span>
                          <span className="px-1.5 py-0.5 bg-[#1D4ED8] text-white text-[10px] font-bold rounded-full">NEW</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">字节跳动</p>
                        <p className="text-[#1D4ED8] font-bold mt-1.5">25–45K · 15薪</p>
                        <div className="flex gap-1.5 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">React</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">TypeScript</span>
                        </div>
                      </div>
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400 text-xs">2小时前 · 招3人</span>
                      <span className="text-[#1D4ED8] text-xs font-bold">立即投递 →</span>
                    </div>
                  </div>
                </div>

                {/* Nav bar */}
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">底部导航栏 Bottom Navigation</p>
                  <div className="bg-white border border-slate-200 rounded-2xl py-3 px-2">
                    <div className="flex items-center justify-around">
                      {[
                        { Icon: Home, label: "首页", active: true },
                        { Icon: Search, label: "找工作", active: false },
                        { Icon: Send, label: "投递", active: false },
                        { Icon: User, label: "我的", active: false },
                      ].map(({ Icon, label, active }) => (
                        <div key={label} className={`flex flex-col items-center gap-1 px-4 ${active ? "text-[#1D4ED8]" : "text-slate-400"}`}>
                          <Icon className="w-6 h-6" />
                          <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flutter notes */}
            <div>
              <h3 className="font-bold text-[#0B1F3A] text-base mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#1D4ED8] rounded-full" />Flutter 开发说明
              </h3>
              <div className="bg-[#0F2B5B] rounded-2xl p-4 space-y-2 text-xs font-mono">
                {[
                  "primaryColor: Color(0xFF0F2B5B)",
                  "accentColor: Color(0xFF1D4ED8)",
                  "backgroundColor: Color(0xFFEEF3FB)",
                  "cardColor: Color(0xFFFFFFFF)",
                  "textTheme: Plus Jakarta Sans",
                  "borderRadius: BorderRadius.circular(16)",
                  "cardElevation: 1.0 (BoxShadow: 0 2px 8px rgba(0,0,0,0.06))",
                  "safeArea: MediaQuery.of(context).padding",
                  "bottomNavHeight: 80.0 + MediaQuery.padding.bottom",
                ].map(line => (
                  <p key={line} className="text-blue-200">{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Static Phone Frame (for design canvas) ──────────────────────────────────

const CANVAS_SCALE = 0.44;
const PW = 390;
const PH = 844;

function StaticPhoneFrame({ label, sublabel, showNav = false, navTab = "home" as Tab, frameNum, children, onOpen }: {
  label: string;
  sublabel?: string;
  showNav?: boolean;
  navTab?: Tab;
  frameNum?: number;
  children: React.ReactNode;
  onOpen?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const sw = Math.round(PW * CANVAS_SCALE);
  const sh = Math.round(PH * CANVAS_SCALE);

  return (
    <div
      style={{ width: sw }}
      className="flex-shrink-0 flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {frameNum !== undefined && (
        <div className="mb-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-white/60 text-[10px] font-bold">{frameNum}</span>
        </div>
      )}
      <div
        onClick={onOpen}
        style={{
          width: sw,
          height: sh,
          borderRadius: Math.round(50 * CANVAS_SCALE),
          border: hovered && onOpen ? "2px solid #3B82F6" : `${Math.round(6 * CANVAS_SCALE)}px solid #101828`,
          overflow: "hidden",
          position: "relative",
          boxShadow: hovered && onOpen
            ? "0 0 0 4px rgba(59,130,246,0.25), 0 24px 48px rgba(0,0,0,0.45)"
            : "0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset",
          flexShrink: 0,
          background: "#EEF3FB",
          cursor: onOpen ? "pointer" : "default",
          transition: "box-shadow 0.15s, border-color 0.15s",
        }}
      >
        {/* Scaled content */}
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: PW, height: PH,
          transform: `scale(${CANVAS_SCALE})`,
          transformOrigin: "top left",
          pointerEvents: "none",
          userSelect: "none",
        }}>
          <div style={{ width: PW, height: PH, background: "#EEF3FB", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              {children}
            </div>
            {showNav && <BottomNav activeTab={navTab} onTabChange={() => {}} />}
          </div>
        </div>
        {/* Hover overlay hint */}
        {hovered && onOpen && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 60,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(15,43,91,0.55)",
          }}>
            <div style={{
              padding: "6px 14px", borderRadius: 20,
              background: "#1D4ED8", color: "white",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
            }}>
              点击预览
            </div>
          </div>
        )}
      </div>
      {/* Labels */}
      <div className="mt-3 text-center">
        <p className="text-white font-bold text-sm leading-tight">{label}</p>
        {sublabel && <p className="text-white/40 text-xs mt-0.5 font-medium">{sublabel}</p>}
      </div>
    </div>
  );
}

// ─── Design Canvas ────────────────────────────────────────────────────────────

interface PreviewState {
  label: string;
  sublabel?: string;
  showNav?: boolean;
  navTab?: Tab;
  render: () => React.ReactNode;
}

function PhonePreviewOverlay({ preview, onClose }: { preview: PreviewState; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(5,10,25,0.88)" }}
      onClick={onClose}
    >
      <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
        {/* Close + label row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{preview.label}</p>
            {preview.sublabel && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>{preview.sublabel}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, marginLeft: 24 }}
          >
            ×
          </button>
        </div>
        {/* Phone shell */}
        <div style={{
          width: PW, height: PH,
          borderRadius: 50,
          border: "6px solid #101828",
          overflow: "hidden",
          background: "#EEF3FB",
          boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08) inset",
          display: "flex", flexDirection: "column",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {preview.render()}
          </div>
          {preview.showNav && <BottomNav activeTab={preview.navTab ?? "home"} onTabChange={() => {}} />}
        </div>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center", marginTop: 10 }}>点击外部关闭 · 组件可完整交互</p>
      </div>
    </div>
  );
}

function DesignCanvas() {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const noop = () => {};
  const dummyLogin = (res: any) => {};
  // Inline mock data for design canvas preview only
  const CANVAS_JOBS: Job[] = [
    { id: 1, title: "高级前端工程师", company: "字节跳动", initials: "字", logoColor: "#1A1A2E", location: "北京", salary: "25-45K · 15薪", experience: "3-5年", education: "本科", headcount: 3, tags: ["React", "TypeScript", "前端"], isNew: true, isHot: true, postedAt: "2小时前", isFavorited: true, desc: "负责核心产品前端开发", requirements: ["3年以上React经验", "熟悉TypeScript"], welfare: ["五险一金", "年终奖金"], companySize: "10000+人", companyType: "互联网", companyStage: "D轮及以上", industry: "互联网" },
    { id: 2, title: "UI设计师", company: "美团", initials: "美", logoColor: "#FFD100", location: "上海", salary: "20-35K · 14薪", experience: "1-3年", education: "本科", headcount: 2, tags: ["UI", "Figma", "设计"], isNew: false, isHot: true, postedAt: "5小时前", isFavorited: false, desc: "负责产品UI设计", requirements: ["熟悉Figma"], welfare: ["五险一金", "弹性工作"], companySize: "5000+人", companyType: "互联网", companyStage: "上市", industry: "互联网" },
    { id: 3, title: "产品经理", company: "腾讯", initials: "腾", logoColor: "#0066CC", location: "深圳", salary: "30-50K · 16薪", experience: "3-5年", education: "本科", headcount: 1, tags: ["B端", "企业服务"], isNew: false, isHot: false, postedAt: "1天前", isFavorited: true, desc: "企业服务产品设计", requirements: ["3年产品经验"], welfare: ["五险一金"], companySize: "10000+人", companyType: "互联网", companyStage: "上市", industry: "互联网" },
    { id: 4, title: "数据分析师", company: "阿里巴巴", initials: "阿", logoColor: "#FF6A00", location: "杭州", salary: "20-40K", experience: "1-3年", education: "硕士", headcount: 2, tags: ["SQL", "Python"], isNew: false, isHot: true, postedAt: "3小时前", isFavorited: false, desc: "数据驱动业务决策", requirements: ["熟练SQL"], welfare: ["五险一金"], companySize: "10000+人", companyType: "互联网", companyStage: "上市", industry: "互联网" },
    { id: 5, title: "Java开发工程师", company: "华为", initials: "华", logoColor: "#CF0A2C", location: "深圳", salary: "25-50K", experience: "3-5年", education: "本科", headcount: 5, tags: ["Java", "Spring"], isNew: false, isHot: false, postedAt: "2天前", isFavorited: false, desc: "云服务开发", requirements: ["熟悉Spring Boot"], welfare: ["五险一金"], companySize: "10000+人", companyType: "通讯", companyStage: "未融资", industry: "通讯" },
    { id: 6, title: "前端实习生", company: "小红书", initials: "小", logoColor: "#FE2C55", location: "上海", salary: "200-300/天", experience: "应届生", education: "本科", headcount: 3, tags: ["React", "实习"], isNew: true, isHot: false, postedAt: "1小时前", isFavorited: false, desc: "参与小红书前端开发", requirements: ["熟悉React"], welfare: ["餐补"], companySize: "3000+人", companyType: "互联网", companyStage: "D轮及以上", industry: "互联网" },
  ];
  const CANVAS_APPS: ApplicationResponse[] = [
    { id: 1, jobId: 1, title: "高级前端工程师", company: "字节跳动", initials: "字", logoColor: "#1A1A2E", salary: "25-45K", status: "INTERVIEW", statusText: "面试邀请", appliedAt: "2天前", interviewAt: "2025-03-15 14:00" },
    { id: 2, jobId: 3, title: "产品经理", company: "腾讯", initials: "腾", logoColor: "#0066CC", salary: "30-50K", status: "PENDING", statusText: "已投递", appliedAt: "1天前", interviewAt: null },
    { id: 3, jobId: 4, title: "数据分析师", company: "阿里巴巴", initials: "阿", logoColor: "#FF6A00", salary: "20-40K", status: "VIEWED", statusText: "已查看", appliedAt: "3天前", interviewAt: null },
    { id: 4, jobId: 5, title: "Java开发工程师", company: "华为", initials: "华", logoColor: "#CF0A2C", salary: "25-50K", status: "OFFER", statusText: "收到Offer", appliedAt: "5天前", interviewAt: null },
    { id: 5, jobId: 6, title: "前端实习生", company: "小红书", initials: "小", logoColor: "#FE2C55", salary: "200-300/天", status: "REJECTED", statusText: "未通过", appliedAt: "7天前", interviewAt: null },
  ];
  const dummyJob = CANVAS_JOBS[0];
  const dummyFavs = [1, 3];

  const sw = Math.round(PW * CANVAS_SCALE);

  function SectionLabel({ num, title, en, count }: { num: string; title: string; en: string; count: number }) {
    return (
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-white/30 font-mono text-sm font-bold">{num}</span>
          <div className="w-0.5 h-5 bg-[#1D4ED8] rounded-full" />
          <span className="text-white font-bold text-lg">{title}</span>
          <span className="text-white/40 text-sm font-medium">{en}</span>
        </div>
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-white/25 text-xs font-mono">{count} screens</span>
      </div>
    );
  }

  return (<>
    <div
      className="w-full min-h-screen overflow-x-auto"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #0f2147 50%, #091530 100%)" }}
    >
      {/* Canvas header */}
      <div className="px-12 pt-12 pb-8 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(29,78,216,0.3)" }}>
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white/50 text-sm font-mono font-bold tracking-widest uppercase">Figma · 设计稿 · v1.0</span>
            </div>
            <h1 className="text-white font-bold text-3xl">猎职 LieZhi</h1>
            <p className="text-white/40 text-base mt-1 font-medium">招聘 App · 完整UI设计稿 · 15 个独立页面框架 · iPhone 14 Pro (390×844)</p>
          </div>
          <div className="flex flex-col gap-2 text-right">
            {[
              { label: "设计规范", value: "Swiss · 简约职场风" },
              { label: "主色调", value: "#0F2B5B / #1D4ED8" },
              { label: "字体", value: "Plus Jakarta Sans" },
              { label: "适配", value: "iOS 16 · Android 13" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 justify-end">
                <span className="text-white/30 text-xs font-medium">{label}</span>
                <span className="text-white/70 text-xs font-mono font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-12 py-10 space-y-16">

        {/* ── Section 01: Authentication ── */}
        <div>
          <SectionLabel num="01" title="认证流程" en="Authentication" count={4} />
          <div className="flex gap-8 flex-wrap">
            <StaticPhoneFrame label="账号登录" sublabel="Login" frameNum={1}
              onOpen={() => setPreview({ label: "账号登录", sublabel: "Login", render: () => <LoginScreen onLogin={dummyLogin} initialMode="login" /> })}>
              <LoginScreen onLogin={dummyLogin} initialMode="login" />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="注册·填写信息" sublabel="Register Step 1" frameNum={2}
              onOpen={() => setPreview({ label: "注册·填写信息", sublabel: "Register Step 1", render: () => <LoginScreen onLogin={dummyLogin} initialMode="register" initialStep={1} /> })}>
              <LoginScreen onLogin={dummyLogin} initialMode="register" initialStep={1} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="注册·设置密码" sublabel="Register Step 2" frameNum={3}
              onOpen={() => setPreview({ label: "注册·设置密码", sublabel: "Register Step 2", render: () => <LoginScreen onLogin={dummyLogin} initialMode="register" initialStep={2} /> })}>
              <LoginScreen onLogin={dummyLogin} initialMode="register" initialStep={2} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="注册·求职意向" sublabel="Register Step 3" frameNum={4}
              onOpen={() => setPreview({ label: "注册·求职意向", sublabel: "Register Step 3", render: () => <LoginScreen onLogin={dummyLogin} initialMode="register" initialStep={3} /> })}>
              <LoginScreen onLogin={dummyLogin} initialMode="register" initialStep={3} />
            </StaticPhoneFrame>
          </div>
        </div>

        {/* ── Section 02: Discovery ── */}
        <div>
          <SectionLabel num="02" title="职位发现" en="Job Discovery" count={4} />
          <div className="flex gap-8 flex-wrap">
            <StaticPhoneFrame label="职位首页" sublabel="Home Feed" frameNum={5} showNav navTab="home"
              onOpen={() => setPreview({ label: "职位首页", sublabel: "Home Feed", showNav: true, navTab: "home", render: () => <HomeScreen user={null} onJobSelect={noop} onTabChange={noop} /> })}>
              <HomeScreen user={null} onJobSelect={noop} onTabChange={noop} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="搜索·发现" sublabel="Search Default" frameNum={6} showNav navTab="search"
              onOpen={() => setPreview({ label: "搜索·发现", sublabel: "Search Default", showNav: true, navTab: "search", render: () => <SearchScreen onJobSelect={noop} /> })}>
              <SearchScreen onJobSelect={noop} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="搜索·结果列表" sublabel="Search Results" frameNum={7} showNav navTab="search"
              onOpen={() => setPreview({ label: "搜索·结果列表", sublabel: "Search Results", showNav: true, navTab: "search", render: () => <SearchScreen onJobSelect={noop} initialQuery="前端工程师" initialSearched={true} /> })}>
              <SearchScreen onJobSelect={noop}
                initialQuery="前端工程师" initialSearched={true} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="搜索·筛选面板" sublabel="Filter Panel Open" frameNum={8} showNav navTab="search"
              onOpen={() => setPreview({ label: "搜索·筛选面板", sublabel: "Filter Panel Open", showNav: true, navTab: "search", render: () => <SearchScreen onJobSelect={noop} initialQuery="前端" initialSearched={true} initialShowFilters={true} /> })}>
              <SearchScreen onJobSelect={noop}
                initialQuery="前端" initialSearched={true} initialShowFilters={true} />
            </StaticPhoneFrame>
          </div>
        </div>

        {/* ── Section 03: Job Detail ── */}
        <div>
          <SectionLabel num="03" title="职位详情" en="Job Detail" count={3} />
          <div className="flex gap-8 flex-wrap">
            <StaticPhoneFrame label="职位详情·描述" sublabel="Job Description Tab" frameNum={9}
              onOpen={() => setPreview({ label: "职位详情·描述", sublabel: "Job Description Tab", render: () => <JobDetailScreen job={dummyJob} onBack={noop} initialSection="desc" /> })}>
              <JobDetailScreen job={dummyJob} onBack={noop} initialSection="desc" />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="职位详情·福利" sublabel="Welfare & Benefits Tab" frameNum={10}
              onOpen={() => setPreview({ label: "职位详情·福利", sublabel: "Welfare & Benefits Tab", render: () => <JobDetailScreen job={CANVAS_JOBS[1]} onBack={noop} initialSection="welfare" /> })}>
              <JobDetailScreen job={CANVAS_JOBS[1]} onBack={noop} initialSection="welfare" />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="职位详情·公司" sublabel="Company Info Tab" frameNum={11}
              onOpen={() => setPreview({ label: "职位详情·公司", sublabel: "Company Info Tab", render: () => <JobDetailScreen job={CANVAS_JOBS[4]} onBack={noop} initialSection="company" /> })}>
              <JobDetailScreen job={CANVAS_JOBS[4]} onBack={noop} initialSection="company" />
            </StaticPhoneFrame>
          </div>
        </div>

        {/* ── Section 04: Personal Space ── */}
        <div>
          <SectionLabel num="04" title="个人空间" en="Personal Center" count={4} />
          <div className="flex gap-8 flex-wrap">
            <StaticPhoneFrame label="个人中心" sublabel="Profile Center" frameNum={12} showNav navTab="profile"
              onOpen={() => setPreview({ label: "个人中心", sublabel: "Profile Center", showNav: true, navTab: "profile", render: () => <ProfileScreen user={null} onNavigate={noop} /> })}>
              <ProfileScreen user={null} onNavigate={noop} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="简历管理·查看" sublabel="Resume View Mode" frameNum={13}
              onOpen={() => setPreview({ label: "简历管理·查看", sublabel: "Resume View Mode", render: () => <ResumeScreen onBack={noop} initialEditMode={false} /> })}>
              <ResumeScreen onBack={noop} initialEditMode={false} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="简历管理·编辑" sublabel="Resume Edit Mode" frameNum={14}
              onOpen={() => setPreview({ label: "简历管理·编辑", sublabel: "Resume Edit Mode", render: () => <ResumeScreen onBack={noop} initialEditMode={true} /> })}>
              <ResumeScreen onBack={noop} initialEditMode={true} />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="我的收藏" sublabel="Saved Jobs" frameNum={15}
              onOpen={() => setPreview({ label: "我的收藏", sublabel: "Saved Jobs", render: () => <FavoritesScreen onJobSelect={noop} onBack={noop} /> })}>
              <FavoritesScreen onJobSelect={noop} onBack={noop} />
            </StaticPhoneFrame>
          </div>
        </div>

        {/* ── Section 05: Applications ── */}
        <div>
          <SectionLabel num="05" title="投递记录" en="Application Tracking" count={2} />
          <div className="flex gap-8 flex-wrap">
            <StaticPhoneFrame label="投递记录·全部" sublabel="All Applications" frameNum={16} showNav navTab="applications"
              onOpen={() => setPreview({ label: "投递记录·全部", sublabel: "All Applications", showNav: true, navTab: "applications", render: () => <ApplicationsScreen /> })}>
              <ApplicationsScreen />
            </StaticPhoneFrame>
            <StaticPhoneFrame label="投递记录·面试" sublabel="Interview Status" frameNum={17} showNav navTab="applications"
              onOpen={() => setPreview({ label: "投递记录·面试", sublabel: "Interview Status", showNav: true, navTab: "applications", render: () => <ApplicationsScreen /> })}>
              <ApplicationsScreen />
            </StaticPhoneFrame>
          </div>
        </div>

        {/* ── Design Tokens Reference ── */}
        <div>
          <SectionLabel num="06" title="设计规范参考" en="Design Tokens" count={0} />
          <div className="grid grid-cols-3 gap-6">
            {/* Color System */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">色彩系统 Color System</p>
              <div className="space-y-2.5">
                {[
                  { name: "Primary Navy", hex: "#0F2B5B", cls: "bg-[#0F2B5B]" },
                  { name: "Accent Blue", hex: "#1D4ED8", cls: "bg-[#1D4ED8]" },
                  { name: "Sky Blue", hex: "#3B82F6", cls: "bg-[#3B82F6]" },
                  { name: "Background", hex: "#EEF3FB", cls: "bg-[#EEF3FB]" },
                  { name: "Secondary", hex: "#E4EDFF", cls: "bg-[#E4EDFF]" },
                  { name: "Foreground", hex: "#0B1F3A", cls: "bg-[#0B1F3A]" },
                  { name: "Muted fg", hex: "#5A7094", cls: "bg-[#5A7094]" },
                  { name: "Success", hex: "#10B981", cls: "bg-emerald-500" },
                  { name: "Warning", hex: "#F59E0B", cls: "bg-amber-500" },
                  { name: "Danger", hex: "#DC2626", cls: "bg-red-600" },
                ].map(({ name, hex, cls }) => (
                  <div key={hex} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${cls}`} style={{ border: hex === "#EEF3FB" || hex === "#E4EDFF" ? "1px solid rgba(255,255,255,0.15)" : "none" }} />
                    <div>
                      <p className="text-white/80 text-xs font-bold">{name}</p>
                      <p className="text-white/30 text-xs font-mono">{hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">字体规范 Typography</p>
              <p className="text-white/30 text-xs font-mono mb-4">Plus Jakarta Sans</p>
              <div className="space-y-4">
                {[
                  { size: "24 / Bold 700", sample: "页面标题", cls: "text-2xl font-bold" },
                  { size: "20 / Bold 700", sample: "卡片标题", cls: "text-xl font-bold" },
                  { size: "17 / SemiBold 600", sample: "列表项标题", cls: "text-[17px] font-semibold" },
                  { size: "15 / SemiBold 600", sample: "正文强调", cls: "text-[15px] font-semibold" },
                  { size: "14 / Regular 400", sample: "正文内容 Body copy", cls: "text-sm font-normal" },
                  { size: "12 / Medium 500", sample: "辅助信息 Caption", cls: "text-xs font-medium" },
                  { size: "10 / Bold 700", sample: "BADGE TAG", cls: "text-[10px] font-bold tracking-wide" },
                ].map(({ size, sample, cls }) => (
                  <div key={size} className="flex items-baseline justify-between gap-2">
                    <span className={`${cls} text-white leading-none`}>{sample}</span>
                    <span className="text-white/25 text-[10px] font-mono flex-shrink-0">{size}px</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing + Components */}
            <div className="rounded-2xl p-5 space-y-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">间距 Spacing (4px grid)</p>
                <div className="flex flex-wrap gap-2">
                  {["4", "8", "12", "16", "20", "24", "32", "40", "48"].map(v => (
                    <div key={v} className="flex flex-col items-center gap-1">
                      <div className="bg-[#1D4ED8]/40 rounded" style={{ width: 28, height: parseInt(v) * 0.6 }} />
                      <span className="text-white/30 text-[10px] font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">圆角 Radius</p>
                <div className="flex gap-3">
                  {[{ r: "8", label: "图标" }, { r: "12", label: "容器" }, { r: "16", label: "卡片" }, { r: "24", label: "按钮" }, { r: "999", label: "标签" }].map(({ r, label }) => (
                    <div key={r} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 bg-white/10" style={{ borderRadius: Math.min(parseInt(r), 16) }} />
                      <span className="text-white/30 text-[9px] font-mono">{r}px</span>
                      <span className="text-white/20 text-[9px]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Flutter 参数</p>
                <div className="space-y-1 font-mono text-[10px]">
                  {[
                    "primaryColor: 0xFF0F2B5B",
                    "accentColor: 0xFF1D4ED8",
                    "bgColor: 0xFFEEF3FB",
                    "cardRadius: 16.0",
                    "statusBarH: 44.0",
                    "bottomNavH: 80.0",
                  ].map(line => (
                    <p key={line} className="text-blue-300/60">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-12 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 32 }}>
          <div>
            <p className="text-white/40 text-sm font-medium">猎职 LieZhi · 招聘 App UI Design System</p>
            <p className="text-white/20 text-xs mt-1">17 frames · iPhone 14 Pro · 390×844px · 点击任意页面框架可交互预览</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-white/40 text-xs font-medium">设计稿已完成，可直接开发还原</span>
          </div>
        </div>
      </div>
    </div>
    {/* Interactive preview overlay */}
    {preview && <PhonePreviewOverlay preview={preview} onClose={() => setPreview(null)} />}
  </>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [screen, setScreen] = useState<Screen>("login");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentUser, setCurrentUser] = useState<UserBrief | null>(null);
  const [profileSubScreen, setProfileSubScreen] = useState<"resume" | "favorites" | "applications" | null>(null);

  // Auth check on mount
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setIsLoggedIn(true);
      setCurrentUser(storedUser);
      setScreen("home");
    }
    setIsLoading(false);
    const handler = () => {
      setIsLoggedIn(false);
      setScreen("login");
      setCurrentUser(null);
    };
    window.addEventListener(AUTH_LOGOUT, handler as EventListener);
    return () => window.removeEventListener(AUTH_LOGOUT, handler as EventListener);
  }, []);

  const handleLoginSuccess = (loginRes: { accessToken: string; refreshToken: string; user: UserBrief }) => {
    setTokens(loginRes.accessToken, loginRes.refreshToken);
    setUser(loginRes.user);
    setCurrentUser(loginRes.user);
    setIsLoggedIn(true);
    setScreen("home");
    setActiveTab("home");
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setProfileSubScreen(null);
    setScreen(tab === "applications" ? "applications" : (tab as Screen));
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setScreen("job-detail");
  };

  const handleProfileNavigate = (target: "resume" | "favorites" | "applications") => {
    setProfileSubScreen(target);
    setScreen(target);
  };

  const handleLogout = () => {
    clearTokens();
    clearUser();
    setIsLoggedIn(false);
    setScreen("login");
    setActiveTab("home");
    setProfileSubScreen(null);
    setSelectedJob(null);
    setCurrentUser(null);
  };

  const handleBack = () => {
    if (screen === "job-detail") {
      setScreen(activeTab === "applications" ? "home" : (activeTab as Screen));
    } else if (profileSubScreen) {
      setProfileSubScreen(null);
      setScreen("profile");
      setActiveTab("profile");
    }
  };

  const showBottomNav = isLoggedIn && profileSubScreen === null && screen !== "job-detail";

  // Loading splash
  if (isLoading) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-[#0F2B5B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">猎职 LieZhi</h1>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    if (!isLoggedIn) return <LoginScreen onLogin={handleLoginSuccess} />;

    if (screen === "job-detail" && selectedJob) {
      return (
        <JobDetailScreen
          job={selectedJob}
          onBack={handleBack}
        />
      );
    }

    if (screen === "resume" && profileSubScreen === "resume") {
      return <ResumeScreen onBack={handleBack} />;
    }

    if (screen === "favorites" && profileSubScreen === "favorites") {
      return (
        <FavoritesScreen
          onJobSelect={handleJobSelect}
          onBack={handleBack}
        />
      );
    }

    if (screen === "applications") {
      return (
        <ApplicationsScreen
          onBack={profileSubScreen === "applications" ? handleBack : undefined}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            user={currentUser}
            onJobSelect={handleJobSelect}
            onTabChange={handleTabChange}
          />
        );
      case "search":
        return (
          <SearchScreen
            onJobSelect={handleJobSelect}
          />
        );
      case "profile":
        return <ProfileScreen user={currentUser} onNavigate={handleProfileNavigate} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  // 设计稿仅通过 ?canvas=1 访问，默认直接进入 App 交互
  const showDesignCanvas =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("canvas") === "1";

  if (showDesignCanvas) {
    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: "#0a1628", minHeight: "100vh" }}>
        <DesignCanvas />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-dvh w-full overflow-hidden bg-[#EEF3FB]"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <div className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </div>
      {showBottomNav && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
