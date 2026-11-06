// The member agreement shown in the app. Keep in sync with docs/nda.md.
// To change the wording: edit both, and bump `version`. Every member is then
// asked to sign the new version on their next visit.

export interface NdaSection {
  heading: string
  intro?: string
  items?: string[]
  paragraphs?: string[]
}

export const NDA: {
  version: number
  title: string
  intro: string[]
  sections: NdaSection[]
} = {
  version: 1,
  title: 'Member Confidentiality Agreement',
  intro: [
    'This agreement is between Kaar e Khair o Barr ("KKB"), a volunteer welfare initiative based at UET Lahore, Pakistan, and you, the member signing below.',
    'As a KKB volunteer you may see information about the people we help, the people who support us, and how KKB operates. This agreement explains how you must handle that information, to protect the dignity and privacy of beneficiaries and donors, and the trust people place in KKB.',
  ],
  sections: [
    {
      heading: '1. What counts as confidential',
      intro: '"Confidential information" means anything you learn through KKB that is not already public, in particular:',
      items: [
        'Beneficiary information: names, photos, addresses, phone numbers, family details, medical conditions, financial situation and case details of the people and families KKB supports.',
        'Donor and supporter information: identities, contact details and donation amounts, especially of donors who wish to remain anonymous.',
        "Member information: other members' personal details, such as phone numbers, emails and addresses.",
        'Financial information: account details, balances, budgets, receipts and fund allocations.',
        'Internal matters: unannounced campaigns, events and plans; discussions in KKB groups, including WhatsApp groups; meeting notes and internal documents.',
        'Access details: passwords, login links, invite codes and access to KKB accounts, files or systems.',
      ],
    },
    {
      heading: '2. What you agree to do',
      items: [
        'Use confidential information only to carry out KKB tasks, and only as much as the task needs.',
        'Keep it private. Do not share it outside KKB, and within KKB share it only with members who need it for their work.',
        'Protect beneficiaries’ dignity. Do not photograph, record or post any beneficiary, or anything that could identify them, without KKB’s approval and the beneficiary’s consent. Never share images of anyone in distress for publicity without that consent.',
        'Do not post, publish or make statements on behalf of KKB, or use KKB’s name, logo or social media accounts, unless KKB has authorised it.',
        'Record and hand over any donation you collect in the way KKB directs, and never use it for any other purpose.',
        'Keep your account, passwords and invite codes to yourself. Tell an admin straight away if you think something has been exposed.',
        'If confidential information is shared by mistake, tell a KKB admin as soon as you can.',
      ],
    },
    {
      heading: '3. What is not covered',
      intro: 'This agreement does not stop you from sharing information that:',
      items: [
        'was already public, through no fault of yours;',
        'you already knew before joining KKB, from a source not bound by confidentiality;',
        'KKB has approved for sharing in writing, including in the app or a KKB group message from an admin; or',
        'you are required to disclose by law, a court or a government authority. If allowed, tell KKB first.',
      ],
    },
    {
      heading: '4. When you leave',
      items: [
        'You can ask to leave KKB at any time through the app.',
        'When you leave, return or delete any KKB documents, files, photos and data you hold, and leave any KKB-only groups you are asked to leave.',
        'Your duty of confidentiality continues for two years after you leave. For personal information about beneficiaries, donors and members, it continues for as long as that information remains private.',
      ],
    },
    {
      heading: '5. Breaking this agreement',
      paragraphs: [
        'If you break this agreement, KKB may suspend or remove you from KKB and its groups, and take any other action available to it under the law of Pakistan.',
      ],
    },
    {
      heading: '6. General',
      items: [
        'Membership in KKB is voluntary and unpaid. This agreement does not create employment, partnership or any right to payment.',
        'You sign by ticking the agreement box and typing your full name in the KKB app. KKB stores the version you signed, your typed name and the date and time. This electronic signature has the same effect as a handwritten one.',
        'KKB may update this agreement. You will be asked to sign the new version before continuing to use the app. If you do not agree, you can ask to leave.',
        'This agreement is governed by the laws of Pakistan, and the courts at Lahore have jurisdiction.',
      ],
    },
  ],
}
