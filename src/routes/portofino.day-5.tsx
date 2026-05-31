import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "@/components/PortofinoDayPage";

export const Route = createFileRoute("/portofino/day-5")({
  head: () => getPortofinoDayHead("day-5"),
  component: () => <PortofinoDayTemplate slug="day-5" />,
});
