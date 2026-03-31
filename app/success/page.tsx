import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const metadata = {
  title: "Order Success - STLL HAUS",
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24 px-6 sm:px-12 lg:px-20" />}>
      <SuccessClient />
    </Suspense>
  );
}
