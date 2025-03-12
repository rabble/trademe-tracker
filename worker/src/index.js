export default {
  async fetch(request, env, ctx) {
    return new Response("TradeMe Tracker API is running", {
      headers: { "content-type": "text/plain" },
    });
  },
};
