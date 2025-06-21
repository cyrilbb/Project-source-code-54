"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getGames() {
  const games = await prisma.game.findMany({
    orderBy: {
      id: "asc",
    },
  })

  return games
}

export async function getGameById(id: number) {
  const game = await prisma.game.findUnique({
    where: {
      id,
    },
  })

  return game
}

export async function getUserGameStats() {
  const user = await getCurrentUser()
  if (!user) return null

  // Get total games played
  const gamesPlayed = await prisma.gameScore.count({
    where: {
      userId: user.id,
    },
  })

  // Get total score across all games
  const totalScore = await prisma.gameScore.aggregate({
    where: {
      userId: user.id,
    },
    _sum: {
      score: true,
    },
  })

  // Get highest scores for each game
  const highScores = await prisma.$queryRaw`
    SELECT g.id, g.name, MAX(gs.score) as high_score
    FROM game_scores gs
    JOIN games g ON gs.game_id = g.id
    WHERE gs.user_id = ${user.id}
    GROUP BY g.id, g.name
    ORDER BY high_score DESC
    LIMIT 3
  `

  // Get recent games
  const recentGames = await prisma.gameScore.findMany({
    where: {
      userId: user.id,
    },
    include: {
      game: true,
    },
    orderBy: {
      playedAt: "desc",
    },
    take: 5,
  })

  return {
    gamesPlayed,
    totalScore: totalScore._sum.score || 0,
    highScores,
    recentGames,
  }
}

export async function submitGameScore(gameId: number, score: number) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  // Record the score
  const gameScore = await prisma.gameScore.create({
    data: {
      userId: user.id,
      gameId,
      score,
      playedAt: new Date(),
    },
    include: {
      game: true,
    },
  })

  // Update user XP
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      xpPoints: {
        increment: Math.floor(score / 10), // Award 1 XP for every 10 points
      },
    },
  })

  // Check for achievements
  await checkForAchievements(user.id, gameId, score)

  revalidatePath("/games")
  return gameScore
}

async function checkForAchievements(userId: number, gameId: number, score: number) {
  // Get total games played by user
  const gamesPlayedCount = await prisma.gameScore.count({
    where: {
      userId,
    },
  })

  // Get distinct games played
  const distinctGamesPlayed = await prisma.gameScore.groupBy({
    by: ["gameId"],
    where: {
      userId,
    },
  })

  // Achievement: First Game
  if (gamesPlayedCount === 1) {
    await awardAchievement(userId, "FIRST_GAME")
  }

  // Achievement: Game Master (played 5 different games)
  if (distinctGamesPlayed.length === 5) {
    await awardAchievement(userId, "GAME_MASTER")
  }

  // Achievement: High Scorer (score over 1000 in any game)
  if (score >= 1000) {
    await awardAchievement(userId, "HIGH_SCORER")
  }

  // Achievement: Dedicated Player (played 10 games)
  if (gamesPlayedCount === 10) {
    await awardAchievement(userId, "DEDICATED_PLAYER")
  }
}

async function awardAchievement(userId: number, achievementCode: string) {
  // Find the achievement
  const achievement = await prisma.achievement.findFirst({
    where: {
      name: {
        contains: achievementCode,
      },
    },
  })

  if (!achievement) return

  // Check if user already has this achievement
  const existingAchievement = await prisma.userAchievement.findFirst({
    where: {
      userId,
      achievementId: achievement.id,
    },
  })

  if (existingAchievement) return

  // Award the achievement
  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
      earnedAt: new Date(),
    },
  })

  // Award XP for the achievement
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      xpPoints: {
        increment: achievement.xpReward,
      },
    },
  })
}

export async function getGameLeaderboard(gameId: number) {
  const leaderboard = await prisma.gameScore.findMany({
    where: {
      gameId,
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      score: "desc",
    },
    take: 10,
  })

  return leaderboard
}

