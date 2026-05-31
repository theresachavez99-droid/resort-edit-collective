import { createFileRoute } from "@tanstack/react-router";
import { getPortofinoDayHead, PortofinoDayTemplate } from "@/components/PortofinoDayPage";

export const Route = createFileRoute("/portofino/day-3")({
  head: () => getPortofinoDayHead("day-3"),
  component: () => <PortofinoDayTemplate slug="day-3" />,
});
