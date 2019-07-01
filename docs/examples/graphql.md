Protect your graphql resolvers by adding authentication and authorization


```js
const authentication = Intermediary.createMiddleware((ctx, next, parent, queryArgs, gqlContext) => {
    if(!gqlContext.user) {
        throw new Error('NOT_ALLOWED')
    }
    return next(parent, queryArgs, gqlContext);
})

const authorization = Intermediary.createMiddleware(async (ctx, next, parent, queryArgs, gqlContext) => {
    let isAdmin = await gqlContext.user.isAdmin();
    if(!isAdmin) {
        throw new Error('NOT_ALLOWED')
    }
    return next(parent, queryArgs, gqlContext);
})
const authenticator = new Intermediary([authentication]);
const authorizer = new Intermediary([authorization]);
export const resolvers = {
    mutation: {
        createProduct: Intermediary.series([authenticator, authorizer]).involve(async (parent, queryArgs, gqlContext) => {
            // Create a product
            // Only admin user can create a product now.
        }),
        editProduct: authenticator.involve(async (parent, queryArgs, gqlContext)=>{
            // Edit the product
            // Any logged in user can edit the product.
        }),
    }
}
```