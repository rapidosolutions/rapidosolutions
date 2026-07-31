import { useEffect } from "react";

export function useStructuredData(id, data) {
  const serializedData = data ? JSON.stringify(data) : "";

  useEffect(() => {
    if (!serializedData) return undefined;

    const selector = `script[data-rapido-schema="${id}"]`;
    let script = document.head.querySelector(selector);

    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.rapidoSchema = id;
      document.head.appendChild(script);
    }

    script.textContent = serializedData;
    return () => script.remove();
  }, [id, serializedData]);
}
