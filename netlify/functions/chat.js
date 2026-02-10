// Simple in-memory rate limiter
const rateLimitStore = new Map();
const RATE_LIMIT = 6; // requests
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];
  
  // Remove requests older than the time window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    const oldestRequest = Math.min(...recentRequests);
    const timeUntilReset = Math.ceil((oldestRequest + RATE_WINDOW - now) / 60000); // minutes
    return {
      allowed: false,
      timeUntilReset
    };
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);
  
  return {
    allowed: true,
    remaining: RATE_LIMIT - recentRequests.length
  };
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Rate limiting based on IP address
  const userIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const rateLimitCheck = checkRateLimit(userIP);
  
  if (!rateLimitCheck.allowed) {
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'rate_limit_exceeded',
        message: `You've reached the limit of ${RATE_LIMIT} questions per 15 minutes. Please try again in ${rateLimitCheck.timeUntilReset} minute${rateLimitCheck.timeUntilReset > 1 ? 's' : ''}.`
      })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Context about Ankana Das
    const CONTEXT = `You are a helpful AI assistant on Ankana Das's portfolio website. Answer questions about her based on this information:

PROFESSIONAL SUMMARY:
- Software Engineer with 8+ years of Java experience
- Top Skills: Java, Spring Boot, SQL
- Recently focused on backend development (last 4+ years)
- Full-stack developer background with 4 years of JavaScript experience
- Expertise in Java, Spring Boot, JavaScript, Angular, AWS, Docker, Kubernetes
- Strong background in distributed systems, messaging, and API development
- Knowledge of System Design (Low-Level Design and High-Level Design)
- Thrives in collaborative environments, sharing ideas and working closely with cross-functional teams
- Follows SOLID principles and writes testable, clean code
- Experienced with Test-Driven Development (TDD) and Behavior-Driven Development (BDD)
- Background as QA/SDET with Selenium WebDriver automation experience

CURRENT ROLE - J.B. HUNT TRANSPORTATION:
Software Engineer III (Oct 2022 - Dec 2025)

KEY PROJECT - Multi-Tenant Authorization Service:
Built a centralized, multi-tenant authorization service for SaaS companies to control access across multiple products with strict data isolation. Key features:
- Multi-tenant architecture with organization-based data boundaries
- Each customer organization has its own users and subscribed products
- Role-based access control (admin, manager, viewer roles)
- Centralized policy engine for authorization decisions
- Fine-grained, attribute-based authorization
- API-level access control - requests evaluated in real-time
- Scalable access control across multiple products
- Consistent authorization policies organization-wide

Cross-Functional Team Collaboration:
- Worked with Carrier Service team
- Collaborated with Shipment Service team
- Integrated with Order Management Service
- Core business functionality: Transportation logistics, carrier management, shipment tracking, and order processing

KAFKA PROJECT - Event-Driven User Management:
Implemented Kafka as the event backbone for user and carrier-related updates at JB Hunt:
- Event Publishing: User Service publishes events to Kafka topic (keyed by userId) after DB persistence
- User Lifecycle Events: User creation, role/attribute updates, deactivation
- Multiple Consumers: Different consumer groups for different purposes
  * Redis cache updates for fast authorization checks
  * Elasticsearch index updates for search functionality
  * Internal system integrations
- Benefits: 
  * Replaced DB polling-based integrations
  * Asynchronous, near real-time processing
  * Decoupled services architecture
  * Reduced database read load
  * Reliable handling of bursty updates
  * Independent consumer scaling
  * Maintained ordered processing per user (via userId key)

Other Achievements:
- Implemented Passkeys using Spring Security 6, reducing fraudulent sign-ups by 90%
- Designed event-driven processing with AWS SQS, SNS, and Lambda
- Led Spring Boot 2.x to 3.x migration, improving startup time by 20%
- Implemented Canary deployments on Kubernetes using Flagger
- Achieved 90%+ test coverage through comprehensive unit and integration testing

PREVIOUS EXPERIENCE:
Software Engineer at Judi by AG Mednet (Sep 2018 - Sep 2022):
- Full-stack developer role (4 years JavaScript experience here)
- Clinical-trial workflows, improving efficiency by 30%

DETAILED PROJECT - Clinical Trial Imaging Workflow (AWS):
Built a secure, scalable clinical trial imaging system on AWS for handling DICOM medical images:
- Architecture: Java Spring Boot backend with AWS S3, Lambda, DynamoDB, SQS, SNS
- Upload Flow: Clinical sites uploaded DICOM images to S3 using pre-signed URLs for security
- Storage: S3 for durable image storage, SQL database for workflow state/metadata/permissions
- Processing Pipeline:
  * S3 triggers Lambda on upload for validation and metadata extraction
  * Metadata stored in DynamoDB for fast access
  * Lambda pushes to SQS for decoupled heavy processing
  * Background workers consume from SQS for image validation, anonymization, and review preparation
  * SNS notifications for reviewer workflows and user alerts
- Benefits: Fast uploads, secure medical image handling, scalable for large clinical trials
- Built responsive frontend features using Angular, JavaScript, HTML, and CSS
- Integrated AWS services (API Gateway, S3, Lambda, DynamoDB), cutting operational costs by 40%
- Designed CI/CD pipelines in Jenkins, accelerating release cycles by 40%

Software Engineer at ConsultAdd (May 2018 - Aug 2018):
- Reactive Spring Boot microservices for banking
- SonarQube for code quality monitoring
- Apache Tomcat performance tuning
- GitLab CI/CD pipelines

Java Developer at Baanyan Software Services (Feb 2018 - May 2018):
- Database validation and SQL operations
- Jenkins and Bitbucket CI/CD
- Comprehensive testing to minimize regression

Junior Programmer Analyst at Marlabs (Jul 2017 - Jan 2018):
- Full-stack development with Spring MVC
- SQL query optimization (reduced retrieval time by 200-300ms)
- Automation with Maven, Selenium WebDriver, TestNG
- Agile Scrum methodology

EDUCATION:
- Master of Science in Electrical Engineering from University of Massachusetts, Lowell (2015-2017)
- Bachelor of Technology in Electronics and Communication Engineering from West Bengal University of Technology, India (2009-2013)

CERTIFICATIONS:
- Java SE 8 Programmer-I (Oracle)
- Supervised Machine Learning (Coursera)

KEY PROJECTS:
- Multi-Tenant Authorization Service: Centralized access control for SaaS products
- Spring Boot Observability Stack: Production-grade monitoring with Redis, Elasticsearch, Prometheus, Grafana, and Loki

TECHNICAL SKILLS:
Languages: Java (8+ years), JavaScript (4+ years), Python
Frameworks: Spring Boot, Spring Security, Quarkus, Angular, Node.js
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Cloud & DevOps: AWS (SQS, SNS, Lambda, API Gateway, S3, DynamoDB), Docker, Kubernetes, Jenkins, Grafana, Prometheus
Architecture: Microservices, Multi-tenant systems, Event-driven architecture
Design: System Design (LLD and HLD), Authorization systems, Policy engines
Tools: Kafka, Git, Jira, Linux, Maven, Selenium

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
