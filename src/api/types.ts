// ── API Response Wrapper ──
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ── Auth ──
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  smsCode: string;
  password: string;
  confirmPassword: string;
  expectedPosition?: string;
  expectedCity?: string;
  expectedSalary?: string;
}

export interface SendSmsRequest {
  phone: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserBrief {
  id: number;
  name: string;
  avatarColor: string;
  phone: string;
  title: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserBrief;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ── Jobs ──
export interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
}

export interface JobBrief {
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
}

export interface JobDetail extends JobBrief {
  isApplied: boolean;
  desc: string;
  requirements: string[];
  welfare: string[];
  companySize: string;
  companyType: string;
  companyStage: string;
  industry: string;
}

export interface JobListResponse {
  total: number;
  page: number;
  size: number;
  banners: BannerItem[] | null;
  list: JobBrief[];
}

export interface SearchParams {
  keyword?: string;
  city?: string;
  type?: string;
  edu?: string;
  exp?: string;
  page?: number;
  size?: number;
}

export interface FilterOptionsResponse {
  cities: string[];
  salaries: string[];
  experiences: string[];
  educations: string[];
  types: string[];
}

export interface FavoriteStatusResponse {
  isFavorited: boolean;
}

// ── User ──
export interface UserProfileResponse {
  id: number;
  name: string;
  avatarColor: string;
  phone: string;
  email: string | null;
  gender: string | null;
  age: number | null;
  title: string | null;
  experience: string | null;
  education: string | null;
  location: string | null;
  status: string;
  resumeCompletion: number;
  desiredPosition: string | null;
  desiredCity: string | null;
  desiredSalary: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  title?: string;
  location?: string;
  email?: string;
  gender?: string;
  age?: number;
  education?: string;
  status?: string;
  desiredPosition?: string;
  desiredCity?: string;
  desiredSalary?: string;
}

export interface UserStatsResponse {
  appliedCount: number;
  pendingReplyCount: number;
  favoriteCount: number;
  interviewCount: number;
  offerCount: number;
}

export interface WorkExp {
  id?: number;
  company: string;
  title: string;
  period: string;
  description: string;
}

export interface EducationItem {
  id?: number;
  school: string;
  degree: string;
  major: string;
  period: string;
}

export interface ResumeResponse {
  name: string;
  title: string | null;
  gender: string | null;
  age: number | null;
  experience: string | null;
  education: string | null;
  school: string | null;
  major: string | null;
  schoolPeriod: string | null;
  phone: string;
  email: string | null;
  location: string | null;
  workMode: string | null;
  completeness: number;
  workExperiences: WorkExp[];
  educations: EducationItem[];
  skills: string[];
}

export interface UpdateResumeRequest {
  title?: string;
  school?: string;
  major?: string;
  schoolPeriod?: string;
  phone?: string;
  email?: string;
  location?: string;
  workMode?: string;
  workExperiences?: WorkExp[];
  educations?: EducationItem[];
  skills?: string[];
}

// ── Applications ──
export interface ApplicationResponse {
  id: number;
  jobId: number;
  title: string;
  company: string;
  initials: string;
  logoColor: string;
  salary: string;
  status: string; // "PENDING" | "VIEWED" | "INTERVIEW" | "OFFER" | "REJECTED"
  statusText: string;
  appliedAt: string;
  interviewAt: string | null;
}

// ── Notifications ──
export interface UnreadCountResponse {
  unreadCount: number;
}
