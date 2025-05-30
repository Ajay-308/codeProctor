import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accodion";

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the video proctoring work?",
      answer:
        "Our platform uses secure WebRTC technology to enable real-time video streaming during interviews. Candidates will be prompted to enable their camera when they join the interview session. The video feed is encrypted and can be recorded for later review if needed.",
    },
    {
      question: "What programming languages are supported?",
      answer:
        "CodeProctor supports all major programming languages including JavaScript, Python, Java, C++, Ruby, Go, and many more. Our code execution environment is fully configurable to match your specific requirements.",
    },
    {
      question: "Can I customize the coding challenges?",
      answer:
        "Yes! You can create your own custom coding challenges or choose from our library of pre-built questions. Each challenge can be customized with specific requirements, test cases, and time limits.",
    },
    {
      question: "Is there a limit to the number of interviews I can conduct?",
      answer:
        "The number of interviews depends on your subscription plan. Our Starter plan includes 20 interviews per month, Professional includes 100, and Enterprise offers unlimited interviews. You can always upgrade your plan as your needs grow.",
    },
    {
      question: "How secure is the platform?",
      answer:
        "Security is our top priority. All data is encrypted in transit and at rest. We use industry-standard security practices and regularly undergo security audits. We are SOC 2 compliant and GDPR ready.",
    },
  ];

  return (
    <section className="py-20 xl:ml-14">
      <div className="container px-4 sm:px-6 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              FAQ
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Find answers to common questions about CodeProctor.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-lg border px-6 py-2"
              >
                <AccordionTrigger className="cursor-pointer text-left text-lg font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
