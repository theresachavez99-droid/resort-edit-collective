
REVOKE EXECUTE ON FUNCTION public.record_editorial_memory_usage(text, text, text, text, text, text, text, text, text, text[], text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_editorial_memory_usage(text, text, text, text, text, text, text, text, text, text[], text, text, text, text, uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.publish_founder_look(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_founder_look(uuid) TO service_role;
