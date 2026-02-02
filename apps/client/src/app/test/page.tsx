import { auth } from "@clerk/nextjs/server";
import React from "react";

async function page() {
  const { getToken } = await auth();
  const token = await getToken();
  console.log("token", token);
  return <div>test</div>;
}

export default page;
