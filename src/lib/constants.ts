import { Activity, Brain, Github, type LucideProps, RefreshCw, Settings, Sparkles } from "lucide-react";
import { type ForwardRefExoticComponent, type RefAttributes } from "react";

export const SAMPLE_TWO = `# 👋 Hey, I'm Mushood Hanif!

<div align="center">
  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mushood-hanif/)
[![Email](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:supame123@gmail.com)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/mushood_7/)
[![Stack Overflow](https://img.shields.io/badge/Stack_Overflow-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white)](https://stackoverflow.com/users/9131774/mushood-hanif)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/923268860405)

</div>

---

## 🚀 About Me

I'm a **Full-Stack Developer** with **3+ years of experience** specializing in designing and building dynamic, responsive, and scalable web applications. I'm passionate about creating user-friendly, efficient, and high-performance solutions that drive business value.

---

## 💻 Tech Stack

### Frontend Development
\`\`\`typescript
const frontend = {
  frameworks: ['React', 'Next.js'],
  languages: ['TypeScript', 'JavaScript'],
  styling: ['Tailwind CSS', 'CSS3'],
  stateManagement: ['Redux', 'Context API'],
  focus: ['Responsive Design', 'SEO Optimization', 'Server-Side Rendering']
};
\`\`\`

### Backend Development
\`\`\`javascript
const backend = {
  runtime: 'Node.js',
  frameworks: ['Express.js', 'Hono.js', 'FastAPI'],
  databases: ['PostgreSQL', 'MySQL', 'MongoDB'],
  languages: ['TypeScript', 'Python'],
  focus: ['RESTful APIs', 'Data Modeling', 'Query Optimization', 'Security']
};
\`\`\`

### Tools & Technologies

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux"/>
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git"/>
  <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white" alt="Figma"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
</p>

---

## 🎯 What I Do

- ✨ Build modern, responsive web applications with **React** and **Next.js**
- 🔧 Design and develop scalable **RESTful APIs** with **Node.js** and **Python**
- 🗄️ Architect efficient database solutions with **PostgreSQL**, **MySQL**, and **MongoDB**
- 🚀 Optimize application performance and implement **SEO** best practices
- 🔐 Ensure security and data integrity across full-stack applications
- 📱 Create seamless user experiences with clean, maintainable code

---

## 📊 GitHub Stats

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=DivineDemon&layout=compact&theme=tokyonight&hide_border=true" alt="Most Used Languages" height="200"/>
</div>

<div align="center">
  <img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=DivineDemon&theme=tokyonight" alt="GitHub Profile Summary"/>
</div>

<div align="center">
  <img src="https://github-profile-summary-cards.vercel.app/api/cards/stats?username=DivineDemon&theme=tokyonight" alt="GitHub Stats" height="200"/>
</div>

---

## 🎧 Currently Listening To

<div align="center">
  <a href="https://open.spotify.com/user/21tq5zpr5khlipzoegk34eb3a">
    <img src="https://spotify-recently-played-readme.vercel.app/api?user=21tq5zpr5khlipzoegk34eb3a&count=5&unique=true" alt="Spotify Recently Played"/>
  </a>
</div>

---

## 📈 Contribution Activity

<div align="center">
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=DivineDemon&theme=tokyo-night&hide_border=true&area=true" alt="Contribution Graph"/>
</div>

---

<div align="center">
  
### 💬 Let's Connect and Build Something Amazing!

![Profile Views](https://komarev.com/ghpvc/?username=DivineDemon&color=blueviolet&style=for-the-badge)

</div>`;

export interface Testimonial {
  id: number;
  name: string;
  username: string;
  avatar: string;
  content: string;
}

export interface Feature {
  id: number;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    id: 1,
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Intelligent code analysis that understands your project structure, dependencies, and key features to generate comprehensive documentation.",
  },
  {
    id: 2,
    icon: Github,
    title: "Seamless GitHub Integration",
    description:
      "Connect directly with your GitHub repositories. Clio automatically syncs your projects and commits READMEs with proper version control.",
  },
  {
    id: 3,
    icon: Activity,
    title: "Real-time Job Tracking",
    description:
      "Monitor your README generation progress in real-time. Track status, view outputs, and manage all your documentation jobs from one dashboard.",
  },
  {
    id: 4,
    icon: Settings,
    title: "Customizable Output",
    description:
      "Fine-tune generated READMEs to match your project's style. Edit sections, add custom content, and personalize before publishing.",
  },
  {
    id: 5,
    icon: RefreshCw,
    title: "Automatic Updates",
    description:
      "Keep your documentation up-to-date automatically. Clio can regenerate READMEs when your codebase changes, ensuring docs never go stale.",
  },
  {
    id: 6,
    icon: Sparkles,
    title: "Professional Quality",
    description:
      "Generate publication-ready READMEs with proper formatting, badges, code examples, and best practices that impress developers and users.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    username: "@sarahcodes",
    avatar: "https://i.pravatar.cc/150?img=5",
    content:
      "Clio saved me hours on documentation! The AI perfectly captured my project's essence and generated a README that actually makes sense. Worth every penny of that $5.",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    username: "@marcusdev",
    avatar: "https://i.pravatar.cc/150?img=12",
    content:
      "I was skeptical at first, but Clio blew me away. It analyzed my codebase and created a professional README with installation steps, usage examples, and even a roadmap. Game changer!",
  },
  {
    id: 3,
    name: "Priya Sharma",
    username: "@priyabuilds",
    avatar: "https://i.pravatar.cc/150?img=9",
    content:
      "As someone who hates writing docs, Clio is a lifesaver. The generated README was so good, I barely had to edit it. My GitHub stars doubled after updating my docs!",
  },
  {
    id: 4,
    name: "Alex Rivera",
    username: "@alexcodes",
    avatar: "https://i.pravatar.cc/150?img=33",
    content:
      "Best $5 I've spent on dev tools. Clio understood my Python project structure and created comprehensive documentation including API references. Highly recommend!",
  },
  {
    id: 5,
    name: "Emma Watson",
    username: "@emmaweb",
    avatar: "https://i.pravatar.cc/150?img=45",
    content:
      "Clio's AI is incredibly smart. It picked up on my project's unique features and highlighted them beautifully in the README. My team is now using it for all our repos.",
  },
  {
    id: 6,
    name: "David Kim",
    username: "@davebuilds",
    avatar: "https://i.pravatar.cc/150?img=14",
    content:
      "I've tried other README generators, but Clio is in a league of its own. The quality is outstanding, and the pay-per-use model is perfect for freelancers like me.",
  },
];
