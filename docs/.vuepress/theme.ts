import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar";
import sidebar from "./sidebar";

export default hopeTheme({
  hostname: "https://mqn-80.github.io/",

  author: {
    name: "MQN-80",
    url: "https://github.com/MQN-80",
  },

  iconAssets: "//at.alicdn.com/t/font_2410206_a0xb9hku9iu.css",

  logo: "/photo.jpg",

  repo: "https://github.com/MQN-80/MQN-80.github.io",

  // docsDir: "demo/src",

  // navbar
  navbar: navbar,

  // sidebar
  sidebar: sidebar,

  footer: "keep running",

  displayFooter: true,

  pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],

  blog: {
    description: "普普通通打工人，平平凡凡小码农",
    // intro: "/intro.html",
    medias: {
      GitHub: "https://github.com/MQN-80",
    },
  },

  encrypt: {
    config: {
      // "/guide/encrypt.html": ["1234"],
    },
  },

  plugins: {
    blog: true,
    mdEnhance: {
      presentation: ["highlight", "math", "search", "notes", "zoom"],
      katex: true,
      mermaid: true,
    },
    components: {
      components: ["PDF"],
    },
    comment: {
      provider: "Giscus",
      repo: "pedrogao/pedrogao.github.io",
      repoId: "R_kgDOG68Q-A",
      category: "Q&A",
      categoryId: "DIC_kwDOG68Q-M4CZ5GN",
      mapping: "pathname",
      strict: false,
      lazyLoading: true,
      reactionsEnabled: true,
      inputPosition: "bottom",
      lightTheme: "light",
    },
  },
});
