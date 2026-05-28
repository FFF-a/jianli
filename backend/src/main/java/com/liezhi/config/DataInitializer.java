package com.liezhi.config;

import com.liezhi.entity.*;
import com.liezhi.enums.ApplicationStatus;
import com.liezhi.enums.NotificationType;
import com.liezhi.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final FavoriteRepository favoriteRepository;
    private final NotificationRepository notificationRepository;
    private final HotSearchRepository hotSearchRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final UserJobPreferenceRepository preferenceRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ResumeRepository resumeRepository,
                           JobRepository jobRepository, ApplicationRepository applicationRepository,
                           FavoriteRepository favoriteRepository, NotificationRepository notificationRepository,
                           HotSearchRepository hotSearchRepository,
                           SearchHistoryRepository searchHistoryRepository,
                           UserJobPreferenceRepository preferenceRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.favoriteRepository = favoriteRepository;
        this.notificationRepository = notificationRepository;
        this.hotSearchRepository = hotSearchRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.preferenceRepository = preferenceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Seeding dev data ===");

        // ── Demo User ──
        User user = new User();
        user.setPhone("13800000000");
        user.setPassword(passwordEncoder.encode("abc12345"));  // phone: 13800000000, pass: abc12345
        user.setName("张伟");
        user.setAvatarColor("#1D4ED8");
        user.setGender("男");
        user.setAge(28);
        user.setTitle("高级前端工程师");
        user.setExperienceYears(5);
        user.setEducation("本科");
        user.setLocation("北京");
        user.setEmail("zhangwei@gmail.com");
        user.setIsJobSeeking(true);
        user = userRepository.save(user);

        // ── Resume ──
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setName(user.getName());
        resume.setTitle(user.getTitle());
        resume.setGender(user.getGender());
        resume.setAge(user.getAge());
        resume.setEducation(user.getEducation());
        resume.setSchool("北京大学");
        resume.setMajor("计算机科学与技术");
        resume.setSchoolPeriod("2015.09 – 2019.06");
        resume.setPhone("186****8888");
        resume.setEmail("zhangwei@gmail.com");
        resume.setLocation("北京");
        resume.setWorkMode("可出差 · 可远程");
        resume.setCompleteness(78);
        resume = resumeRepository.save(resume);

        // ── Work Experiences ──
        List<WorkExperience> weList = new ArrayList<>();
        WorkExperience we1 = new WorkExperience();
        we1.setResume(resume);
        we1.setCompany("阿里巴巴（淘宝）");
        we1.setTitle("高级前端工程师");
        we1.setPeriod("2021.07 – 至今");
        we1.setDescription("负责淘宝App核心功能的前端开发，主导性能优化专项，首屏渲染速度提升 40%；推进微前端架构落地，实现业务模块解耦。");
        we1.setSortOrder(0);
        weList.add(we1);

        WorkExperience we2 = new WorkExperience();
        we2.setResume(resume);
        we2.setCompany("滴滴出行");
        we2.setTitle("前端工程师");
        we2.setPeriod("2019.06 – 2021.06");
        we2.setDescription("独立完成拼车业务前端实现，日均服务 100万+ 用户；主导 React 技术栈迁移，构建组件库。");
        we2.setSortOrder(1);
        weList.add(we2);

        resume.getWorkExperiences().addAll(weList);
        resumeRepository.save(resume);

        // ── Education ──
        Education edu = new Education();
        edu.setResume(resume);
        edu.setSchool("北京大学");
        edu.setDegree("本科");
        edu.setMajor("计算机科学与技术");
        edu.setPeriod("2015.09 – 2019.06");
        edu.setSortOrder(0);
        resume.getEducations().add(edu);

        // ── Skills ──
        String[] skills = {"React", "TypeScript", "Vue.js", "Node.js", "Webpack", "性能优化", "微前端", "CSS3", "Git"};
        for (int i = 0; i < skills.length; i++) {
            ResumeSkill skill = new ResumeSkill(skills[i], i);
            skill.setResume(resume);
            resume.getSkills().add(skill);
        }
        resumeRepository.save(resume);

        // ── Job Preference ──
        UserJobPreference pref = new UserJobPreference();
        pref.setUser(user);
        pref.setExpectedPosition("前端工程师");
        pref.setExpectedCity("北京");
        pref.setExpectedSalary("20-40K");
        preferenceRepository.save(pref);

        // ── Jobs (matching frontend mock data) ──
        List<Job> jobs = new ArrayList<>();

        jobs.add(createJob(
            "高级前端工程师", "字节跳动", "字", "#1A1A2E",
            "北京·海淀", 25, 45, 15, "3–5年", "本科", 3,
            "10000人以上", "上市公司", "已上市", "互联网",
            List.of("React", "TypeScript", "远程可"),
            true, true,
            "负责抖音、TikTok等核心产品的前端架构设计与开发，与设计师、产品经理深度协作，推动大规模前端工程体系建设，打造极致的用户体验。",
            List.of("3年以上前端开发经验，精通 HTML/CSS/JavaScript", "深入理解 React 框架，熟悉 Vue 等主流框架",
                    "有大型复杂前端项目架构设计经验", "了解前端性能优化方案，有实战经验优先", "良好的团队协作和沟通能力"),
            List.of("年终奖", "弹性工作", "五险一金", "带薪年假15天", "免费三餐", "健身补贴", "股票期权"),
            -2, "北京"
        ));

        jobs.add(createJob(
            "高级产品经理", "腾讯", "腾", "#0052D9",
            "上海·浦东", 30, 50, 16, "5年以上", "本科", 2,
            "10000人以上", "上市公司", "已上市", "互联网",
            List.of("C端产品", "数据驱动", "0→1"),
            false, true,
            "负责微信生态内容产品的战略规划与迭代，深入洞察用户需求，推动产品从0到1落地，并持续优化用户体验和商业转化。",
            List.of("5年以上互联网产品经验，有C端大产品落地案例", "出色的逻辑思维和数据分析能力", "强烈的用户同理心和产品直觉"),
            List.of("股票期权", "年终奖", "弹性工作", "免费三餐", "五险一金"),
            -24, "上海"
        ));

        jobs.add(createJob(
            "UI/UX 设计师", "小红书", "红", "#FF2741",
            "上海·静安", 20, 35, 14, "2–4年", "本科", 1,
            "5000–10000人", "独角兽", "D轮", "互联网",
            List.of("Figma", "用户研究", "品牌设计"),
            true, false,
            "参与小红书App核心功能的视觉与交互设计，从用户体验出发，深度参与从概念到落地的全流程设计工作。",
            List.of("2年以上UI/UX设计工作经验", "精通Figma/Sketch/Adobe系列工具", "有完整的C端产品设计作品集"),
            List.of("弹性工作", "五险一金", "免费零食", "设计软件订阅", "团建活动"),
            -3, "上海"
        ));

        jobs.add(createJob(
            "Java 后端工程师", "美团", "美", "#FFB800",
            "北京·朝阳", 22, 40, 15, "3–5年", "本科", 5,
            "10000人以上", "上市公司", "已上市", "互联网",
            List.of("Spring Boot", "微服务", "高并发"),
            false, false,
            "负责美团外卖核心业务系统开发，在高并发、大数据量场景下解决技术挑战，持续优化系统稳定性和性能。",
            List.of("3年以上Java开发经验", "熟悉Spring Cloud微服务架构", "有分布式系统设计经验"),
            List.of("年终奖", "弹性工作", "五险一金", "员工餐补"),
            -48, "北京"
        ));

        jobs.add(createJob(
            "算法工程师（NLP方向）", "百度", "百", "#2932E1",
            "北京·海淀", 35, 65, 16, "3年以上", "硕士", 2,
            "10000人以上", "上市公司", "已上市", "互联网",
            List.of("深度学习", "大模型", "NLP"),
            true, true,
            "参与文心大模型的算法研究与工程落地，在NLP、多模态等方向进行前沿探索，推动AI技术在产品中的规模化应用。",
            List.of("硕士及以上学历，计算机/数学/统计等相关专业", "深度学习框架（PyTorch/TensorFlow）实战经验", "有大模型训练或微调经验优先"),
            List.of("股票期权", "年终奖", "科研经费支持", "学术交流", "弹性工作"),
            -5, "北京"
        ));

        jobs.add(createJob(
            "数据分析师", "京东", "京", "#CC0000",
            "北京·亦庄", 18, 30, 13, "1–3年", "本科", 4,
            "10000人以上", "上市公司", "已上市", "互联网",
            List.of("SQL", "Python", "数据可视化"),
            false, false,
            "负责电商业务核心指标监控和分析，搭建数据看板，为业务决策和增长策略提供数据支持。",
            List.of("熟练掌握SQL，能独立完成复杂查询", "熟悉Python数据处理（Pandas/NumPy）", "能独立撰写高质量分析报告"),
            List.of("年终奖", "五险一金", "员工购物折扣", "节日福利"),
            -72, "北京"
        ));

        jobs = jobRepository.saveAll(jobs);

        // ── Applications ──
        applicationRepository.save(createApp(user, jobs.get(0), ApplicationStatus.INTERVIEW, -10, "2024-01-20 14:00"));
        applicationRepository.save(createApp(user, jobs.get(1), ApplicationStatus.VIEWED, -13, null));
        applicationRepository.save(createApp(user, jobs.get(2), ApplicationStatus.PENDING, -15, null));
        applicationRepository.save(createApp(user, jobs.get(3), ApplicationStatus.REJECTED, -20, null));
        applicationRepository.save(createApp(user, jobs.get(4), ApplicationStatus.OFFER, -28, null));

        // ── Favorites ──
        Favorite fav1 = new Favorite(user, jobs.get(0));
        Favorite fav2 = new Favorite(user, jobs.get(2));
        favoriteRepository.save(fav1);
        favoriteRepository.save(fav2);

        // ── Notifications ──
        Notification n1 = new Notification();
        n1.setUser(user);
        n1.setTitle("面试邀请");
        n1.setMessage("字节跳动「高级前端工程师」邀请您2024-01-20 14:00参加技术面试");
        n1.setType(NotificationType.INTERVIEW_INVITE);
        n1.setReferenceId(1L);
        notificationRepository.save(n1);

        Notification n2 = new Notification();
        n2.setUser(user);
        n2.setTitle("Offer通知");
        n2.setMessage("百度「算法工程师（NLP方向）」已向您发出Offer邀请");
        n2.setType(NotificationType.OFFER);
        n2.setReferenceId(5L);
        notificationRepository.save(n2);

        Notification n3 = new Notification();
        n3.setUser(user);
        n3.setTitle("投递确认");
        n3.setMessage("您已成功投递「高级前端工程师」- 字节跳动");
        n3.setType(NotificationType.APPLICATION_UPDATE);
        n3.setReferenceId(1L);
        notificationRepository.save(n3);

        // ── Hot Searches ──
        String[] hotKeywords = {
            "前端工程师", "产品经理", "算法工程师", "UI设计师",
            "数据分析", "Java后端", "Python"
        };
        for (int i = 0; i < hotKeywords.length; i++) {
            HotSearch hs = new HotSearch();
            hs.setKeyword(hotKeywords[i]);
            hs.setSearchCount(100 - i * 10);
            hs.setPriority(0);
            hotSearchRepository.save(hs);
        }

        // ── Recent Searches ──
        String[] recentSearches = {"React 高级工程师", "上海 产品经理", "字节跳动"};
        for (String q : recentSearches) {
            SearchHistory sh = new SearchHistory();
            sh.setUser(user);
            sh.setQuery(q);
            searchHistoryRepository.save(sh);
        }

        log.info("=== Dev data seeded successfully ===");
        log.info("Demo account: phone=13800000000, password=abc12345");
    }

    private Job createJob(String title, String company, String initials, String logoColor,
                          String location, int salaryMin, int salaryMax, int salaryMonths,
                          String experience, String education, int headcount,
                          String companySize, String companyType, String companyStage, String industry,
                          List<String> tags, boolean isNew, boolean isHot,
                          String desc, List<String> requirements, List<String> welfares,
                          long postedHoursAgo, String city) {
        Job job = new Job();
        job.setTitle(title);
        job.setCompany(company);
        job.setInitials(initials);
        job.setLogoColor(logoColor);
        job.setLocation(location);
        job.setSalaryMin(salaryMin * 1000);
        job.setSalaryMax(salaryMax * 1000);
        job.setSalaryMonths(salaryMonths);
        job.setExperience(experience);
        job.setEducation(education);
        job.setHeadcount(headcount);
        job.setCompanySize(companySize);
        job.setCompanyType(companyType);
        job.setCompanyStage(companyStage);
        job.setIndustry(industry);
        job.setJobType("全职");
        job.setIsNew(isNew);
        job.setIsHot(isHot);
        job.setIsActive(true);
        job.setPostedAt(LocalDateTime.now().plusHours(postedHoursAgo));
        job.setDescription(desc);
        job.setCity(city);

        for (int i = 0; i < tags.size(); i++) {
            job.getTags().add(new JobTag(job, tags.get(i), i));
        }
        for (int i = 0; i < requirements.size(); i++) {
            job.getRequirements().add(new JobRequirement(job, requirements.get(i), i));
        }
        for (int i = 0; i < welfares.size(); i++) {
            job.getWelfares().add(new JobWelfare(job, welfares.get(i), i));
        }

        return job;
    }

    private Application createApp(User user, Job job, ApplicationStatus status,
                                   long postedHoursAgo, String interviewAt) {
        Application app = new Application();
        app.setUser(user);
        app.setJob(job);
        app.setStatus(status);
        app.setAppliedAt(LocalDateTime.now().plusHours(postedHoursAgo));
        if (interviewAt != null) {
            app.setInterviewAt(LocalDateTime.parse((interviewAt + ":00").replace(" ", "T")));
        }
        return app;
    }
}