export async function getGameChallenges(gameId: number) {
  // In a real implementation, you would fetch challenges from the database
  // For this demo, we'll return mock challenges based on the game ID

  const debugGameChallenges = [
    {
      id: 1,
      title: "Fix the Syntax Error",
      description: "Find and fix the syntax error in this Python code.",
      language: "python",
      code: "def calculate_sum(a, b)\n    return a + b\n\nprint(calculate_sum(5, 10))",
      solution: "def calculate_sum(a, b):\n    return a + b\n\nprint(calculate_sum(5, 10))",
      hint: "Check the function definition line carefully.",
      points: 100,
    },
    {
      id: 2,
      title: "Fix the Logic Error",
      description: "This function should return the average of an array, but it's not working correctly.",
      language: "javascript",
      code: "function calculateAverage(numbers) {\n  let sum = 0;\n  for (let i = 0; i <= numbers.length; i++) {\n    sum += numbers[i];\n  }\n  return sum / numbers.length;\n}\n\nconsole.log(calculateAverage([10, 20, 30, 40]));",
      solution:
        "function calculateAverage(numbers) {\n  let sum = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    sum += numbers[i];\n  }\n  return sum / numbers.length;\n}\n\nconsole.log(calculateAverage([10, 20, 30, 40]));",
      hint: "Check the loop condition carefully.",
      points: 150,
    },
  ]

  const quizChallenges = [
    {
      id: 1,
      question: "Which of the following is NOT a valid JavaScript data type?",
      options: ["String", "Number", "Boolean", "Float"],
      correctAnswer: "Float",
      explanation:
        "JavaScript has String, Number, Boolean, Object, Undefined, Null, Symbol, and BigInt data types. Float is not a distinct type; floating-point numbers are part of the Number type.",
      points: 50,
    },
    {
      id: 2,
      question: "What will be the output of the following Python code?\n\nx = 5\ny = 10\nprint(x + y * 2)",
      options: ["25", "30", "15", "20"],
      correctAnswer: "25",
      explanation:
        "In Python, multiplication has higher precedence than addition. So y * 2 is calculated first (10 * 2 = 20), then added to x (5 + 20 = 25).",
      points: 75,
    },
  ]

  const algorithmChallenges = [
    {
      id: 1,
      title: "Reverse a String",
      description: "Write a function that reverses a string without using the built-in reverse() method.",
      language: "javascript",
      code: "function reverseString(str) {\n  // Your code here\n}\n\nconsole.log(reverseString('hello'));",
      testCases: [
        { input: "hello", expected: "olleh" },
        { input: "javascript", expected: "tpircsavaj" },
      ],
      hint: "Try using a loop that starts from the end of the string.",
      points: 200,
    },
    {
      id: 2,
      title: "Find the Missing Number",
      description: "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the missing number.",
      language: "python",
      code: "def find_missing_number(nums):\n    # Your code here\n\nprint(find_missing_number([3, 0, 1]))",
      testCases: [
        { input: [3, 0, 1], expected: 2 },
        { input: [9, 6, 4, 2, 3, 5, 7, 0, 1], expected: 8 },
      ],
      hint: "Consider using the sum formula for the first n natural numbers.",
      points: 250,
    },
  ]

  const codeCompletionChallenges = [
    {
      id: 1,
      title: "Complete the Function",
      description: "Complete the function to check if a number is prime.",
      language: "python",
      code: "def is_prime(n):\n    if n <= 1:\n        return False\n    if n <= 3:\n        return True\n    if n % 2 == 0 or n % 3 == 0:\n        return False\n    # Complete the function\n\nprint(is_prime(17))",
      solution:
        "def is_prime(n):\n    if n <= 1:\n        return False\n    if n <= 3:\n        return True\n    if n % 2 == 0 or n % 3 == 0:\n        return False\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i + 2) == 0:\n            return False\n        i += 6\n    return True\n\nprint(is_prime(17))",
      hint: "You need to check divisibility by numbers of the form 6k ± 1.",
      points: 175,
    },
  ]

  // Return different challenges based on game ID
  switch (gameId) {
    case 1: // Debug Challenge
      return debugGameChallenges
    case 2: // Syntax Quiz
      return quizChallenges
    case 3: // Algorithm Challenge
      return algorithmChallenges
    case 4: // Code Completion
      return codeCompletionChallenges
    default:
      return []
  }
}
