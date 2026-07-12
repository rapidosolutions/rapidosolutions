export const rapidoStructure = (S) =>
  S.list()
    .title("Rapido Content")
    .items([
      S.documentTypeListItem("post").title("All Blog Posts"),
      S.divider(),
      S.listItem()
        .title("Draft Blog Posts")
        .child(
          S.documentList()
            .title("Draft Blog Posts")
            .filter('_type == "post" && _id in path("drafts.**")')
            .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
        ),
      S.listItem()
        .title("Published Blog Posts")
        .child(
          S.documentList()
            .title("Published Blog Posts")
            .filter('_type == "post" && !(_id in path("drafts.**"))')
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        ),
      S.listItem()
        .title("Posts by Category")
        .child(
          S.list()
            .title("Posts by Category")
            .items([
              "Web Strategy",
              "SEO",
              "eCommerce",
              "Finance",
              "Human Resources",
              "Operations"
            ].map((category) =>
              S.listItem()
                .title(category)
                .child(
                  S.documentList()
                    .title(category)
                    .filter('_type == "post" && category == $category')
                    .params({ category })
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                )
            ))
        )
    ]);
