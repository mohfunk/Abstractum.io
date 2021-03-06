const path = require("path")

const {
    createFilePath
} = require("gatsby-source-filesystem")

exports.onCreateNode = ({
    node,
    actions,
    getNode
}) => {
    const {
        createNodeField
    } = actions

    // We only want to operate on `Mdx` nodes. If we had content from a
    // remote CMS we could also check to see if the parent node was a
    // `File` node here
    if (node.internal.type === "Mdx") {
        const value = createFilePath({
            node,
            getNode
        })

        createNodeField({
            // Name of the field you are adding
            name: "slug",
            // Individual MDX node
            node,
            // Generated value based on filepath with "blog" prefix. We
            // don't need a separating "/" before the value because
            // createFilePath returns a path with the leading "/".
            value: `${
                node.frontmatter.group != 'none'
                ? '/'
                : '' }${
                node.frontmatter.group != 'none'
                    ? node.frontmatter.group + '/'
                    : ''
                }${
                value.split('.').length > 1
                ? value.split('.')[1]
                : value
                }`,
        })
        createNodeField({
            // Name of the field you are adding
            name: "ord",
            // Individual MDX node
            node,
            // Generated value based on filepath with "blog" prefix. We
            // don't need a separating "/" before the value because
            // createFilePath returns a path with the leading "/".
            value: `${value.split('.')[0]}`,
        })
    }
}
exports.createPages = async ({
    graphql,
    actions,
    reporter
}) => {
    // Destructure the createPage function from the actions object
    const {
        createPage
    } = actions

    const result = await graphql(`
    query {
      allMdx {
        edges {
          node {
            id
             frontmatter {
                 title
                 group
             }
            fields {
              slug
            }
          }
        }
      }
    }
  `)

    if (result.errors) {
        reporter.panic('🚨  ERROR: Loading "createPages" query', result.errors)
    }

    // Create blog post pages.
    const posts = result.data.allMdx.edges

    // We'll call `createPage` for each result
    posts.forEach(({
        node
    }, index) => {
        createPage({
            // This is the slug we created before
            // (or `node.frontmatter.slug`)
            path: node.fields.slug,
            // This component will wrap our MDX content
            component: path.resolve(`./src/components/page.tsx`),
            // We can use the values in this context in
            // our page layout component
            context: {
                id: node.id
            },
        })
    })
}