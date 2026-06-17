import { useEffect } from "react";

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = `${title} | Rapido Solutions Co.`;
    const meta = document.querySelector("meta[name='description']");
    if (meta) {
      meta.setAttribute("content", description);
    }
  }, [description, title]);
}
