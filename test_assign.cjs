const { createTRPCProxyClient, httpBatchLink } = require('@trpc/client');

const client = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: 'https://shop.ets-atono.com/api/trpc',
    }),
  ],
});

async function main() {
  try {
    const res = await client.admin.assignCategoriesToProducts.mutate({
      productIds: ['test'],
      categoryId: 'test_cat'
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
