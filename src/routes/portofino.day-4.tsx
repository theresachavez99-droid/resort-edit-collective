import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "@/components/PortofinoDayPage";

export const Route = createFileRoute("/portofino/day-4")({
  head: () => getPortofinoDayHead("day-4"),
  component: () => <PortofinoDayTemplate slug="day-4" />,
});
