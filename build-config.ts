import type { ReactComponentBuildConfig, WebComponentBuildConfig } from "../../tasks/build/builder/src/types.ts";

export const webComponentList: WebComponentBuildConfig[] = [
  {
    name: "jb-form",
    path: "./lib/jb-form.ts",
    outputPath: "./dist/jb-form.js",
    umdName: "JBForm",
    external: ["jb-validation", "jb-core"],
    globals: {
      'jb-validation': "JBValidation",
    },
  }
];
export const reactComponentList: ReactComponentBuildConfig[] = [
  {
    name: "jb-form-react",
    path: "./react/lib/JBForm.tsx",
    outputPath: "./react/dist/JBForm.js",
    external: ["jb-form", "react", "jb-core"],
    globals: {
      'react': "React",
      "jb-core/react":"JBCoreReact",
      'jb-form': "JBForm",
    },
    umdName:"JBFormReact",
    dir:"./react"
  },
];