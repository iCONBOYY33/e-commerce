"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";

const Unauthorized = () => {
  const { signOut } = useAuth();
  return (
    <div>
      <h1>Unauthorized</h1>

      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
};

export default Unauthorized;
