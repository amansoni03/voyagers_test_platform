import { Question, SectionId } from '../types';

export interface SectionMeta {
  id: SectionId;
  title: string;
  shortName: string;
  durationMinutes: number;
  totalMarks: number;
  iconName: string;
  description: string;
}

export const TCS_SECTIONS: SectionMeta[] = [
  {
    id: 'numerical',
    title: 'Numerical Ability',
    shortName: 'Numerical',
    durationMinutes: 25,
    totalMarks: 25,
    iconName: 'Calculator',
    description: 'Arithmetic, Algebra, Percentages, Time & Work, Speed & Distance, Probability'
  },
  {
    id: 'verbal',
    title: 'Verbal Ability',
    shortName: 'Verbal',
    durationMinutes: 25,
    totalMarks: 25,
    iconName: 'BookOpen',
    description: 'Reading Comprehension, Error Spotting, Para-jumbles, Vocabulary, Sentence Completion'
  },
  {
    id: 'reasoning',
    title: 'Reasoning Ability',
    shortName: 'Reasoning',
    durationMinutes: 25,
    totalMarks: 25,
    iconName: 'BrainCircuit',
    description: 'Deductive Logic, Seating Arrangements, Coding-Decoding, Syllogisms, Blood Relations'
  },
  {
    id: 'advanced',
    title: 'Advanced Quantitative & Reasoning',
    shortName: 'Adv Quant',
    durationMinutes: 20,
    totalMarks: 20,
    iconName: 'Sparkles',
    description: 'Higher-level analytical problem solving, Cryptarithmetic, Permutations, Data Interpretation'
  },
  {
    id: 'coding',
    title: 'Hands-on Coding (AI Logic Graded)',
    shortName: 'Coding',
    durationMinutes: 45,
    totalMarks: 60,
    iconName: 'Code2',
    description: '2 Algorithmic Problems in any programming language evaluated with AI logic leniency'
  }
];

