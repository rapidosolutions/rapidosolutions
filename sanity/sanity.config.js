import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes/index.js";

export default defineConfig({
  name: "rapidoBlogs",
  title: "Rapido Blogs",
  projectId: "7vlwxcu7",
  dataset: "production",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes
  }
});
