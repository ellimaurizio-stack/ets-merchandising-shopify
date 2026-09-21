async function main() {
  const res = await fetch('https://shop.ets-atono.com/api/trpc/admin.assignCategoriesToProducts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productIds: ['test'],
      categoryId: 'test_cat'
    })
  });
  console.log(await res.text());
}
main();
