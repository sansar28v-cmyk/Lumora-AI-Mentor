import type { QuizQuestion } from "./onboarding-types";

export function generateFallbackQuestions(
  domainName: string,
  experienceLevel: string,
  attempt: number
): QuizQuestion[] {
  // A pool of 40 template-based questions that are injected with the domainName and experienceLevel.
  // We use attempt to slice a different set of 20 questions each time.
  const allTemplates = [
    {
      q: "In {domainName}, which of the following is considered a primary objective for a practitioner?",
      o: [
        "Applying domain-specific best practices to solve problems effectively",
        "Minimizing all communication with stakeholders",
        "Memorizing every framework available without practical application",
        "Avoiding any new technologies"
      ],
      c: 0,
      t: "Fundamentals",
      d: "Easy"
    },
    {
      q: "When evaluating a new tool or framework for {domainName}, what is the most important factor?",
      o: [
        "How many stars it has on GitHub",
        "Whether it aligns with the project requirements and improves efficiency",
        "If it is the newest technology available",
        "Whether it allows bypassing security reviews"
      ],
      c: 1,
      t: "Best Practices",
      d: "Easy"
    },
    {
      q: "As a {experienceLevel} in {domainName}, what is the best approach to handling technical debt?",
      o: [
        "Ignore it until the system breaks",
        "Rewrite the entire application from scratch",
        "Refactor incrementally while delivering business value",
        "Delegate all refactoring to junior team members"
      ],
      c: 2,
      t: "Architecture",
      d: "Medium"
    },
    {
      q: "Which of the following describes a standard workflow in modern {domainName} projects?",
      o: [
        "Writing code directly in production",
        "Using version control, CI/CD, and automated testing",
        "Emailing source files to team members",
        "Skipping testing to deliver faster"
      ],
      c: 1,
      t: "Tools",
      d: "Easy"
    },
    {
      q: "What is a common performance optimization strategy in {domainName}?",
      o: [
        "Adding more comments to the code",
        "Caching frequently accessed data",
        "Increasing the font size of the application",
        "Renaming variables to shorter names"
      ],
      c: 1,
      t: "Performance",
      d: "Medium"
    },
    {
      q: "How should a {experienceLevel} professional in {domainName} approach security?",
      o: [
        "Assume the network is secure and focus only on features",
        "Implement security as an afterthought once the product is live",
        "Adopt a 'security by design' mindset from the beginning",
        "Rely entirely on third-party antivirus software"
      ],
      c: 2,
      t: "Security",
      d: "Medium"
    },
    {
      q: "In {domainName}, what is the main benefit of writing automated tests?",
      o: [
        "It guarantees that there are zero bugs in the application",
        "It ensures code behaves as expected and prevents regressions",
        "It replaces the need for any human QA testing",
        "It automatically optimizes the application's runtime speed"
      ],
      c: 1,
      t: "Testing",
      d: "Easy"
    },
    {
      q: "Which architectural pattern is most frequently discussed in modern {domainName}?",
      o: [
        "Monolithic spaghetti code",
        "Microservices or modular monoliths",
        "Hardcoding all configurations",
        "Storing everything in flat text files"
      ],
      c: 1,
      t: "Architecture",
      d: "Hard"
    },
    {
      q: "What is the primary role of version control in {domainName}?",
      o: [
        "To track changes, collaborate, and manage code history safely",
        "To serve as a backup drive for personal files",
        "To automatically write code for the developer",
        "To enforce coding style guidelines"
      ],
      c: 0,
      t: "Tools",
      d: "Easy"
    },
    {
      q: "When a critical failure occurs in a {domainName} production system, what is the first step?",
      o: [
        "Blame the most junior developer",
        "Immediately delete the database",
        "Identify the root cause through logs and monitoring",
        "Rewrite the failing module completely"
      ],
      c: 2,
      t: "Debugging",
      d: "Medium"
    },
    {
      q: "Which design principle is highly valued in {domainName}?",
      o: [
        "WET (Write Everything Twice)",
        "DRY (Don't Repeat Yourself)",
        "Copy-Paste-Modify",
        "Complex is always better than simple"
      ],
      c: 1,
      t: "Fundamentals",
      d: "Easy"
    },
    {
      q: "For a {experienceLevel} in {domainName}, what is the best way to stay updated?",
      o: [
        "Never learn anything new after college",
        "Read official documentation, blogs, and build projects",
        "Only learn what is required for the current ticket",
        "Wait for someone to teach them directly"
      ],
      c: 1,
      t: "Career",
      d: "Easy"
    },
    {
      q: "How does modularity improve a {domainName} project?",
      o: [
        "By putting all code in a single file",
        "By breaking the system into independent, interchangeable components",
        "By making the codebase harder to understand",
        "By increasing the tight coupling between features"
      ],
      c: 1,
      t: "Architecture",
      d: "Medium"
    },
    {
      q: "What is the purpose of a staging environment in {domainName}?",
      o: [
        "To test new features in a production-like setting before release",
        "To store old, deprecated code",
        "To allow users to try experimental features",
        "To bypass security checks"
      ],
      c: 0,
      t: "Deployment",
      d: "Medium"
    },
    {
      q: "In {domainName}, why is documentation important?",
      o: [
        "It makes the code run faster",
        "It helps onboard new developers and explains the 'why' behind decisions",
        "It is only useful for non-technical managers",
        "It replaces the need for clean code"
      ],
      c: 1,
      t: "Best Practices",
      d: "Easy"
    },
    {
      q: "What is the most common cause of technical debt in {domainName}?",
      o: [
        "Taking shortcuts to meet deadlines without later refactoring",
        "Writing too many automated tests",
        "Using modern frameworks",
        "Spending too much time on code reviews"
      ],
      c: 0,
      t: "Best Practices",
      d: "Medium"
    },
    {
      q: "Which of the following is a symptom of poor architecture in {domainName}?",
      o: [
        "High cohesion and low coupling",
        "A change in one module unexpectedly breaks another",
        "Extensive automated test coverage",
        "Clear separation of concerns"
      ],
      c: 1,
      t: "Architecture",
      d: "Hard"
    },
    {
      q: "How should errors and exceptions be handled in {domainName}?",
      o: [
        "Silently ignored to prevent the app from crashing",
        "Logged properly and handled gracefully to inform the user",
        "Displayed directly to the user with full stack traces",
        "Used as a primary method for control flow"
      ],
      c: 1,
      t: "Debugging",
      d: "Medium"
    },
    {
      q: "What does CI/CD stand for in the context of {domainName}?",
      o: [
        "Code Inspection / Code Delivery",
        "Continuous Integration / Continuous Deployment",
        "Compiled Instructions / Centralized Database",
        "Creative Innovation / Customer Development"
      ],
      c: 1,
      t: "Tools",
      d: "Easy"
    },
    {
      q: "As a {experienceLevel} practitioner in {domainName}, what is the main goal of code review?",
      o: [
        "To prove who is the better programmer",
        "To ensure code quality, share knowledge, and catch bugs early",
        "To delay the release of features",
        "To strictly enforce stylistic preferences over functionality"
      ],
      c: 1,
      t: "Best Practices",
      d: "Easy"
    },
    {
      q: "Which of the following is a key characteristic of scalable {domainName} systems?",
      o: [
        "They can handle increased load by adding resources without redesigning",
        "They only work well for a small number of users",
        "They rely entirely on vertical scaling (bigger servers)",
        "They become slower as more users are added"
      ],
      c: 0,
      t: "Architecture",
      d: "Hard"
    },
    {
      q: "What is the primary purpose of logging in {domainName}?",
      o: [
        "To slow down the application",
        "To record system behavior for auditing and debugging",
        "To store user passwords",
        "To communicate with external APIs"
      ],
      c: 1,
      t: "Debugging",
      d: "Easy"
    },
    {
      q: "In {domainName}, what is meant by 'separation of concerns'?",
      o: [
        "Dividing a program into distinct sections, each addressing a separate concern",
        "Keeping all developers in separate rooms",
        "Using multiple programming languages for a single function",
        "Separating the database from the server physically"
      ],
      c: 0,
      t: "Fundamentals",
      d: "Medium"
    },
    {
      q: "Why is dependency management critical in {domainName} projects?",
      o: [
        "To ensure the project uses the most expensive tools",
        "To keep track of and safely update external libraries and tools",
        "To prevent developers from using any external code",
        "To automatically write business logic"
      ],
      c: 1,
      t: "Tools",
      d: "Easy"
    },
    {
      q: "What is a common anti-pattern in {domainName}?",
      o: [
        "Writing unit tests for business logic",
        "Hardcoding sensitive credentials in source code",
        "Using environment variables for configuration",
        "Refactoring code to improve readability"
      ],
      c: 1,
      t: "Security",
      d: "Medium"
    },
    {
      q: "How can a {experienceLevel} in {domainName} improve system reliability?",
      o: [
        "By implementing redundancy and failover mechanisms",
        "By removing all error handling",
        "By hosting everything on a single server without backups",
        "By deploying directly to production on Fridays"
      ],
      c: 0,
      t: "Architecture",
      d: "Hard"
    },
    {
      q: "What is the role of a package manager in {domainName}?",
      o: [
        "To automate the process of installing, upgrading, and managing dependencies",
        "To design the user interface",
        "To write documentation automatically",
        "To manage project management tickets"
      ],
      c: 0,
      t: "Tools",
      d: "Easy"
    },
    {
      q: "In the context of {domainName}, what is a 'bottleneck'?",
      o: [
        "A feature that users love the most",
        "A point in the system that restricts overall performance or capacity",
        "A type of database index",
        "A secure way to store passwords"
      ],
      c: 1,
      t: "Performance",
      d: "Medium"
    },
    {
      q: "Which practice helps prevent regressions in {domainName}?",
      o: [
        "Deleting old code without checking",
        "Running a comprehensive suite of automated tests before deployment",
        "Only testing the 'happy path'",
        "Relying solely on user complaints to find bugs"
      ],
      c: 1,
      t: "Testing",
      d: "Medium"
    },
    {
      q: "What does 'technical debt' refer to in {domainName}?",
      o: [
        "The money owed to cloud service providers",
        "The implied cost of future rework caused by choosing an easy solution now",
        "The cost of buying new laptops for developers",
        "The time spent writing documentation"
      ],
      c: 1,
      t: "Best Practices",
      d: "Medium"
    },
    {
      q: "For a {experienceLevel} professional, what is the best way to handle changing requirements in {domainName}?",
      o: [
        "Refuse to make any changes once coding has started",
        "Adopt an agile mindset and design flexible, modular systems",
        "Rewrite the entire application every time a requirement changes",
        "Complain to management"
      ],
      c: 1,
      t: "Fundamentals",
      d: "Medium"
    },
    {
      q: "What is the purpose of load testing in {domainName}?",
      o: [
        "To check if the application has a nice color scheme",
        "To determine how the system behaves under expected and peak traffic",
        "To test individual functions in isolation",
        "To check for syntax errors in the code"
      ],
      c: 1,
      t: "Performance",
      d: "Hard"
    },
    {
      q: "In {domainName}, why is it important to keep dependencies updated?",
      o: [
        "To make the application file size larger",
        "To patch security vulnerabilities and get performance improvements",
        "To change the programming language automatically",
        "To break the application intentionally"
      ],
      c: 1,
      t: "Security",
      d: "Medium"
    },
    {
      q: "What is 'Code Refactoring' in {domainName}?",
      o: [
        "Restructuring existing code without changing its external behavior",
        "Adding new features to a legacy application",
        "Translating code from one language to another",
        "Writing code for the first time"
      ],
      c: 0,
      t: "Best Practices",
      d: "Medium"
    },
    {
      q: "Which of the following describes a 'Race Condition' in {domainName}?",
      o: [
        "A competition between developers to finish a task",
        "A bug where the system's behavior depends on the timing of uncontrollable events",
        "A fast algorithm for sorting data",
        "A feature that loads pages quickly"
      ],
      c: 1,
      t: "Debugging",
      d: "Hard"
    },
    {
      q: "What is the primary benefit of using interfaces or abstractions in {domainName}?",
      o: [
        "They make the code run significantly faster",
        "They decouple components, making the system easier to maintain and test",
        "They eliminate the need for databases",
        "They automatically generate user interfaces"
      ],
      c: 1,
      t: "Architecture",
      d: "Hard"
    },
    {
      q: "In {domainName}, what is meant by 'Fail Fast'?",
      o: [
        "A system should immediately report any failure or unexpected condition",
        "A project that fails quickly is better than one that succeeds",
        "Ignoring errors to maintain high speed",
        "A testing framework"
      ],
      c: 0,
      t: "Debugging",
      d: "Medium"
    },
    {
      q: "Why is 'Principle of Least Privilege' important in {domainName}?",
      o: [
        "It reduces costs by minimizing cloud resource usage",
        "It limits access rights for users/systems to only what is strictly required, improving security",
        "It ensures junior developers do less work",
        "It speeds up the application"
      ],
      c: 1,
      t: "Security",
      d: "Medium"
    },
    {
      q: "What is the role of a 'Design Pattern' in {domainName}?",
      o: [
        "A visual layout for the user interface",
        "A general, reusable solution to a commonly occurring problem within a given context",
        "A strict set of rules that cannot be broken",
        "A specific library you must install"
      ],
      c: 1,
      t: "Fundamentals",
      d: "Medium"
    },
    {
      q: "As a {experienceLevel} in {domainName}, how do you ensure code maintainability?",
      o: [
        "By writing all code in a single, massive file",
        "By following consistent coding standards, writing tests, and keeping components modular",
        "By using obscure syntax to show off skills",
        "By never refactoring working code"
      ],
      c: 1,
      t: "Best Practices",
      d: "Easy"
    }
  ];

  // We have exactly 40 questions.
  // We need to return exactly 20.
  // attempt 0 -> index 0 to 19
  // attempt 1 -> index 20 to 39
  // attempt 2 -> index 0 to 19 (wrap around)
  
  const startIndex = (attempt % 2) * 20;
  const selected = allTemplates.slice(startIndex, startIndex + 20);

  return selected.map((tpl, i) => ({
    id: i + 1,
    question: tpl.q.replace(/\{domainName\}/g, domainName).replace(/\{experienceLevel\}/g, experienceLevel),
    options: tpl.o,
    correctIndex: tpl.c,
    topic: tpl.t,
    type: "MCQ",
    difficulty: tpl.d as "Easy" | "Medium" | "Hard",
    explanation: `This is a fundamental concept for a ${experienceLevel} in ${domainName}.`
  }));
}
