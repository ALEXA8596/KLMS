import LLM from "@themaximalist/llm.js";

const providers = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "groq",
  "deepseek",
  "ollama",
];

export async function callLLM(
  prompt,
  {
    service = "hackclub",
    apiKey,
    model,
    temperature = 0.7,
    max_tokens,
    stream = false,
    extended = false,
    messages = [],
    think = false,
    parser = LLM.parsers.json,
    tools = [],
    max_thinking_tokens = 1000,
  }
) {
  if (service === "hackclub") {
    fetch("https://ai.hackclub.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    }).then((response) => {
      if (!response.ok) {
        console.error("Error calling Hack Club API:", response.statusText);
        return;
      }
      return response.json();
    });
  }
  if (!providers.includes(service)) {
    throw new Error(
      `Unsupported service: ${service}. Supported services are: ${providers.join(
        ", "
      )}`
    );
  }

  try {
    const resp = new LLM(prompt, {
      service,
      apiKey,
      model,
      temperature,
      max_tokens,
      stream,
      extended,
      messages,
      think,
      parser,
      tools,
      max_thinking_tokens,
    });

    const response = await resp.send();

    return response;

  } catch (error) {
    console.error("Error calling LLM:", error);
    throw error;
  }
}
