/**
 * Runs synchronously in the document (before React paint) so `html.dark` matches
 * `localStorage` / system preference. Keeps Tailwind `dark:` variants aligned with
 * body foreground/background CSS variables (see `globals.css`).
 */
export const THEME_BOOT_INLINE_SCRIPT = `(function(){try{var v=localStorage.getItem("linkaios-theme");var d=false;if(v==="dark")d=true;else if(v==="light")d=false;else if(v==="system"){d=window.matchMedia("(prefers-color-scheme: dark)").matches;localStorage.setItem("linkaios-theme",d?"dark":"light");}else{d=window.matchMedia("(prefers-color-scheme: dark)").matches;}document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
