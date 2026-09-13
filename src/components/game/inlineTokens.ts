/**
 * Tiny inline script for the document head: it restores the saved theme,
 * accent, typography, and sizing before first paint so there is no flash of
 * unstyled tokens. Mirrors applySettingsToDocument; keep in sync.
 */

export const inlineTokenScript = `(function(){try{var raw=localStorage.getItem("swm.settings.v1");if(!raw)return;var s=JSON.parse(raw);var st=s.state||s||{};var dark=matchMedia("(prefers-color-scheme: dark)").matches;var t=st.theme==="system"?(dark?"slate":"paper"):(st.theme||"paper");var a=st.accent==="auto"?"blue":(st.accent||"auto");var r=document.documentElement;r.setAttribute("data-theme",t);r.setAttribute("data-accent",a);if(st.font)r.setAttribute("data-font",st.font);if(st.density)r.setAttribute("data-density",st.density);if(st.scale)r.setAttribute("data-scale",st.scale);}catch(e){}})();`;