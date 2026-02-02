import Link from "next/link";
import React from "react";

const returnPage = async ({
  searchParams,
}: {
  searchParams: { session_id: string };
}) => {
  const session_id = (await searchParams)?.session_id;
  if (!session_id) {
    return <div>Session ID not found</div>;
  }
  const products = await fetch(
    `${process.env.SERVER_PAYMENT_SERVICE_URL}/session/${session_id}`,
  );
  const data = await products.json();

  return (
    <div className="flex flex-col gap-6 items-center mt-10 mb-10">
      <h1 className="text-2xl font-bold">
        Payment Status: {data.paymentStatus}
      </h1>
      <h1 className="text-2xl font-bold">Status: {data.status}</h1>

      <Link className="text-blue-500" href="/orders">
        See your Orders
      </Link>
    </div>
  );
};

export default returnPage;
