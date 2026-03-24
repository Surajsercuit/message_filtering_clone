export interface Context {
  id: string;
  label: string;
  color: string;
  secure?: boolean;
}

export interface Message {
  id: string;
  text: string;
  contextId: string;
  sender: 'me' | 'them';
  timestamp: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  contexts: string[];
  lastSeen: string;
  unread: Record<string, number>;
}

export const contexts: Context[] = [
  { id: 'all', label: 'All', color: 'hsl(var(--muted-foreground))' },
  { id: 'study', label: 'Study', color: 'hsl(var(--primary))' },
  { id: 'movies', label: 'Movies', color: 'hsl(var(--accent))' },
  { id: 'social', label: 'Social', color: 'hsl(var(--accent-green))' },
  { id: 'private', label: 'Private', color: 'hsl(var(--destructive))', secure: true },
];

export const contacts: Contact[] = [
  {
    id: 'raj',
    name: 'Raj Kumar',
    avatar: 'RK',
    contexts: ['study', 'movies', 'social', 'private'],
    lastSeen: '2 min ago',
    unread: { study: 3, movies: 1, social: 0, private: 0 },
  },
  {
    id: 'suraj',
    name: 'Suraj Patel',
    avatar: 'SP',
    contexts: ['study', 'movies', 'social'],
    lastSeen: '15 min ago',
    unread: { study: 0, movies: 2, social: 1 },
  },
  {
    id: 'alok',
    name: 'Alok Sharma',
    avatar: 'AS',
    contexts: ['study', 'social'],
    lastSeen: '1 hr ago',
    unread: { study: 1, social: 0 },
  },
  {
    id: 'priya',
    name: 'Priya Singh',
    avatar: 'PS',
    contexts: ['movies', 'social', 'private'],
    lastSeen: 'Online',
    unread: { movies: 0, social: 4, private: 1 },
  },
  {
    id: 'neha',
    name: 'Neha Gupta',
    avatar: 'NG',
    contexts: ['study', 'movies'],
    lastSeen: '30 min ago',
    unread: { study: 0, movies: 0 },
  },
];

export const messagesByContact: Record<string, Message[]> = {
  raj: [
    { id: '1', text: 'Bhai notes bhej de kal ka lecture ka', contextId: 'study', sender: 'them', timestamp: '10:30 AM' },
    { id: '2', text: 'Haan ruk, PDF bana rha hu', contextId: 'study', sender: 'me', timestamp: '10:32 AM' },
    { id: '3', text: 'DSA assignment ka deadline extend hua kya?', contextId: 'study', sender: 'them', timestamp: '10:45 AM' },
    { id: '4', text: 'Nahi bhai, Friday tak submit karna hai', contextId: 'study', sender: 'me', timestamp: '10:46 AM' },
    { id: '5', text: 'Oppenheimer dekhi? Bohot acchi hai', contextId: 'movies', sender: 'them', timestamp: '9:15 PM' },
    { id: '6', text: 'Nahi yaar, weekend pe dekhta hu', contextId: 'movies', sender: 'me', timestamp: '9:20 PM' },
    { id: '7', text: 'Interstellar bhi dekh lena fir', contextId: 'movies', sender: 'them', timestamp: '9:22 PM' },
    { id: '8', text: 'Animal dekhi? Ranbir ne bohot accha kaam kiya', contextId: 'movies', sender: 'them', timestamp: '9:30 PM' },
    { id: '9', text: 'Kal party hai Ankit ke ghar, aa rha?', contextId: 'social', sender: 'them', timestamp: '6:00 PM' },
    { id: '10', text: 'Haan bhai, 8 baje aata hu', contextId: 'social', sender: 'me', timestamp: '6:05 PM' },
    { id: '11', text: 'Bhai wo private wali baat yaad hai na?', contextId: 'private', sender: 'them', timestamp: '11:00 PM' },
    { id: '12', text: 'Haan bhai tension mat le, secret safe hai', contextId: 'private', sender: 'me', timestamp: '11:02 PM' },
    { id: '13', text: 'Chapter 5 complete kar liya kya?', contextId: 'study', sender: 'them', timestamp: '11:15 AM' },
  ],
  suraj: [
    { id: '1', text: 'Machine Learning ka project partner chahiye', contextId: 'study', sender: 'them', timestamp: '2:00 PM' },
    { id: '2', text: 'Main hu bhai, topic kya rakhein?', contextId: 'study', sender: 'me', timestamp: '2:05 PM' },
    { id: '3', text: 'Breaking Bad complete kari finally!', contextId: 'movies', sender: 'them', timestamp: '8:00 PM' },
    { id: '4', text: 'Ab Better Call Saul dekh, even better hai', contextId: 'movies', sender: 'me', timestamp: '8:10 PM' },
    { id: '5', text: 'Money Heist ka naya season kab aa rha?', contextId: 'movies', sender: 'them', timestamp: '8:15 PM' },
    { id: '6', text: 'Cricket khelne chal kal subah', contextId: 'social', sender: 'them', timestamp: '7:00 PM' },
  ],
  alok: [
    { id: '1', text: 'Bhai kal exam ka syllabus share kar', contextId: 'study', sender: 'them', timestamp: '4:00 PM' },
    { id: '2', text: 'Unit 1-3 hai, notes group pe daal diye', contextId: 'study', sender: 'me', timestamp: '4:10 PM' },
    { id: '3', text: 'Weekend pe trek chalein?', contextId: 'social', sender: 'them', timestamp: '5:00 PM' },
    { id: '4', text: 'Done! Location bhej', contextId: 'social', sender: 'me', timestamp: '5:05 PM' },
  ],
  priya: [
    { id: '1', text: 'Inception samjhi nahi yaar, explain karo', contextId: 'movies', sender: 'them', timestamp: '10:00 PM' },
    { id: '2', text: 'Dream ke andar dream hai basically 😂', contextId: 'movies', sender: 'me', timestamp: '10:05 PM' },
    { id: '3', text: 'College fest ki planning kab karein?', contextId: 'social', sender: 'them', timestamp: '3:00 PM' },
    { id: '4', text: 'Kal canteen mein milte hain 12 baje', contextId: 'social', sender: 'me', timestamp: '3:10 PM' },
    { id: '5', text: 'Kal surprise plan hai Neha ke liye', contextId: 'social', sender: 'them', timestamp: '3:15 PM' },
    { id: '6', text: 'Mujhe ek baat batani thi...', contextId: 'private', sender: 'them', timestamp: '11:30 PM' },
    { id: '7', text: 'Haan bol, kya hua?', contextId: 'private', sender: 'me', timestamp: '11:32 PM' },
  ],
  neha: [
    { id: '1', text: 'Physics ka formula sheet hai tere paas?', contextId: 'study', sender: 'them', timestamp: '1:00 PM' },
    { id: '2', text: 'Haan, abhi bhejta hu', contextId: 'study', sender: 'me', timestamp: '1:05 PM' },
    { id: '3', text: 'The Office US ya UK?', contextId: 'movies', sender: 'them', timestamp: '9:00 PM' },
    { id: '4', text: 'US obviously, Michael Scott is the GOAT', contextId: 'movies', sender: 'me', timestamp: '9:05 PM' },
  ],
};
