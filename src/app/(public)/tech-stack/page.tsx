import React from "react";
import { getCachedTechStack } from "@/lib/publicData";
import TechStackClientView from "@/components/stack/TechStackClientView";

import { buildDynamicMetadata } from "@/lib/seo/metadata";

export const revalidate = 60; // 0ms instantaneous visitor load with background revalidation

export async function generateMetadata() {
  return await buildDynamicMetadata({ path: "/tech-stack" });
}

export default async function TechStackPage() {
  const categories = await getCachedTechStack();

  return <TechStackClientView categories={categories} />;
}
