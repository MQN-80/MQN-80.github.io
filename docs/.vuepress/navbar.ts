import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "归档",
    icon: "edit",
    prefix: "/posts/",
    children: [
      {
        text: "network",
        prefix: "network/",
        children: ["tcp-impl","talk","protobuf"],
      },
      {
        text: "database",
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
        prefix: "ai/",
        children: ["lsm-tree","neural","gmm"],
      },
    ],
  },
]);
