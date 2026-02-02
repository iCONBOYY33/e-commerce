// import Stripe from "stripe";

// const stripe = new Stripe(process.env.Secret_key!, {
//   apiVersion: "2024-06-20" as any,
// });

// export default stripe;

import Stripe from "stripe";
const stripe = new Stripe(process.env.Secret_key!, {
  apiVersion: "2025-10-29.clover" as any,
});

export default stripe;
