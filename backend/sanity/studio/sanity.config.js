import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes/index.js";
import { rapidoStructure } from "./structure/rapidoStructure.js";
import { rapidoTheme } from "./theme/rapidoTheme.js";
import "./styles/rapidoStudio.css";

export default defineConfig({
  name: "rapidoBrandedBlogs",
  title: "Rapido Blog Studio",
  projectId: "7vlwxcu7",
  dataset: "production",
  basePath: "/",
  plugins: [
    structureTool({
      structure: rapidoStructure
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  },
  theme: rapidoTheme,
  document: {
    productionUrl: async (prev, context) => {
      const { document } = context;
      if (document._type === "post" && document.slug?.current) {
        return `https://rapidosolutions.vercel.app/blogs/${document.slug.current}`;
      }
      return prev;
    }
  }
});
