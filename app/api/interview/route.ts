import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'edge';

const DOMAIN_CONTEXTS: Record<string, string> = {
  'AI/ML': 'machine learning, deep learning, neural networks, Python, PyTorch, TensorFlow, scikit-learn, data preprocessing, model training, NLP, computer vision',
  'Web Development': 'frontend (React, Next.js, TypeScript, CSS), backend (Node.js, REST APIs, databases), system design, performance, accessibility',
  'Cybersecurity': 'network security, penetration testing, cryptography, vulnerability assessment, OWASP, Linux security, ethical hacking',
  'Embedded Systems': 'microcontrollers, Arduino, Raspberry Pi, C/C++, RTOS, communication protocols (I2C, SPI, UART), hardware interfacing',
  'Data Engineering': 'ETL pipelines, SQL, Apache Spark, BigQuery, data warehousing, schema design, data quality',
  'Mobile Development': 'Android/iOS, React Native, Kotlin, Swift, UI/UX for mobile, app lifecycle, APIs, storage',
  'Robotics': 'ROS, kinematics, actuators, sensors, path planning, computer vision for robotics, control systems',
  'Cloud & DevOps': 'AWS/GCP/Azure, Docker, Kubernetes, CI/CD pipelines, infrastructure as code, monitoring',
  'General Software Engineering': 'data structures, algorithms, system design, object-oriented programming, code quality, debugging, testing',
};

function buildSystemPrompt(domain: string, resumeText?: string): string {
  const domainContext = DOMAIN_CONTEXTS[domain] || DOMAIN_CONTEXTS['General Software Engineering'];

  return `You are a senior technical interviewer at a top engineering company conducting a professional mock interview for an internship candidate from Mar Baselios College of Engineering and Technology (MBCET), Kerala.

Your focus domain is: **${domain}**
Relevant topics for this domain: ${domainContext}

${resumeText ? `The candidate has provided the following resume/background:\n---\n${resumeText.slice(0, 2000)}\n---\nTailor your questions to their background where relevant.` : ''}

## Interview Protocol
1. Start by introducing yourself briefly (1-2 sentences only), then immediately ask your first technical question.
2. Ask one question at a time — never multiple.
3. After the candidate answers, provide brief, professional feedback (2-3 lines max) acknowledging what was good and what could be improved. Then ask the next question.
4. Progress from conceptual questions → implementation questions → problem-solving/coding challenges.
5. After 5-6 exchanges, provide a concise overall evaluation with a score out of 10 and top 2-3 improvement areas.

## Tone & Style
- Professional but encouraging — this is a student's mock interview, not a real rejection
- Be specific in your feedback — not "good answer" but "You correctly identified time complexity but missed edge case handling for empty arrays"
- Use realistic interviewer phrasing: "That's a solid foundation. Let me push you a bit further..."
- If an answer is wrong, guide them toward the right direction without revealing the full answer

## Important Constraints
- Stay strictly on topic for the ${domain} domain
- Do NOT ask about personal life, hobbies, or generic HR questions
- Keep each message under 150 words
- If the user goes off-topic, gently redirect them back to the interview`;
}

export async function POST(req: Request) {
  try {
    const { messages, domain, resumeText } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages array' }), { status: 400 });
    }

    const selectedDomain = domain || 'General Software Engineering';
    const systemPrompt = buildSystemPrompt(selectedDomain, resumeText);

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 400,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('[Interview API] Error:', err);
    return new Response(JSON.stringify({ error: 'Interview session failed. Please try again.' }), { status: 500 });
  }
}
