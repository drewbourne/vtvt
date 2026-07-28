export const dynamic = "force-dynamic";

export const GET = withNextContext(() => async (request: Request) => {
  return Response.json({});
});
