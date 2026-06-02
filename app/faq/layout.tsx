import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQs & Guidelines",
  description: "Get instant answers to all frequently asked questions about registration, scheduling, reporting, and event rules for Aarambh '26 at JK Lakshmipat University.",
  openGraph: {
    title: "FAQs & Guidelines | Aarambh '26",
    description: "Get instant answers to all frequently asked questions about registration, scheduling, reporting, and event rules for Aarambh '26.",
    type: 'website'
  }
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What happens during Aarambh 2026 Orientation Week?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Aarambh 2026 is designed to help new students transition smoothly into university life through orientation sessions, campus tours, faculty interactions, workshops, and engaging student activities."
                }
              },
              {
                "@type": "Question",
                "name": "Is attendance mandatory for all orientation activities?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Attendance is not mandatory, but it is highly recommended. All newly admitted students are encouraged to attend the orientation sessions as they contain important academic and administrative information."
                }
              },
              {
                "@type": "Question",
                "name": "Is there an entry fee for the orientation?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The program is free for registered students; a nominal registration fee of 2500 RS is charged to cover comfortable hostel accommodation, all meals, and the special Aarambh welcome kit."
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
