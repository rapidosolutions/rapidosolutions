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
      validation: (rule) => rule.required().max(90)
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
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
      initialValue: "Rapido Editorial"
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
      initialValue: () => new Date().toISOString()
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
          validation: (rule) => rule.max(120)
        })
      ]
    }),
    defineField({
      name: "body",
      title: "Article Body",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "content",
      title: "Plain Text Fallback",
      type: "text",
      rows: 8,
      description: "Optional. The website uses Article Body first, then this fallback."
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage"
    }
  }
});
