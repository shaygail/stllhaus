
export const metadata = {
  title: "Order Success - STLL HAUS",
};

import SuccessClient from "./SuccessClient";


export default function SuccessPage({ searchParams }: any) {
  const method = searchParams?.method;
  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24">
        <SuccessClient />
      </div>
    </div>
  );
}
