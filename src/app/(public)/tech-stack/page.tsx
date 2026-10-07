import React from "react";
import { getCachedTechStack } from "@/lib/publicData";
import TechStackClientView from "@/components/stack/TechStackClientView";

export const revalidate = 60; // 0ms instantaneous visitor load with background revalidation

export const metadata = {
  title: "Tech Stack & Toolchain | MD Rohan Mia",
  description:
    "The tools, engines & architectural systems powering high-concurrency systems, verified platforms, and responsive interfaces.",
};

export default async function TechStackPage() {
  const categories = await getCachedTechStack();

  return <TechStackClientView categories={categories} />;
}
