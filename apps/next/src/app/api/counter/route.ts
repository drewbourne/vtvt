import { createSSEHandler } from "use-next-sse";

export const dynamic = "force-dynamic";

export const GET = createSSEHandler((send, close) => {
  let count = 0;

  const interval = setInterval(() => {
    send({ count: count++ }, "counter");
    if (count > 10) {
      clearInterval(interval);
      close();
    }
  }, 1000);
});
