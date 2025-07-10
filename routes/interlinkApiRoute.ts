export async function interlinkApiRoute(req: Request, url: URL) {
  try {
    const body: any = await req.json();
    const inputA = body.inputA;
    const inputB = body.inputB;
    console.log("Received interlink:", { inputA, inputB });

    // Compose a placeholder prompt
    const prompt = `Interlink these two concepts: ${inputA} and ${inputB}.`;

    // Call OpenAI API
    const openaiKey = process.env.OPENAI_KEY;
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_KEY env variable" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `
            You are a helpful assistant that links concepts. You can speak English and Romanian (depending on the promt).
            
            Please use emojis and format your text with the md format. Our audience might have TikTok brain, so use emojis.
            
            You will be descriptive in your answer and you are going to focus on the direct links primarely
            such as people linking other people, or people being linked to companies or industries, or pretty much anything with anything.
            
            You will then talk about indirect links between the two such as phylosophical links or other considerations.
            
            Assume the user has all the basic understanding of the things he is searching, such as their definition. Focus on the link between the concepts, 
            do not talk about each concept individually.
            
            I want a purely objective viewpoint for my users, please use citations and public articles from trustworthy sources.
            Please do not use Private Companies' website as a resource to cite, since they can represent harmful industries, such as gambling, porn, weapons manufacturing.
            We do not want to look like we are advertising such businesses.
            
            Please give me links to cite, write them in the md format. 
             ` },
          { role: "user", content: `Hello, can you please help me find a link between ${inputA} and ${inputB}?` }
        ],
        max_tokens: 1024
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return new Response(JSON.stringify({ error: "OpenAI API error", details: err }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const openaiData: any = await openaiRes.json();
    const choice: any = openaiData?.choices && openaiData.choices[0] ? openaiData.choices[0] : null;
    const completion = choice && choice.message && choice.message.content ? choice.message.content : "No response from OpenAI.";

    return new Response(JSON.stringify({ status: "ok", completion }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON or OpenAI error", details: (e as any)?.message || e }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
} 