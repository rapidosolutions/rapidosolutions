import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "SEO-friendly blog title shown on the public website.",
      validation: (rule) => rule.required().max(90)
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used for the public blog URL. Generate from the title or edit carefully.",
      options: {
        source: "title",
        maxLength: 96
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Short intro used on blog cards and meta descriptions.",
      validation: (rule) => rule.required().max(180)
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Web Strategy", value: "Web Strategy" },
          { title: "SEO", value: "SEO" },
          { title: "eCommerce", value: "eCommerce" },
          { title: "Finance", value: "Finance" },
          { title: "Human Resources", value: "Human Resources" },
          { title: "Operations", value: "Operations" }
        ]
      },
      initialValue: "Web Strategy",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      initialValue: "Rapido Editorial",
      validation: (rule) => rule.required().max(80)
    }),
    defineField({
      name: "readTime",
      title: "Read Time",
      type: "string",
      description: "Example: 5 min read. Leave blank and the website will estimate it.",
      validation: (rule) => rule.max(24)
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description: "Future dates keep posts hidden until that date.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for accessibility and SEO.",
          validation: (rule) => rule.required().max(120)
        })
      ],
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "body",
      title: "Article Body",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required().min(1)
    }),
    defineField({
      name: "content",
      title: "Plain Text Fallback",
      type: "text",
      rows: 8,
      description: "Optional. The website uses Article Body first, then this fallback.",
      validation: (rule) => rule.max(12000)
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage"
    },
    prepare(selection) {
      return {
        title: selection.title || "Untitled Rapido blog post",
        subtitle: selection.subtitle ? `Rapido Insights / ${selection.subtitle}` : "Rapido Insights",
        media: selection.media
      };
    }
  }
});
