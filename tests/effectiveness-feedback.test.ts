import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockPrincipal = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockUserPrincipal = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
const mockBlockHeight = 100

// Mock state
let lastUserId = 0
let lastFeedbackId = 0
let lastAssessmentId = 0
let lastImprovementId = 0
const users = new Map()
const toolFeedback = new Map()
const professionalAssessments = new Map()
const improvementSuggestions = new Map()

// Mock contract functions
const registerUser = (
    name,
    disabilityType,
    specificNeeds,
    contactInfo,
    preferredCommunication,
    owner = mockUserPrincipal,
) => {
  const newId = lastUserId + 1
  lastUserId = newId
  
  users.set(newId, {
    owner,
    name,
    disabilityType,
    specificNeeds,
    contactInfo,
    preferredCommunication,
    registrationDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getUser = (id) => {
  const user = users.get(id)
  return user ? user : null
}

const updateUser = (id, specificNeeds, contactInfo, preferredCommunication, owner = mockUserPrincipal) => {
  const user = users.get(id)
  if (!user) return { error: 404 }
  if (user.owner !== owner) return { error: 403 }
  
  users.set(id, {
    ...user,
    specificNeeds,
    contactInfo,
    preferredCommunication,
  })
  
  return { value: id }
}

const submitFeedback = (
    userId,
    designId,
    contractId,
    usabilityRating,
    effectivenessRating,
    comfortRating,
    durabilityRating,
    comments,
    usageDurationDays,
    usageFrequency,
    owner = mockUserPrincipal,
) => {
  const user = users.get(userId)
  if (!user) return { error: 404 }
  if (user.owner !== owner) return { error: 403 }
  
  const newId = lastFeedbackId + 1
  lastFeedbackId = newId
  
  toolFeedback.set(newId, {
    userId,
    designId,
    contractId,
    usabilityRating,
    effectivenessRating,
    comfortRating,
    durabilityRating,
    comments,
    usageDurationDays,
    usageFrequency,
    submissionDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getFeedback = (id) => {
  const feedback = toolFeedback.get(id)
  return feedback ? feedback : null
}

const submitAssessment = (designId, userId, assessmentType, findings, recommendations, followUpNeeded) => {
  const newId = lastAssessmentId + 1
  lastAssessmentId = newId
  
  professionalAssessments.set(newId, {
    assessor: mockPrincipal,
    designId,
    userId,
    assessmentType,
    findings,
    recommendations,
    assessmentDate: mockBlockHeight,
    followUpNeeded,
  })
  
  return { value: newId }
}

const getAssessment = (id) => {
  const assessment = professionalAssessments.get(id)
  return assessment ? assessment : null
}

const submitImprovement = (designId, suggestionType, description, expectedBenefits, implementationDifficulty) => {
  const newId = lastImprovementId + 1
  lastImprovementId = newId
  
  improvementSuggestions.set(newId, {
    designId,
    suggestedBy: mockPrincipal,
    suggestionType,
    description,
    expectedBenefits,
    implementationDifficulty,
    submissionDate: mockBlockHeight,
  })
  
  return { value: newId }
}

const getImprovement = (id) => {
  const improvement = improvementSuggestions.get(id)
  return improvement ? improvement : null
}

describe("Effectiveness Feedback Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    lastUserId = 0
    lastFeedbackId = 0
    lastAssessmentId = 0
    lastImprovementId = 0
    users.clear()
    toolFeedback.clear()
    professionalAssessments.clear()
    improvementSuggestions.clear()
  })
  
  it("should register a new user", () => {
    const result = registerUser(
        "John Smith",
        "Limited hand mobility, arthritis",
        "Difficulty gripping small objects, needs larger diameter handles",
        "john.smith@example.com, 555-987-6543",
        "Email preferred, text for urgent matters",
    )
    
    expect(result.value).toBe(1)
    expect(users.size).toBe(1)
    
    const user = getUser(1)
    expect(user).not.toBeNull()
    expect(user.name).toBe("John Smith")
    expect(user.disabilityType).toBe("Limited hand mobility, arthritis")
    expect(user.specificNeeds).toContain("larger diameter handles")
    expect(user.preferredCommunication).toBe("Email preferred, text for urgent matters")
  })
  
  it("should update user information", () => {
    // First register a user
    registerUser(
        "John Smith",
        "Limited hand mobility, arthritis",
        "Difficulty gripping small objects, needs larger diameter handles",
        "john.smith@example.com, 555-987-6543",
        "Email preferred, text for urgent matters",
    )
    
    // Then update it
    const updateResult = updateUser(
        1,
        "Difficulty gripping small objects, needs larger diameter handles, prefers soft-touch materials",
        "john.smith@example.com, 555-987-6543, 555-123-4567 (caregiver)",
        "Email preferred, text for urgent matters, can schedule video calls with advance notice",
    )
    
    expect(updateResult.value).toBe(1)
    
    const user = getUser(1)
    expect(user.specificNeeds).toContain("soft-touch materials")
    expect(user.contactInfo).toContain("caregiver")
    expect(user.preferredCommunication).toContain("video calls")
  })
  
  it("should submit tool feedback", () => {
    // First register a user
    registerUser(
        "John Smith",
        "Limited hand mobility, arthritis",
        "Difficulty gripping small objects, needs larger diameter handles",
        "john.smith@example.com, 555-987-6543",
        "Email preferred, text for urgent matters",
    )
    
    // Submit feedback
    const result = submitFeedback(
        1, // user ID
        1, // design ID
        1, // contract ID
        4, // usability rating (out of 5)
        5, // effectiveness rating
        3, // comfort rating
        4, // durability rating
        "The grip is excellent and helps me hold utensils securely. Could be more comfortable for extended use.",
        30, // usage duration days
        "Daily, multiple times",
    )
    
    expect(result.value).toBe(1)
    expect(toolFeedback.size).toBe(1)
    
    const feedback = getFeedback(1)
    expect(feedback).not.toBeNull()
    expect(feedback.userId).toBe(1)
    expect(feedback.designId).toBe(1)
    expect(feedback.usabilityRating).toBe(4)
    expect(feedback.effectivenessRating).toBe(5)
    expect(feedback.comfortRating).toBe(3)
    expect(feedback.comments).toContain("grip is excellent")
    expect(feedback.usageFrequency).toBe("Daily, multiple times")
  })
  
  it("should submit professional assessments", () => {
    // First register a user
    registerUser(
        "John Smith",
        "Limited hand mobility, arthritis",
        "Difficulty gripping small objects, needs larger diameter handles",
        "john.smith@example.com, 555-987-6543",
        "Email preferred, text for urgent matters",
    )
    
    // Submit assessment
    const result = submitAssessment(
        1, // design ID
        1, // user ID
        "Occupational Therapy",
        "Tool significantly improves grip strength and control. User shows 30% increase in independent eating ability.",
        "Consider adding a weighted base for increased stability. Recommend softer material at thumb contact point.",
        true,
    )
    
    expect(result.value).toBe(1)
    expect(professionalAssessments.size).toBe(1)
    
    const assessment = getAssessment(1)
    expect(assessment).not.toBeNull()
    expect(assessment.designId).toBe(1)
    expect(assessment.userId).toBe(1)
    expect(assessment.assessmentType).toBe("Occupational Therapy")
    expect(assessment.findings).toContain("30% increase")
    expect(assessment.recommendations).toContain("weighted base")
    expect(assessment.followUpNeeded).toBe(true)
  })
  
  it("should submit improvement suggestions", () => {
    const result = submitImprovement(
        1, // design ID
        "Ergonomic Enhancement",
        "Add contoured finger grooves to the grip surface for better control and reduced fatigue",
        "Improved precision, reduced hand fatigue, better long-term comfort",
        "Moderate",
    )
    
    expect(result.value).toBe(1)
    expect(improvementSuggestions.size).toBe(1)
    
    const improvement = getImprovement(1)
    expect(improvement).not.toBeNull()
    expect(improvement.designId).toBe(1)
    expect(improvement.suggestionType).toBe("Ergonomic Enhancement")
    expect(improvement.description).toContain("contoured finger grooves")
    expect(improvement.expectedBenefits).toContain("reduced hand fatigue")
    expect(improvement.implementationDifficulty).toBe("Moderate")
  })
})

