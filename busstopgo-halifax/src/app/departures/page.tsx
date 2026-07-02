import DeparturesClient from "@/components/DeparturesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departures | BusStopGo Halifax",
  description:
    "Search by stop number to see upcoming Halifax Transit bus departures.",
};

export default function DeparturesPage() {
  return <DeparturesClient />;
}