REVOKE ALL ON TABLE public.outbound_click_daily FROM PUBLIC;
REVOKE ALL ON TABLE public.outbound_click_daily FROM anon;
REVOKE ALL ON TABLE public.outbound_click_daily FROM authenticated;
GRANT ALL ON TABLE public.outbound_click_daily TO service_role;

REVOKE ALL ON FUNCTION public.record_outbound_click(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_outbound_click(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.record_outbound_click(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_outbound_click(text, text) TO service_role;