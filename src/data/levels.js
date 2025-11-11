export const LEVELS = [
  {
    id: 1,
    key: 'home-chat',
    title: 'Home Chat',
    setting: 'Talk to Mom about your day',
    description: 'Simple everyday conversation with very encouraging feedback',
    targets: {
      sentences: [
        'I drank milk before school',
        'I am happy today'
      ],
      words: ['milk', 'school', 'happy']
    },
    npc: {
      name: 'Mom',
      style: 'very encouraging',
      behavior: 'repeats words slowly, gives lots of praise'
    },
    goal: 70,
    difficulty: 1
  },
  {
    id: 2,
    key: 'playground-friend',
    title: 'Playground Friend',
    setting: 'Invite a friend to play',
    description: 'Practice consonant clusters in a playful setting',
    targets: {
      sentences: [
        'Do you want to play string games',
        'Let us play together'
      ],
      words: ['play', 'string'],
      phonemes: ['pl', 'str']
    },
    npc: {
      name: 'Friend',
      style: 'playful',
      behavior: 'offers stickers for each new word mastered, very energetic'
    },
    goal: 75,
    difficulty: 2
  },
  {
    id: 3,
    key: 'classroom-qa',
    title: 'Classroom Q&A',
    setting: 'Ask the teacher a question about homework',
    description: 'Practice longer words and basic grammar phrases',
    targets: {
      sentences: [
        'Can you help me with homework',
        'When is the test'
      ],
      words: ['question', 'homework', 'help']
    },
    npc: {
      name: 'Teacher',
      style: 'educational',
      behavior: 'gives 1 corrective hint per mistake, patient and clear'
    },
    goal: 80,
    difficulty: 3
  },
  {
    id: 4,
    key: 'store-helper',
    title: 'Store Helper',
    setting: 'You are buying 3 items from the shop',
    description: 'Practice numerals, item names, and polite phrases',
    targets: {
      sentences: [
        'I would like three apples',
        'Thank you for the help'
      ],
      words: ['one', 'two', 'three', 'apple', 'please', 'thank you']
    },
    npc: {
      name: 'Shopkeeper',
      style: 'polite',
      behavior: 'corrects politely, asks for repeat: "Could you say apple again?"'
    },
    goal: 80,
    difficulty: 4
  },
  {
    id: 5,
    key: 'telephone-call',
    title: 'Telephone Call',
    setting: 'Call Grandma to say hello',
    description: 'Practice diphthongs and vowel clarity with background noise',
    targets: {
      sentences: [
        'Hello grandma how are you',
        'I miss you and love you'
      ],
      words: ['hello', 'how', 'you', 'love']
    },
    npc: {
      name: 'Grandma',
      style: 'soft and gentle',
      behavior: 'speaks softly, asks clarifying questions if unclear'
    },
    goal: 85,
    difficulty: 5
  },
  {
    id: 6,
    key: 'doctor-visit',
    title: 'Doctor Visit',
    setting: 'Describe a small problem to the doctor',
    description: 'Practice longer medical words and sentences',
    targets: {
      sentences: [
        'My head hurts a little',
        'My stomach feels bad'
      ],
      words: ['headache', 'stomach', 'hurt', 'feel']
    },
    npc: {
      name: 'Doctor',
      style: 'professional but kind',
      behavior: 'models slow correct pronunciation, asks follow-up questions'
    },
    goal: 85,
    difficulty: 6
  },
  {
    id: 7,
    key: 'school-presentation',
    title: 'School Presentation',
    setting: 'Give a 15-second presentation',
    description: 'Practice stress, intonation, and linking words',
    targets: {
      sentences: [
        'Today I will tell you about my favorite animal',
        'I like dogs because they are friendly'
      ],
      words: ['presentation', 'favorite', 'because', 'friendly']
    },
    npc: {
      name: 'Classroom',
      style: 'supportive audience',
      behavior: 'gives applause and tips on pacing, encourages confidence'
    },
    goal: 90,
    difficulty: 7
  },
  {
    id: 8,
    key: 'shopkeeper-advanced',
    title: 'Advanced Shopping',
    setting: 'Buy items and negotiate prices',
    description: 'Complex roleplay with multisyllabic words and fast turn-taking',
    targets: {
      sentences: [
        'How much does the watermelon cost',
        'Can I have a discount please'
      ],
      words: ['watermelon', 'discount', 'expensive', 'bargain']
    },
    npc: {
      name: 'Shopkeeper',
      style: 'experienced merchant',
      behavior: 'uses complex phrases, expects polite sentences, challenges with questions'
    },
    goal: 90,
    difficulty: 8
  }
]
