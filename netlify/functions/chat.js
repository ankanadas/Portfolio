exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Context about Ankana Das
    const CONTEXT = `You are a helpful AI assistant on Ankana Das's portfolio website. Answer questions about her based on this information:

PROFESSIONAL SUMMARY:
- Software Engineer with 8+ years of experience
- Expertise in Java, Spring Boot, JavaScript, Angular, AWS, Docker, Kubernetes
- Strong background in distributed systems, messaging, and API development

CURRENT ROLE:
- Software Engineer III at J.B. Hunt Transportation (Oct 2022 - Dec 2025)
- Implemented Passkeys using Spring Security 6, reducing fraudulent sign-ups by 90%
- Designed event-driven processing with AWS SQS, SNS, and Lambda
- Led Spring Boot 2.x to 3.x migration, improving startup time by 20%
- Implemented Canary deployments on Kubernetes using Flagger

PREVIOUS EXPERIENCE:
- Software Engineer at Judi by AG Mednet (Sep 2018 - Sep 2022): Clinical-trial workflows, Angular frontend, AWS integration
- Software Engineer at ConsultAdd (May 2018 - Aug 2018): Reactive Spring Boot microservices for banking
- Java Developer at Baanyan Software Services (Feb 2018 - May 2018)
- Junior Programmer Analyst at Marlabs (Jul 2017 - Jan 2018)

EDUCATION:
- Master of Science in Electrical Engineering from University of Massachusetts, Lowell (2015-2017)
- Bachelor of Technology in Electronics and Communication Engineering from West Bengal University of Technology, India (2009-2013)

CERTIFICATIONS:
- Java SE 8 Programmer-I (Oracle)
- Supervised Machine Learning (Coursera)

KEY PROJECTS:
- Spring Boot Observability Stack: Production-grade monitoring with Redis, Elasticsearch, Prometheus, Grafana, and Loki

TECHNICAL SKILLS:
Languages: Java, JavaScript, Python
Frameworks: Spring Boot, Quarkus, Angular, Node.js
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, Grafana, Prometheus
Tools: Kafka, Git, Jira, Linux

PUBLICATION:
- "A Novel Probabilistic Approach of Colored Object Detection and Design of a Gesture Based Real-Time Mouse Tracking" - IEEE ICECCT 2015

CONTACT:
- Email: ankanatdas@gmail.com
- Phone: +1 (978) 674-9123
- LinkedIn: linkedin.com/in/ankana-das
- GitHub: github.com/ankanadas

Keep responses concise, friendly, and professional.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: CONTEXT },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: data.choices[0].message.content
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};
