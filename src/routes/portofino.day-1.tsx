import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "@/components/PortofinoDayPage";

export const Route = createFileRoute("/portofino/day-1")({
  head: () => getPortofinoDayHead("day-1"),
  component: () => <PortofinoDayTemplate slug="day-1" />,
});
