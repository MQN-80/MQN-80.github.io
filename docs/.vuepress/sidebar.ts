import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  "/",
  {
    text: "文章",
    icon: "note",
    prefix: "/posts/",
    children: [
      {
        text: "cpp",
        icon: "note",
        collapsible: true,
        prefix: "cpp/",
        children: ["variant_mem"],

      },
      {
        text: "network",
        icon: "note",
        collapsible: true,
        prefix: "network/",
        children: ["tcp-impl","protobuf"],
      },
      {
        text: "database",
        icon: "note",
        collapsible: true,
        prefix: "database/",
        children: [
          "cmu15445-1",
          "cmu15445-2",
          "cmu15445-3",
          "cmu15445-4",
          "cmu15445-5",
          "cmu15445-6",
        ],
      },
      {
        text: "ai",
        icon: "note",
        collapsible: true,
        prefix: "ai/",
        children: ["neural","gmm"],
      },
      {
        text: "optimization",
        icon: "note",
        collapsible: true,
        prefix: "optimization/",
        children: ["buffer","outpoint"],
      }
    ],
  },
]);
