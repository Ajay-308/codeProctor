import { Clock, Code2, Calendar, Users } from "lucide-react";

export interface CodeQuestion {
  id: string;
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode: Record<string, string>;
  constraints?: string[];
}

export const interviewCategories = [
  { id: "upcoming", title: "Upcoming Interviews", variant: "outline" },
  { id: "completed", title: "Completed", variant: "secondary" },
  { id: "succeeded", title: "Succeeded", variant: "default" },
  { id: "failed", title: "Failed", variant: "destructive" },
] as const;

export const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "12:42",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export const quickActions = [
  {
    icon: Code2,
    title: "New Call",
    description: "Start an instant call",
    color: "primary",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: Users,
    title: "Join Interview",
    description: "Enter via invitation link",
    color: "purple-500",
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    icon: Calendar,
    title: "Schedule",
    description: "Plan upcoming interviews",
    color: "blue-500",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  {
    icon: Clock,
    title: "Recordings",
    description: "Access past interviews",
    color: "orange-500",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
];

export type QuickActionType = (typeof quickActions)[number];

export const languages = [
  { id: "javascript", name: "JavaScript", icon: "/javascript.png" },
  { id: "python", name: "Python", icon: "/python.png" },
  { id: "java", name: "Java", icon: "/java.png" },
  { id: "cpp", name: "C++", icon: "/cpp.png" },
  { id: "csharp", name: "C#", icon: "/csharp.png" },
  { id: "go", name: "Go", icon: "/go.png" },
  { id: "rust", name: "Rust", icon: "/rust.png" },
] as const;

export const codingQuestions: CodeQuestion[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers `nums` and an integer `target`, return indices of the two numbers in the array such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
        // Write your solution here
      }`,
      python: `def two_sum(nums, target):
          # Write your solution here
          pass`,
      java: `class Solution {
          public int[] twoSum(int[] nums, int target) {
              // Write your solution here
          }
      }`,
      csharp: `public class Solution {
          public int[] TwoSum(int[] nums, int target) {
              // Write your solution here
          }
      }`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
      }`,
      go: `func twoSum(nums []int, target int) []int {
          // Write your solution here
          return nil
      }`,
      rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
          // Write your solution here
          vec![]
      }`,
    },
    constraints: [
      "2 ≤ nums.length ≤ 104",
      "-109 ≤ nums[i] ≤ 109",
      "-109 ≤ target ≤ 109",
      "Only one valid answer exists.",
    ],
  },
  {
    id: "Minimum_operations",
    title: "Minimum Number of Operations to Make Elements in Array Distinct",
    description:
      "Given an integer array nums, return the minimum number of operations to make all the elements in nums distinct.",
    examples: [
      {
        input: "nums = [1,2,3,4,2,3,3,5,7]",
        output: "2",
        explanation: `In the first operation, the first 3 elements are removed, resulting in the array [4, 2, 3, 3, 5, 7].
            In the second operation, the next 3 elements are removed, resulting in the array [3, 5, 7], which has distinct elements.
            Therefore, the answer is 2.`,
      },
    ],
    starterCode: {
      javascript: `function minOperations(nums) {
        // Write your solution here
      }`,
      python: `def min_operations(nums):
          # Write your solution here
          pass`,
      java: `class Solution {
          public int minOperations(int[] nums) {
              // Write your solution here
          }
      }`,
      csharp: `public class Solution {
          public int MinOperations(int[] nums) {
              // Write your solution here
          }
      }`,
      cpp: `int minOperations(vector<int>& nums) {
        // Write your solution here
      }`,
      go: `func minOperations(nums []int) int {
          // Write your solution here
          return 0
      }`,
      rust: `fn min_operations(nums: Vec<i32>) -> i32 {
          // Write your solution here
          0
      }`,
    },
    constraints: ["1 <= nums.length <= 100", "1 <= nums[i] <= 100"],
  },
];