export const TCS_QUESTIONS: Question[] = [
  // SECTION 1: NUMERICAL ABILITY
  {
    id: 'num_1',
    sectionId: 'numerical',
    title: 'Profit & Loss with Successive Discounts',
    questionText: 'A retailer in Hazratganj, Lucknow marks up the price of an article by 40% above its cost price. He then allows two successive discounts of 15% and 10% to a customer. If the cost price is ₹2,500, what is the net profit or loss incurred by the retailer?',
    marks: 5,
    topic: 'Commercial Math',
    options: [
      { id: 'a', text: 'Profit of ₹177.50' },
      { id: 'b', text: 'Loss of ₹125.00' },
      { id: 'c', text: 'Profit of ₹225.00' },
      { id: 'd', text: 'Profit of ₹155.00' }
    ],
    correctOptionId: 'a',
    explanation: 'Cost Price (CP) = ₹2500.\nMarked Price (MP) = 2500 × 1.40 = ₹3500.\nSelling Price after 1st discount of 15% = 3500 × 0.85 = ₹2975.\nSelling Price after 2nd discount of 10% = 2975 × 0.90 = ₹2677.50.\nNet Profit = SP - CP = 2677.50 - 2500 = ₹177.50 profit.'
  },
  {
    id: 'num_2',
    sectionId: 'numerical',
    title: 'Time, Speed & Relative Velocity',
    questionText: 'Two express trains start simultaneously from Lucknow Charbagh and Varanasi Cantt towards each other at speeds of 72 km/h and 54 km/h respectively. When they meet, the first train has traveled 54 km more than the second train. Find the total railway track distance between Lucknow and Varanasi.',
    marks: 5,
    topic: 'Time and Distance',
    options: [
      { id: 'a', text: '354 km' },
      { id: 'b', text: '378 km' },
      { id: 'c', text: '392 km' },
      { id: 'd', text: '420 km' }
    ],
    correctOptionId: 'b',
    explanation: 'Let time until meeting be t hours.\nDistance traveled by Train 1 = 72t.\nDistance traveled by Train 2 = 54t.\nGiven: 72t - 54t = 54 km => 18t = 54 => t = 3 hours.\nTotal distance = 72(3) + 54(3) = 216 + 162 = 378 km.'
  },
  {
    id: 'num_3',
    sectionId: 'numerical',
    title: 'Work Efficiency & Alternating Shifts',
    questionText: 'P, Q, and R can complete a software module in 12, 15, and 20 days respectively. P works on all days, while Q and R assist P on alternate days starting with Q on day 1. In how many days will the software module be completed?',
    marks: 5,
    topic: 'Time and Work',
    options: [
      { id: 'a', text: '6 days' },
      { id: 'b', text: '7 days' },
      { id: 'c', text: '8 days' },
      { id: 'd', text: '9 days' }
    ],
    correctOptionId: 'b',
    explanation: 'Total work = LCM(12, 15, 20) = 60 units.\nEfficiency of P = 60/12 = 5 units/day.\nEfficiency of Q = 60/15 = 4 units/day.\nEfficiency of R = 60/20 = 3 units/day.\nDay 1 (P + Q) = 5 + 4 = 9 units.\nDay 2 (P + R) = 5 + 3 = 8 units.\nIn a 2-day cycle: 9 + 8 = 17 units.\nIn 3 cycles (6 days): 17 × 3 = 51 units.\nRemaining work = 60 - 51 = 9 units.\nDay 7: (P + Q) completes 9 units.\nTotal days = 6 + 1 = 7 days.'
  },
  {
    id: 'num_4',
    sectionId: 'numerical',
    title: 'Combinatorics & Probability',
    questionText: 'A committee of 5 students is to be formed from 6 CSE students and 4 IT students of SMS Lucknow. What is the probability that the committee contains at least 3 CSE students?',
    marks: 5,
    topic: 'Probability & Combinations',
    options: [
      { id: 'a', text: '31/42' },
      { id: 'b', text: '23/42' },
      { id: 'c', text: '37/42' },
      { id: 'd', text: '19/42' }
    ],
    correctOptionId: 'a',
    explanation: 'Total ways to choose 5 from 10: 10C5 = 252.\nFavorable cases (at least 3 CSE):\n1) 3 CSE & 2 IT: 6C3 × 4C2 = 20 × 6 = 120\n2) 4 CSE & 1 IT: 6C4 × 4C1 = 15 × 4 = 60\n3) 5 CSE & 0 IT: 6C5 × 4C0 = 6 × 1 = 6\nTotal favorable = 120 + 60 + 6 = 186.\nProbability = 186 / 252 = 31 / 42.'
  },
  {
    id: 'num_5',
    sectionId: 'numerical',
    title: 'Compound Interest vs Simple Interest Difference',
    questionText: 'The difference between the compound interest (compounded annually) and simple interest on a principal amount of ₹15,000 for 2 years at an annual interest rate of r% is ₹96. What is the value of r?',
    marks: 5,
    topic: 'Interest & Finance',
    options: [
      { id: 'a', text: '7.5%' },
      { id: 'b', text: '8%' },
      { id: 'c', text: '8.5%' },
      { id: 'd', text: '9%' }
    ],
    correctOptionId: 'b',
    explanation: 'For 2 years, Difference = P × (r / 100)^2.\n96 = 15000 × (r / 100)^2\n(r / 100)^2 = 96 / 15000 = 0.0064\nr / 100 = √0.0064 = 0.08\nr = 8%.'
  },

  // SECTION 2: VERBAL ABILITY
  {
    id: 'vrb_1',
    sectionId: 'verbal',
    title: 'Sentence Completion & Precision',
    questionText: 'Choose the most appropriate word pair to fill in the blanks:\n"The senior faculty member\'s ________ explanation of the complex neural architecture was so ________ that even first-year undergraduates grasped the core mechanics effortlessly."',
    marks: 5,
    topic: 'Vocabulary & Context',
    options: [
      { id: 'a', text: 'lucid, illuminating' },
      { id: 'b', text: 'esoteric, convoluted' },
      { id: 'c', text: 'verbose, ambidextrous' },
      { id: 'd', text: 'laconic, opaque' }
    ],
    correctOptionId: 'a',
    explanation: '"Lucid" means clearly expressed and easy to understand; "illuminating" means helping to clarify or explain. Both fit the positive outcome where even first-years understood effortlessly.'
  },
  {
    id: 'vrb_2',
    sectionId: 'verbal',
    title: 'Error Identification in Grammatical Syntax',
    questionText: 'Identify the segment of the sentence that contains a grammatical error:\n(A) Neither the head of the department / (B) nor the visiting professors from IIT / (C) were convinced by the proposed hypothesis / (D) because of its lack of empirical verification.',
    marks: 5,
    topic: 'Subject-Verb Agreement',
    options: [
      { id: 'a', text: 'Segment (A)' },
      { id: 'b', text: 'Segment (B)' },
      { id: 'c', text: 'Segment (C)' },
      { id: 'd', text: 'No error in the sentence' }
    ],
    correctOptionId: 'd',
    explanation: 'In "neither... nor..." constructions, the verb agrees with the closer subject ("visiting professors" is plural, so plural verb "were convinced" is grammatically correct). Hence there is no error.'
  },
  {
    id: 'vrb_3',
    sectionId: 'verbal',
    title: 'Para-Jumble Cohesion',
    questionText: 'Rearrange the following sentences (P, Q, R, S) into a coherent paragraph:\n[P] Consequently, enterprise data pipelines must now incorporate automated drift detection.\n[Q] Large language models deployed in real-time environments often degrade in performance over prolonged intervals.\n[R] This phenomenon, known as model concept drift, stems from subtle shifts in demographic or linguistic patterns.\n[S] Without such monitoring frameworks, production systems run the risk of hallucinating biased decisions.',
    marks: 5,
    topic: 'Para Jumbles',
    options: [
      { id: 'a', text: 'Q - R - P - S' },
      { id: 'b', text: 'R - Q - S - P' },
      { id: 'c', text: 'Q - P - R - S' },
      { id: 'd', text: 'P - Q - R - S' }
    ],
    correctOptionId: 'a',
    explanation: 'Q introduces the core topic (LLM performance degradation). R explains "This phenomenon" (concept drift). P introduces the consequence (need for drift detection). S concludes by explaining what happens "Without such monitoring frameworks". Order: Q - R - P - S.'
  },
  {
    id: 'vrb_4',
    sectionId: 'verbal',
    title: 'Reading Comprehension & Critical Inference',
    questionText: 'Read the excerpt:\n"The transition from monolithic enterprise systems to microservices is not merely a triumph of decoupled deployment; it is equally an organizational tax on observability. When an application is split across eighty distributed RPC services, latency debugging ceases to be a single stack trace and transforms into a distributed tracing puzzle where network hops dominate compute cycles."\n\nWhat is the author\'s primary contention?',
    marks: 5,
    topic: 'Reading Comprehension',
    options: [
      { id: 'a', text: 'Microservices architectures are fundamentally inferior to monoliths and should be avoided.' },
      { id: 'b', text: 'The operational flexibility of microservices comes at the cost of heightened monitoring complexity and tracing overhead.' },
      { id: 'c', text: 'Distributed tracing completely eliminates network compute cycles in production.' },
      { id: 'd', text: 'Modern enterprise systems no longer rely on remote procedure calls (RPC).' }
    ],
    correctOptionId: 'b',
    explanation: 'The excerpt highlights the "organizational tax on observability" and how debugging transforms into a distributed tracing puzzle, demonstrating the trade-off of heightened operational and debugging complexity.'
  },
  {
    id: 'vrb_5',
    sectionId: 'verbal',
    title: 'Idiomatic Usage & Phrasal Precision',
    questionText: 'Select the sentence that correctly utilizes the idiom "to steal a march on":',
    marks: 5,
    topic: 'Idioms and Phrases',
    options: [
      { id: 'a', text: 'The tech startup stole a march on its competitors by filing the core patent six months before their rival product announcement.' },
      { id: 'b', text: 'The suspect stole a march on the police by breaking into the bank vault during midnight.' },
      { id: 'c', text: 'The student was disqualified because he stole a march on his classmate\'s examination paper.' },
      { id: 'd', text: 'The military brigade marched through the town and stole rations from the marketplace.' }
    ],
    correctOptionId: 'a',
    explanation: '"To steal a march on someone" means to gain an advantage over someone, especially by acting earlier or preemptively.'
  },

  // SECTION 3: REASONING ABILITY
  {
    id: 'rsn_1',
    sectionId: 'reasoning',
    title: 'Circular Seating Arrangement with Facing Directions',
    questionText: 'Eight engineers (A, B, C, D, E, F, G, H) sit around a circular conference table facing the center. B sits third to the right of F. D is an immediate neighbor of neither B nor F. H sits second to the left of D. C sits between A and G. E sits to the immediate left of B. Who sits opposite to H?',
    marks: 5,
    topic: 'Seating Arrangement',
    options: [
      { id: 'a', text: 'B' },
      { id: 'b', text: 'A' },
      { id: 'c', text: 'E' },
      { id: 'd', text: 'C' }
    ],
    correctOptionId: 'c',
    explanation: 'Placing positions 1 through 8 clockwise:\nLet F be at 1. B is 3rd to right -> position 4.\nE is immediate left of B -> position 3.\nD cannot be neighbor of B (3, 5) or F (8, 2). Thus D must be at 6 or 7.\nIf D is at 6, H (2nd to left of D) is at 8. H is directly opposite E (position 4 steps away in 8-person circle: pos 4 vs pos 8 or pos 3 vs pos 7). In the resolved arrangement, opposite to H is E.'
  },
  {
    id: 'rsn_2',
    sectionId: 'reasoning',
    title: 'Coded Blood Relations',
    questionText: 'Read the definitions:\n"P + Q" means P is the father of Q.\n"P - Q" means P is the sister of Q.\n"P × Q" means P is the brother of Q.\n"P ÷ Q" means P is the mother of Q.\nWhich of the following expressions indicates that "M is the maternal grandmother of T"?',
    marks: 5,
    topic: 'Blood Relations',
    options: [
      { id: 'a', text: 'M ÷ K + T' },
      { id: 'b', text: 'M ÷ K ÷ T' },
      { id: 'c', text: 'M - K ÷ T' },
      { id: 'd', text: 'M + K ÷ T' }
    ],
    correctOptionId: 'b',
    explanation: 'M maternal grandmother of T means M is mother of T\'s mother.\nIn M ÷ K ÷ T:\nM ÷ K means M is mother of K.\nK ÷ T means K is mother of T.\nTherefore M is mother of K (who is mother of T) => M is maternal grandmother of T.'
  },
  {
    id: 'rsn_3',
    sectionId: 'reasoning',
    title: 'Syllogisms with "Only a few" Qualifiers',
    questionText: 'Statements:\n1. Only a few algorithms are neural networks.\n2. All neural networks are models.\n3. No model is a hardware circuit.\n\nConclusions:\nI. Some algorithms are definitely not hardware circuits.\nII. Some algorithms are not neural networks.',
    marks: 5,
    topic: 'Syllogism',
    options: [
      { id: 'a', text: 'Only Conclusion I follows' },
      { id: 'b', text: 'Only Conclusion II follows' },
      { id: 'c', text: 'Both Conclusion I and II follow' },
      { id: 'd', text: 'Neither follows' }
    ],
    correctOptionId: 'c',
    explanation: '"Only a few algorithms are neural networks" strictly means both: "Some algorithms are neural networks" AND "Some algorithms are NOT neural networks" (so Conclusion II is definitely true).\nAlso, the algorithms that are neural networks are models, and no model is a hardware circuit; so those algorithms cannot be hardware circuits (Conclusion I is true). Hence both follow.'
  },
  {
    id: 'rsn_4',
    sectionId: 'reasoning',
    title: 'Data Sufficiency on Order & Ranking',
    questionText: 'Among six candidates (P, Q, R, S, T, U) who secured ranks in SMS campus drive, who got the third rank?\nStatement I: P scored higher than Q and R, but scored lower than T.\nStatement II: S scored higher than T. U scored the least.',
    marks: 5,
    topic: 'Data Sufficiency',
    options: [
      { id: 'a', text: 'Statement I alone is sufficient' },
      { id: 'b', text: 'Statement II alone is sufficient' },
      { id: 'c', text: 'Both statements together are sufficient' },
      { id: 'd', text: 'Neither nor both statements together are sufficient' }
    ],
    correctOptionId: 'c',
    explanation: 'From I: T > P > (Q, R).\nFrom II: S > T, and U is lowest.\nCombining: S > T > P > {Q, R} > U.\nHere the ranks are: 1st: S, 2nd: T, 3rd: P, 4th/5th: Q or R, 6th: U.\nP is uniquely established as the 3rd rank holder. Thus both statements together are sufficient.'
  },
  {
    id: 'rsn_5',
    sectionId: 'reasoning',
    title: 'Alphanumeric Pattern & Matrix Logic',
    questionText: 'Find the missing element in the series:\nZ1A, X4D, V9G, T16J, ?',
    marks: 5,
    topic: 'Series & Sequences',
    options: [
      { id: 'a', text: 'R25M' },
      { id: 'b', text: 'R25L' },
      { id: 'c', text: 'S25M' },
      { id: 'd', text: 'R36N' }
    ],
    correctOptionId: 'a',
    explanation: 'First letter: Z(-2) -> X(-2) -> V(-2) -> T(-2) -> R.\nMiddle number: 1^2=1, 2^2=4, 3^2=9, 4^2=16, 5^2=25.\nLast letter: A(+3) -> D(+3) -> G(+3) -> J(+3) -> M.\nResult: R25M.'
  },

  // SECTION 4: ADVANCED QUANTITATIVE & REASONING
  {
    id: 'adv_1',
    sectionId: 'advanced',
    title: 'Cryptarithmetic Addition Logic',
    questionText: 'In the cryptarithmetic addition problem where each distinct letter represents a unique single digit (0-9):\n   SEND\n + MORE\n ------\n  MONEY\nWhat is the numerical value of the 5-digit word "MONEY"?',
    marks: 5,
    topic: 'Cryptarithmetic',
    options: [
      { id: 'a', text: '10652' },
      { id: 'b', text: '10853' },
      { id: 'c', text: '10752' },
      { id: 'd', text: '10432' }
    ],
    correctOptionId: 'a',
    explanation: 'Standard classic TCS NQT cryptarithm:\nM must be 1 (carry over from column 4).\nS must be 9.\nO = 0.\nE = 5, N = 6, D = 7, R = 8, Y = 2.\nSEND = 9567\nMORE = 1085\nMONEY = 10652.'
  },
  {
    id: 'adv_2',
    sectionId: 'advanced',
    title: 'Advanced Modular Arithmetic & Remainder Theorem',
    questionText: 'Find the remainder when (37^105 + 23^105) is divided by 60.',
    marks: 5,
    topic: 'Number Theory',
    options: [
      { id: 'a', text: '0' },
      { id: 'b', text: '14' },
      { id: 'c', text: '30' },
      { id: 'd', text: '1' }
    ],
    correctOptionId: 'a',
    explanation: 'For any odd integer n, (a^n + b^n) is always divisible by (a + b).\nHere n = 105 (odd), a = 37, b = 23.\na + b = 37 + 23 = 60.\nSince (37^105 + 23^105) is an exact multiple of 60, the remainder upon division by 60 is 0.'
  },
  {
    id: 'adv_3',
    sectionId: 'advanced',
    title: 'Geometric Probability in Continuous Domain',
    questionText: 'Two random real numbers x and y are chosen uniformly and independently from the interval [0, 2]. What is the probability that their sum (x + y) is less than 2, given that (x^2 + y^2) is less than or equal to 4?',
    marks: 5,
    topic: 'Continuous Probability',
    options: [
      { id: 'a', text: '2 / π' },
      { id: 'b', text: '1 / π' },
      { id: 'c', text: '4 / (3π)' },
      { id: 'd', text: '1 / 2' }
    ],
    correctOptionId: 'a',
    explanation: 'Area of sample space: quadrant of circle of radius 2 in first quadrant = (1/4) × π × 2^2 = π.\nFavorable area: triangle bounded by x >= 0, y >= 0, and x + y <= 2. Its vertices are (0,0), (2,0), (0,2).\nArea of triangle = (1/2) × 2 × 2 = 2.\nProbability = Favorable Area / Total Area = 2 / π.'
  },
  {
    id: 'adv_4',
    sectionId: 'advanced',
    title: 'Complex Logic Puzzle & Binary Truth-Tellers',
    questionText: 'On an island, inhabitants are either Knights (always speak truth) or Knaves (always lie). Three inhabitants A, B, and C state:\nA says: "All of us are Knaves."\nB says: "Exactly one of us is a Knight."\nWhat are the identities of A, B, and C?',
    marks: 5,
    topic: 'Analytical Deductions',
    options: [
      { id: 'a', text: 'A is Knave, B is Knight, C is Knave' },
      { id: 'b', text: 'A is Knight, B is Knave, C is Knight' },
      { id: 'c', text: 'A is Knave, B is Knave, C is Knight' },
      { id: 'd', text: 'All three are Knaves' }
    ],
    correctOptionId: 'a',
    explanation: 'If A were Knight, then "all are knaves" would be true, which is contradictory. Thus A is a Knave.\nSince A is a Knave, his statement is false (so not all are knaves; at least one knight exists).\nSuppose B is a Knight: Then B speaks the truth, meaning "Exactly one of us is a Knight". Since B is that single Knight, A is Knave and C must be Knave. This is consistent! Identity: A is Knave, B is Knight, C is Knave.'
  },

  // SECTION 5: HANDS-ON CODING (AI LOGIC GRADED)
  {
    id: 'code_1',
    sectionId: 'coding',
    title: 'Problem 1: Maximum Subarray Energy Sum (TCS Ninja Standard)',
    marks: 30,
    topic: 'Arrays & Dynamic Programming',
    questionText: `An IoT sensor deployed in the SMS Lucknow campus computer lab logs energy fluctuations as an array of integers representing positive and negative wattage values.

Task:
Write a program to find the maximum possible sum of a non-empty contiguous subarray of readings. If all readings are negative, return the single greatest negative value.

Input Format:
- First line: An integer N (1 <= N <= 10^5) representing the size of the array.
- Second line: N space-separated integers representing the sensor energy readings.

Output Format:
- Print a single integer representing the maximum subarray sum.

Note on AI Evaluation:
Any programming language is allowed. Minor syntax mistakes (like missing semicolons, standard include slips, or slight formatting discrepancies) will be LENIENTLY IGNORED. Marks are awarded primarily for sound algorithmic logic (e.g. Kadane's Algorithm or valid sliding window/DP approach).`,
    sampleInput: `8\n-2 1 -3 4 -1 2 1 -5 4`,
    sampleExpectedOutput: `6`,
    constraints: [
      '1 <= N <= 100,000',
      '-10^4 <= Array[i] <= 10^4',
      'Time Complexity Target: O(N)',
      'Auxiliary Space Target: O(1)'
    ],
    testCases: [
      { input: '8\n-2 1 -3 4 -1 2 1 -5 4', expected: '6' },
      { input: '5\n1 2 3 4 5', expected: '15' },
      { input: '4\n-5 -2 -8 -1', expected: '-1' },
      { input: '6\n5 4 -1 7 8 -2', expected: '23' }
    ],
    starterTemplates: {
      python: `# TCS NQT Coding - Problem 1 (Kadane's Algorithm)
# School of Management Sciences Lucknow
import sys

def max_energy_sum(n, arr):
    # TODO: Write your algorithmic logic here
    # Return the maximum continuous sub-array sum
    pass

if __name__ == '__main__':
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(max_energy_sum(n, arr))
`,
      cpp: `// TCS NQT Coding - Problem 1 (C++)
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

long long maxEnergySum(int n, const vector<long long>& arr) {
    // TODO: Write your algorithmic logic here
    
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        vector<long long> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        cout << maxEnergySum(n, arr) << endl;
    }
    return 0;
}
`,
      c: `/* TCS NQT Coding - Problem 1 (C) */
#include <stdio.h>

long long maxEnergySum(int n, long long arr[]) {
    // TODO: Write your algorithmic logic here
    
    return 0;
}

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        long long arr[n];
        for (int i = 0; i < n; i++) {
            scanf("%lld", &arr[i]);
        }
        printf("%lld\\n", maxEnergySum(n, arr));
    }
    return 0;
}
`,
      java: `// TCS NQT Coding - Problem 1 (Java)
import java.util.Scanner;

public class Solution {
    public static long maxEnergySum(int n, long[] arr) {
        // TODO: Write your algorithmic logic here
        
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            long[] arr = new long[n];
            for (int i = 0; i < n; i++) {
                arr[i] = sc.nextLong();
            }
            System.out.println(maxEnergySum(n, arr));
        }
    }
}
`,
      javascript: `// TCS NQT Coding - Problem 1 (JavaScript/Node.js)
const fs = require('fs');

function maxEnergySum(n, arr) {
  // TODO: Write your algorithmic logic here
  
  return 0;
}

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (!input || input.length < 2) return;
  const n = parseInt(input[0], 10);
  const arr = input.slice(1, n + 1).map(Number);
  console.log(maxEnergySum(n, arr));
}

solve();
`
    },
    modelSolutions: {
      python: `# Reference Model Solution (Kadane's Algorithm - O(N) Time, O(1) Space)
import sys

def max_energy_sum(n, arr):
    max_so_far = arr[0]
    curr_max = arr[0]
    for i in range(1, n):
        curr_max = max(arr[i], curr_max + arr[i])
        max_so_far = max(max_so_far, curr_max)
    return max_so_far

if __name__ == '__main__':
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        arr = [int(x) for x in data[1:n+1]]
        print(max_energy_sum(n, arr))
`,
      cpp: `// Reference Model Solution (C++ - O(N) Time, O(1) Space)
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (cin >> n) {
        vector<long long> arr(n);
        for (int i = 0; i < n; i++) cin >> arr[i];
        long long max_so_far = arr[0], curr_max = arr[0];
        for (int i = 1; i < n; i++) {
            curr_max = max(arr[i], curr_max + arr[i]);
            max_so_far = max(max_so_far, curr_max);
        }
        cout << max_so_far << endl;
    }
    return 0;
}
`
    }
  },
  {
    id: 'code_2',
    sectionId: 'coding',
    title: 'Problem 2: Optimal Coin & Scholarship Allocation (TCS Digital Standard)',
    marks: 30,
    topic: 'Dynamic Programming & Optimization',
    questionText: `The SMS Lucknow Scholarship Committee has an inventory of N distinct coin denominations. A student is eligible for a grant of total target amount T. 

Task:
Write an algorithm to compute the minimum number of coins needed to make up the exact scholarship amount T. If that amount of money cannot be made up by any combination of the given coins, return -1. You may assume that you have an infinite number of each kind of coin.

Input Format:
- First line: Two integers N and T (1 <= N <= 50, 0 <= T <= 10^4), where N is number of coin denominations and T is the target sum.
- Second line: N space-separated positive integers denoting the coin denominations.

Output Format:
- Print a single integer representing the minimum number of coins required, or -1 if impossible.

Evaluation Note:
Code in any language of your choice. Minor syntax imperfections or slight print nuances are overlooked. AI evaluates logic soundness (e.g. DP array formulation or BFS approach).`,
    sampleInput: `3 11\n1 2 5`,
    sampleExpectedOutput: `3`,
    constraints: [
      '1 <= N <= 50',
      '0 <= T <= 10,000',
      '1 <= Coin[i] <= 1,000',
      'Target Time Complexity: O(N * T)',
      'Target Space Complexity: O(T)'
    ],
    testCases: [
      { input: '3 11\n1 2 5', expected: '3' },
      { input: '1 2\n3', expected: '-1' },
      { input: '1 0\n1', expected: '0' },
      { input: '4 18\n2 5 10 1', expected: '3' }
    ],
    starterTemplates: {
      python: `# TCS NQT Coding - Problem 2 (DP Coin Change)
# School of Management Sciences Lucknow
import sys

def min_coins(n, target, coins):
    # TODO: Write your algorithmic logic here
    # Return minimum coins needed to make amount target, or -1 if impossible
    pass

if __name__ == '__main__':
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        target = int(data[1])
        coins = [int(x) for x in data[2:2+n]]
        print(min_coins(n, target, coins))
`,
      cpp: `// TCS NQT Coding - Problem 2 (C++)
#include <iostream>
#include <vector>
using namespace std;

int minCoins(int n, int target, const vector<int>& coins) {
    // TODO: Write your algorithmic logic here
    
    return -1;
}

int main() {
    int n, target;
    if (cin >> n >> target) {
        vector<int> coins(n);
        for (int i = 0; i < n; i++) cin >> coins[i];
        cout << minCoins(n, target, coins) << endl;
    }
    return 0;
}
`,
      c: `/* TCS NQT Coding - Problem 2 (C) */
#include <stdio.h>

int minCoins(int n, int target, int coins[]) {
    // TODO: Write your algorithmic logic here
    
    return -1;
}

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) == 2) {
        int coins[n];
        for (int i = 0; i < n; i++) scanf("%d", &coins[i]);
        printf("%d\\n", minCoins(n, target, coins));
    }
    return 0;
}
`,
      java: `// TCS NQT Coding - Problem 2 (Java)
import java.util.Scanner;

public class Solution {
    public static int minCoins(int n, int target, int[] coins) {
        // TODO: Write your algorithmic logic here
        
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int target = sc.nextInt();
            int[] coins = new int[n];
            for (int i = 0; i < n; i++) coins[i] = sc.nextInt();
            System.out.println(minCoins(n, target, coins));
        }
    }
}
`,
      javascript: `// TCS NQT Coding - Problem 2 (JavaScript/Node.js)
const fs = require('fs');

function minCoins(n, target, coins) {
  // TODO: Write your algorithmic logic here
  
  return -1;
}

function solve() {
  const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
  if (!input || input.length < 2) return;
  const n = parseInt(input[0], 10);
  const target = parseInt(input[1], 10);
  const coins = input.slice(2, 2 + n).map(Number);
  console.log(minCoins(n, target, coins));
}

solve();
`
    },
    modelSolutions: {
      python: `# Reference Model Solution (DP Coin Change - O(N * T) Time, O(T) Space)
import sys

def min_coins(n, target, coins):
    dp = [float('inf')] * (target + 1)
    dp[0] = 0
    for coin in coins:
        for i in range(coin, target + 1):
            if dp[i - coin] != float('inf'):
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[target] if dp[target] != float('inf') else -1

if __name__ == '__main__':
    data = sys.stdin.read().split()
    if data:
        n = int(data[0])
        target = int(data[1])
        coins = [int(x) for x in data[2:2+n]]
        print(min_coins(n, target, coins))
`,
      cpp: `// Reference Model Solution (C++ - DP Coin Change)
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n, target;
    if (cin >> n >> target) {
        vector<int> coins(n);
        for (int i = 0; i < n; i++) cin >> coins[i];
        
        vector<int> dp(target + 1, target + 2);
        dp[0] = 0;
        for (int coin : coins) {
            for (int i = coin; i <= target; i++) {
                dp[i] = min(dp[i], dp[i - coin] + 1);
            }
        }
        cout << (dp[target] > target ? -1 : dp[target]) << endl;
    }
    return 0;
}
`
    }
  }
];
